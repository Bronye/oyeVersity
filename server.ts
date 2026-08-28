import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Safe multi-model caller that tries modern flash-lite first, then alternates, and gracefully returns null on quota exhaustion
async function callGeminiSafe(ai: GoogleGenAI, config: any): Promise<any> {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-flash-latest'];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        ...config,
        model
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      console.warn(`[Gemini API] Model ${model} notice (${err?.status || err?.message?.slice(0, 60)}). Checking fallback...`);
    }
  }
  return null;
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString()
  });
});

// Helper to sanitize any residual LaTeX notation into clean, readable math
function cleanMathLaTeX(text: string): string {
  if (!text) return '';
  let s = text;
  
  // Remove clinical metadata line if present
  s = s.replace(/\*\*Calibrated for:\*\*.*?\n/gi, '');
  s = s.replace(/Calibrated for:.*?\n/gi, '');

  // Replace block math wrappers \[ ... \] and $$ ... $$
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, '$1');
  s = s.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
  
  // Replace inline math wrappers \( ... \) and $ ... $
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, '$1');
  s = s.replace(/\$([^\$\n]+?)\$/g, '$1');

  // Fractions: \frac{a}{b} -> a/b
  s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2');
  
  // Text blocks in math: \text{...} -> ...
  s = s.replace(/\\text\{([^{}]+)\}/g, '$1');
  s = s.replace(/\\mathrm\{([^{}]+)\}/g, '$1');
  s = s.replace(/\\mathbf\{([^{}]+)\}/g, '$1');
  s = s.replace(/\\mathit\{([^{}]+)\}/g, '$1');
  
  // Roots
  s = s.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');
  
  // Math operators
  s = s.replace(/\\times/g, '×');
  s = s.replace(/\\cdot/g, '·');
  s = s.replace(/\\div/g, '÷');
  s = s.replace(/\\pm/g, '±');
  s = s.replace(/\\leq?/g, '≤');
  s = s.replace(/\\geq?/g, '≥');
  s = s.replace(/\\neq?/g, '≠');
  s = s.replace(/\\approx/g, '≈');
  s = s.replace(/\\degree/g, '°');
  s = s.replace(/\\circ/g, '°');
  s = s.replace(/\\pi/g, 'π');
  s = s.replace(/\\theta/g, 'θ');
  
  // Superscripts
  s = s.replace(/\^2\b/g, '²');
  s = s.replace(/\^3\b/g, '³');
  
  // Clean stray lone dollar signs
  s = s.replace(/\$/g, '');
  
  // Clean backslashes before common words
  s = s.replace(/\\([a-zA-Z]+)/g, '$1');
  
  return s.trim();
}

// Socratic Tutor Route ("Ask Amoye")
app.post('/api/gemini/socratic-tutor', async (req: Request, res: Response) => {
  const { 
    prompt, 
    userAge = 13, 
    classLevel = 'JSS 1', 
    subject = 'Mathematics',
    mode = 'socratic', 
    imageBase64, 
    history = [] 
  } = req.body;

  if (!prompt && !imageBase64) {
    return res.status(400).json({ error: 'Prompt or image is required' });
  }

  // Built-in intelligent Socratic heuristic fallback for offline / mock / no-key mode
  const getFallbackResponse = () => {
    const rawTopic = prompt ? prompt.trim().replace(/[?.!]+$/, '') : 'this concept';
    const topic = rawTopic.length > 50 ? `${rawTopic.slice(0, 47)}...` : rawTopic;
    const lower = (prompt || '').toLowerCase();
    
    // Anti-cheating homework / test detection
    const isDirectAnswerRequest = /solve this|what is the answer|give me the answer|do my homework|exam question|assignment|test question|calculate|evaluate|find the value|find x/i.test(lower);
    
    if (isDirectAnswerRequest || /3x\s*\+\s*5\s*=\s*20/i.test(lower)) {
      return {
        text: `### 💡 Guiding Your Curiosity: Balancing Equations Step-by-Step

Welcome! I see you are working on a practice problem. Let's walk through the method together using an everyday balance so you can solve equations like this with total confidence!

#### 1. The Roadside Market Scale Breakdown
Picture an everyday two-pan balance scale at a local market:
- On the left pan: You have 3 mystery sealed tins (3x) plus 5 loose one-naira coins (+ 5).
- On the right pan: You have 20 loose one-naira coins.
- The scale is balanced completely level!

#### 2. Step-by-Step Understanding
1. **The Golden Rule of Balance:** Whatever you take away from one pan, you must also take away from the other pan to keep it balanced.
2. **Clear the loose coins first:** Take away 5 coins from both sides. Now 3 tins balance 15 coins (3x = 15).
3. **Share into equal portions:** Divide the 15 coins evenly across the 3 tins.

#### 3. Guiding Question for You
👉 **What do you think?** If 3 identical tins balance 15 coins equally, how many coins are inside just one tin?`,
        topic: 'Linear Equations',
        isHomeworkOrTest: true,
        suggestedQuestions: [
          "Each tin holds 5 coins (x = 5)",
          "Why do we subtract 5 from both sides first?",
          "Can we try another equation together?"
        ],
        analogy: "A two-pan market scale balancing mystery tins against naira coins.",
        flashcards: [
          {
            front: "What is the golden rule when solving an equation?",
            back: "Whatever operation you perform on one side, you must perform on the other side to keep the balance equal.",
            analogy: "Keeping both pans of a market scale balanced."
          },
          {
            front: "In the equation 3x + 5 = 20, what is x called?",
            back: "x is a variable or unknown value that we are finding.",
            analogy: "A closed mystery box whose contents we want to count."
          }
        ],
        quiz: {
          title: "Linear Equations Practice",
          questions: [
            {
              question: "If 2x + 4 = 14, what is the best first step to take?",
              options: [
                "Subtract 4 from both sides",
                "Divide everything by 14",
                "Add 4 to both sides",
                "Multiply 2 by 14"
              ],
              correctIndex: 0,
              explanation: "Clearing loose constants first by subtracting 4 from both sides leaves 2x = 10.",
              everydayAnalogy: "Take off the loose extra weights before opening the mystery boxes."
            },
            {
              question: "If 3 tins balance 15 coins, how many coins are in one tin?",
              options: ["3 coins", "5 coins", "10 coins", "15 coins"],
              correctIndex: 1,
              explanation: "15 divided by 3 equals 5 coins per tin.",
              everydayAnalogy: "Sharing 15 pieces of groundnut equally among 3 friends."
            }
          ]
        }
      };
    }

    if (lower.includes('fraction') || lower.includes('denominator') || lower.includes('half')) {
      return {
        text: `### 💡 Guiding Your Curiosity: Understanding Fractions

Welcome! Fractions are wonderful once you connect them to how we share food at home. Let's explore how they work!

#### 1. The Fresh Agege Bread Breakdown
Fractions become crystal clear when you picture sharing food with family:
- **Denominator (bottom number):** How many equal slices you cut the whole loaf into.
- **Numerator (top number):** How many slices you are holding in your hand.

If you cut a loaf into 4 equal slices and take 1, you hold 1/4.
If your friend cuts an identical loaf into 2 big slices and takes 1, they hold 1/2.
Even though 2 is a smaller number than 4, the 1/2 slice is twice as big as the 1/4 slice because the loaf was shared among fewer portions!

#### 2. Step-by-Step Understanding
1. **Notice slice size:** The larger the bottom number, the smaller each slice is.
2. **Find matching slices:** To compare or add fractions, cut them into equal-sized pieces (common denominator).
3. **Count the pieces:** Add or subtract only the top numbers once slice sizes match.

#### 3. Guiding Question for You
👉 **Picture this:** How many 1/4 slices of bread do you need to combine to equal one single 1/2 slice?`,
        topic: 'Fractions & Proportions',
        isHomeworkOrTest: false,
        suggestedQuestions: [
          "2 slices of 1/4 equal 1/2",
          "What happens when we add 1/3 and 1/6?",
          "Can you test me with a fraction question?"
        ],
        analogy: "Sharing Agege bread slices among siblings at the breakfast table.",
        flashcards: [
          {
            front: "What does the denominator in a fraction represent?",
            back: "The total number of equal parts the whole is divided into.",
            analogy: "The total slices cut from an Agege loaf."
          },
          {
            front: "Which is larger: 1/3 or 1/5 of the same item?",
            back: "1/3 is larger because cutting into 3 gives bigger portions than cutting into 5.",
            analogy: "Fewer people sharing means bigger portions for each person."
          }
        ],
        quiz: {
          title: "Fractions & Portions Quick Check",
          questions: [
            {
              question: "If a pizza is cut into 8 equal slices and you eat 2, what fraction did you eat?",
              options: ["2/8 (or 1/4)", "1/8", "8/2", "3/8"],
              correctIndex: 0,
              explanation: "2 slices out of 8 equal slices is 2/8, which simplifies to 1/4.",
              everydayAnalogy: "Taking 2 slices out of an 8-slice pie."
            }
          ]
        }
      };
    }

    if (lower.includes('energy') || lower.includes('work') || lower.includes('force')) {
      return {
        text: `### 💡 Guiding Your Curiosity: Scientific Work and Force

Welcome! Let's explore what work really means in science, because it might surprise you compared to everyday conversation!

#### 1. The Water Jerrycan vs Concrete Wall Breakdown
In everyday speech, we say "I did hard work!" after thinking or sitting in class. But in science, Work has a very specific rule:

Work = Force applied × Distance moved

- If you push against a solid concrete borehole wall with all your strength, you applied force! But did the wall move? Zero meters. In science: Force × 0 = 0 Joules of work!
- But if you lift a 20-liter yellow jerrycan of water and carry it 10 meters across the compound, you applied force AND moved it 10 meters. That is real scientific work!

#### 2. Step-by-Step Understanding
1. **Check for force:** Is an effort, push, or pull being applied?
2. **Check for movement:** Did the object actually change position in the direction of the force?
3. **Calculate:** Multiply Force (Newtons) by Distance (meters) to find Work (Joules).

#### 3. Guiding Question for You
👉 **Quick question:** If a market porter balances a heavy basket on their head while standing completely still waiting for a bus, is scientific work being done? Why or why not?`,
        topic: 'Work, Force & Energy',
        isHomeworkOrTest: false,
        suggestedQuestions: [
          "No work because distance moved is zero",
          "What is the difference between kinetic and potential energy?",
          "Give me a quick 3-question quiz on Work"
        ],
        analogy: "Pushing an immovable borehole wall vs carrying a yellow water jerrycan.",
        flashcards: [
          {
            front: "What is the scientific formula for Work?",
            back: "Work = Force × Distance moved in the direction of the force.",
            analogy: "Carrying a water jerrycan over a physical distance."
          },
          {
            front: "What is the unit of measurement for Work?",
            back: "Joules (J), which equals Newton-meters.",
            analogy: "The metric score of energy transferred."
          }
        ],
        quiz: {
          title: "Work & Force Science Quiz",
          questions: [
            {
              question: "If a 50N force pushes a cart 4 meters, how much work is done?",
              options: ["200 Joules", "54 Joules", "12.5 Joules", "0 Joules"],
              correctIndex: 0,
              explanation: "Work = Force × Distance = 50N × 4m = 200 Joules.",
              everydayAnalogy: "Multiplying your steady push by each meter the cart rolled."
            }
          ]
        }
      };
    }

    // Default age-adaptive Socratic response
    return {
      text: `### 💡 Guiding Your Curiosity: ${topic}

Welcome! I'm delighted you brought up this topic. Let's break it down together with an everyday example so it makes complete sense!

#### 1. Relatable Real-World Breakdown
Whenever we investigate ${topic}, the secret is connecting it to things you can touch and see in your community:
- Think of how a market vendor organizes items or how water fills a container: every big concept is built out of smaller, repeatable steps.

#### 2. Step-by-Step Understanding
1. **Identify the Given Facts:** Look at what you know or what the diagram shows.
2. **Spot the Connection:** Determine what rule, formula, or definition links the start to the solution.
3. **Work Through Gradually:** Break the problem into bite-sized steps.

#### 3. Guiding Question for You
👉 **Over to you:** What part of ${topic} feels most familiar to you right now? Let's take the first step together!`,
      topic,
      isHomeworkOrTest: false,
      suggestedQuestions: [
        "Explain this using an everyday market example",
        "Break this into 3 simple practice steps",
        "Test my understanding with a quick question"
      ],
      analogy: `Everyday ${subject} application grounded in familiar Nigerian community surroundings.`,
      flashcards: [
        {
          front: `Core Idea: ${topic}`,
          back: `The fundamental principle of ${topic} explained in simple everyday terms.`,
          analogy: "Like building a wall block by block."
        }
      ],
      quiz: {
        title: `${topic} Quick Check`,
        questions: [
          {
            question: `What is the most important first step when learning ${topic}?`,
            options: [
              "Break it down into relatable everyday parts",
              "Try to memorize formulas without understanding",
              "Skip the basic definitions",
              "Guess randomly"
            ],
            correctIndex: 0,
            explanation: "Connecting concepts to familiar everyday experiences builds deep, lasting understanding.",
            everydayAnalogy: "Like knowing the road before running along it."
          }
        ]
      }
    };
  };

  const ai = getGeminiClient();
  if (!ai) {
    // Return high quality offline heuristic fallback
    return res.json(getFallbackResponse());
  }

  try {
    const isHomeworkHint = /homework|assignment|test|exam|solve|calculate|evaluate|find x|answer to|question\s*\d/i.test(prompt || '');

    const systemInstruction = `You are "Amoye", an empathetic, brilliant African Socratic AI study companion and teacher for students in Nigerian primary and secondary schools (NERDC / WAEC / BECE aligned).

CRITICAL DIRECTIVES:
1. FORMATTING & READABILITY (NO LATEX):
   - You are STRICTLY FORBIDDEN from using raw LaTeX notation, dollar signs ($ or $$), or LaTeX commands (like \\frac, \\text, \\times, \\div, \\sqrt).
   - Write all mathematics, formulas, and scientific terms in clean, human-readable plain text that any student can easily read (e.g., 'Work = Force applied × Distance moved', '3x + 5 = 20', 'x = 5', '1/4', 'Speed = Distance / Time', 'Water is H2O', 'x²').

2. WARM WELCOMING OPENING (NO CLINICAL METADATA):
   - You MUST begin the response text with:
     ### 💡 Guiding Your Curiosity: [Concept / Topic Name]
   - Follow immediately with a warm, encouraging welcome greeting.
   - Do NOT include clinical metadata lines like "Calibrated for: Age ...", "Subject: ...", or grade tags in the text.

3. HOMEWORK / ASSIGNMENT / TEST DETECTION:
   - Determine if the student query is a homework, assignment, test question, or direct problem to solve.
   - If yes, set "isHomeworkOrTest": true.
   - DO NOT give the final numerical answer directly!
   - Instead, provide GUIDED LEARNING:
     * Warmly encourage the student that this is a great exercise to build their problem-solving muscle.
     * Explain the core principle using a relatable everyday African analogy (e.g., market scale, sharing Agege bread, yellow water jerrycans, firewood bundles, naira coins).
     * Walk through the step-by-step method and strategy for solving it.
     * Conclude with an interactive guiding question prompting them to complete the next step or test their reasoning.

4. RESPONSE STRUCTURE IN TEXT:
   - Section 1: #### 1. Relatable Everyday Breakdown (familiar real-world analogy)
   - Section 2: #### 2. Step-by-Step Understanding (numbered logical steps)
   - Section 3: #### 3. Guiding Question for You (interactive thought-provoking question)

5. GENERATE FLASHCARDS & QUIZZES BEHIND THE SCENES:
   - You MUST generate 2-3 concise digital flashcards ({ front, back, analogy }) testing key concepts of this topic.
   - You MUST generate 2-3 interactive multiple-choice quiz questions ({ question, options: [A, B, C, D], correctIndex: 0-3, explanation, everydayAnalogy }).
   - Note: The flashcards and quiz questions MUST NOT be printed inside the "text" field! They will be stored in the app for offline practice.

You must respond with valid JSON matching this schema:
{
  "text": "Readable Socratic response in markdown with warm greeting",
  "topic": "Concise Topic Name",
  "isHomeworkOrTest": true or false,
  "suggestedQuestions": ["Question 1", "Question 2", "Question 3"],
  "analogy": "Short summary of the everyday analogy",
  "flashcards": [
    { "front": "Question or term", "back": "Clear definition/answer", "analogy": "Everyday connection" }
  ],
  "quiz": {
    "title": "Topic Quiz Title",
    "questions": [
      {
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "Clear explanation",
        "everydayAnalogy": "Everyday analogy connection"
      }
    ]
  }
}`;

    const parts: any[] = [];
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '');
      const mimeTypeMatch = imageBase64.match(/^data:([^;]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }

    parts.push({
      text: `Subject: ${subject}
Class Level: ${classLevel}
Age: ${userAge}
Output Style: ${mode}
${isHomeworkHint ? 'Note: The student may be asking about a homework, assignment, or test problem. Apply guided learning without giving away the direct answer.' : ''}

Student Query:
${prompt || 'Please analyze this diagram or problem and guide me.'}`
    });

    const response = await callGeminiSafe(ai, {
      contents: parts,
      config: {
        responseMimeType: 'application/json',
        systemInstruction,
        temperature: 0.7
      }
    });

    if (!response || !response.text) {
      return res.json(getFallbackResponse());
    }

    const rawText = response.text || '';
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn('Could not parse Gemini JSON response, extracting text:', parseErr);
      parsed = {
        text: rawText,
        topic: prompt ? prompt.slice(0, 30) : 'General Study',
        isHomeworkOrTest: isHomeworkHint
      };
    }

    // Sanitize any residual LaTeX notation
    const cleanedText = cleanMathLaTeX(parsed.text || rawText);

    // Sanitize flashcards and quiz if present
    const sanitizedFlashcards = Array.isArray(parsed.flashcards)
      ? parsed.flashcards.map((f: any) => ({
          front: cleanMathLaTeX(f.front || ''),
          back: cleanMathLaTeX(f.back || ''),
          analogy: cleanMathLaTeX(f.analogy || '')
        }))
      : getFallbackResponse().flashcards;

    const sanitizedQuiz = parsed.quiz && Array.isArray(parsed.quiz.questions)
      ? {
          title: cleanMathLaTeX(parsed.quiz.title || `${parsed.topic || 'Topic'} Quiz`),
          questions: parsed.quiz.questions.map((q: any) => ({
            question: cleanMathLaTeX(q.question || ''),
            options: Array.isArray(q.options) ? q.options.map((opt: any) => cleanMathLaTeX(String(opt))) : [],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
            explanation: cleanMathLaTeX(q.explanation || ''),
            everydayAnalogy: cleanMathLaTeX(q.everydayAnalogy || '')
          }))
        }
      : getFallbackResponse().quiz;

    res.json({
      text: cleanedText,
      topic: parsed.topic || prompt?.slice(0, 35) || 'Curiosity Topic',
      isHomeworkOrTest: Boolean(parsed.isHomeworkOrTest || isHomeworkHint),
      suggestedQuestions: Array.isArray(parsed.suggestedQuestions) && parsed.suggestedQuestions.length > 0
        ? parsed.suggestedQuestions.map((q: any) => cleanMathLaTeX(String(q)))
        : [
            `Can you show another everyday example for this?`,
            `Test my understanding with 1 quick question`,
            `Break down the hardest step in simpler words`
          ],
      analogy: cleanMathLaTeX(parsed.analogy || `Everyday application in ${subject}`),
      flashcards: sanitizedFlashcards,
      quiz: sanitizedQuiz
    });
  } catch (err: any) {
    console.error('Gemini Socratic tutor error:', err);
    // Fallback gracefully on any API error or quota limit
    res.json(getFallbackResponse());
  }
});

// Content Simplification Engine (Age-Adaptive)
app.post('/api/gemini/simplify-content', async (req: Request, res: Response) => {
  const { rawText, targetAge = 11, cognitiveStyle = 'visual-analogy' } = req.body;

  if (!rawText) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Offline simulated simplification
    const simplified = `### 🌟 Simplified for Age ${targetAge} (${cognitiveStyle.replace('-', ' ')})\n\n**The Big Idea:**\nWhen we look at "${rawText.slice(0, 50)}...", think of it like filling water into a 25-liter yellow jerrycan.\n\n- **Key Step 1:** Start with the base unit, just like making sure the container is clean.\n- **Key Step 2:** Group items in equal sets of ten, like bundles of firewood.\n- **Everyday Rule:** Never try to carry more than your container can hold without dividing it into smaller buckets!\n\n*Review note:* Everything here connects to things you can touch and see right in your community!`;
    return res.json({ simplifiedMarkdown: simplified });
  }

  try {
    const prompt = `Rewrite and simplify this academic textbook concept for a ${targetAge}-year-old student whose learning style is ${cognitiveStyle}.
Use zero-cost everyday African analogies (market stalls, water buckets, bicycle gears, palm trees, naira coins).
Output clean Markdown with clear bullet points.

Text to simplify:
"""
${rawText}
"""`;

    const response = await callGeminiSafe(ai, {
      contents: prompt,
      config: {
        systemInstruction: "You are an expert educator specializing in simplifying complex curriculum for students in developing regions.",
        temperature: 0.6
      }
    });

    if (response && response.text) {
      return res.json({ simplifiedMarkdown: response.text });
    }
    
    // Offline simulated simplification
    const simplified = `### 🌟 Simplified for Age ${targetAge} (${cognitiveStyle.replace('-', ' ')})\n\n**The Big Idea:**\nWhen we look at "${rawText.slice(0, 50)}...", think of it like filling water into a 25-liter yellow jerrycan.\n\n- **Key Step 1:** Start with the base unit, just like making sure the container is clean.\n- **Key Step 2:** Group items in equal sets of ten, like bundles of firewood.\n- **Everyday Rule:** Never try to carry more than your container can hold without dividing it into smaller buckets!\n\n*Review note:* Everything here connects to things you can touch and see right in your community!`;
    res.json({ simplifiedMarkdown: simplified });
  } catch (err) {
    console.warn('Simplify content notice (fallback active):', err);
    res.json({
      simplifiedMarkdown: `### 🌟 Simplified Concept (Offline Mode)\n\n**Core Idea:** ${rawText}\n\n**Everyday Analogy:** Think of sharing a basket of ripe oranges among your study group. Each person gets an equal share, and any leftovers represent the remainder in division!`
    });
  }
});

// Automated Study Tools Generator (Quizzes & Flashcards from text)
app.post('/api/gemini/generate-study-tools', async (req: Request, res: Response) => {
  const rawContent = req.body.notesText || req.body.rawText || '';
  const subjectName = req.body.subjectName || req.body.subjectId || 'General Studies';
  const targetAge = req.body.targetAge || 12;

  const fallbackQuiz = {
    id: `quiz-gen-${Date.now()}`,
    subjectId: subjectName.toLowerCase().replace(/\s+/g, '-'),
    title: `Practice: ${rawContent.slice(0, 30) || 'Study Notes'}`,
    difficulty: 'Medium',
    sparksReward: 30,
    xpReward: 50,
    questions: [
      {
        id: `gen-q-${Date.now()}-1`,
        question: `Based on your notes: What is the primary role of the main concept discussed in "${rawContent.slice(0, 30)}..."?`,
        options: [
          'To balance the system and provide equal distribution',
          'To completely stop any energy movement',
          'To increase cost without functional benefit',
          'To store only non-renewable resources'
        ],
        correctIndex: 0,
        explanation: 'The fundamental principle ensures balance and reliable operation in everyday environments.',
        everydayAnalogy: 'Like packing a head-pan evenly so it stays balanced while walking.',
        gapTopic: `${subjectName}: Core Foundations`
      },
      {
        id: `gen-q-${Date.now()}-2`,
        question: 'Which everyday African object best demonstrates this concept?',
        options: [
          'A supersonic jet engine',
          'A two-pan roadside market scale or water jerrycan',
          'A quantum supercomputer',
          'An automated submarine'
        ],
        correctIndex: 1,
        explanation: 'Familiar household tools like market scales and jerrycans provide direct tactile understanding.',
        everydayAnalogy: 'Measuring garri with an equal-sized tin cup.',
        gapTopic: `${subjectName}: Real-world Applications`
      }
    ]
  };

  const fallbackFlashcards = [
    {
      id: `gen-fc-${Date.now()}-1`,
      subjectId: subjectName.toLowerCase().replace(/\s+/g, '-'),
      front: 'Key Definition from Notes',
      back: rawContent.slice(0, 120) || 'Core takeaway from the learning material.',
      analogy: 'Think of this like the foundation blocks laid before building classroom walls.',
      mastered: false,
      reviewCount: 0
    },
    {
      id: `gen-fc-${Date.now()}-2`,
      subjectId: subjectName.toLowerCase().replace(/\s+/g, '-'),
      front: 'Why does this concept matter in everyday life?',
      back: 'It allows you to calculate quantities accurately and make informed decisions.',
      analogy: 'Counting your change carefully after buying provisions at the kiosk.',
      mastered: false,
      reviewCount: 0
    }
  ];

  const fallbackData = {
    simplifiedText: `### 💡 Clear Summary for Age ${targetAge}\n\n**The Big Picture:**\nIn this material, everything connects to practical everyday life in your community. Just like counting naira notes or sharing bread with siblings, every big concept has simple, repeatable building blocks.`,
    analogy: 'A two-pan market scale balancing items so both sides are completely equal.',
    quiz: fallbackQuiz,
    quizQuestions: fallbackQuiz.questions,
    flashcards: fallbackFlashcards
  };

  const ai = getGeminiClient();
  if (!ai) {
    return res.json(fallbackData);
  }

  try {
    const prompt = `From the following study notes, generate:
1. Exactly 2-3 multiple-choice quiz questions (with 4 options, correctIndex 0-3, explanation, everydayAnalogy, and gapTopic).
2. Exactly 2-3 digital flashcards (with front, back, and everydayAnalogy).
3. A simplified 2-paragraph explanation (simplifiedText) and a one-sentence everyday analogy (analogy).

Notes:
"""
${rawContent}
"""

Format your output strictly as a valid JSON object matching this schema:
{
  "simplifiedText": "string",
  "analogy": "string",
  "quizQuestions": [
    {
      "id": "q-1",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "string",
      "everydayAnalogy": "string",
      "gapTopic": "string"
    }
  ],
  "flashcards": [
    {
      "id": "fc-1",
      "subjectId": "custom-notes",
      "front": "string",
      "back": "string",
      "analogy": "string",
      "mastered": false,
      "reviewCount": 0
    }
  ]
}`;

    const response = await callGeminiSafe(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5
      }
    });

    if (response && response.text) {
      const parsed = JSON.parse(response.text || '{}');
      if (parsed.quizQuestions && parsed.flashcards) {
        return res.json({
          simplifiedText: parsed.simplifiedText || fallbackData.simplifiedText,
          analogy: parsed.analogy || fallbackData.analogy,
          quiz: {
            id: `quiz-gen-${Date.now()}`,
            subjectId: subjectName.toLowerCase().replace(/\s+/g, '-'),
            title: `Practice: ${rawContent.slice(0, 30) || 'Study Notes'}`,
            difficulty: 'Medium',
            sparksReward: 30,
            xpReward: 50,
            questions: parsed.quizQuestions
          },
          quizQuestions: parsed.quizQuestions,
          flashcards: parsed.flashcards
        });
      }
    }
    res.json(fallbackData);
  } catch (err) {
    console.warn('Generate study tools notice (fallback active):', err);
    res.json(fallbackData);
  }
});

// Knowledge Gap Diagnostic Engine
app.post('/api/gemini/diagnose-gap', async (req: Request, res: Response) => {
  const { missedQuestions, subjectName = 'Mathematics' } = req.body;

  const fallbackGap = {
    detectedGap: {
      topic: missedQuestions?.[0]?.gapTopic || `${subjectName}: Foundational Concept`,
      diagnosticNote: `The student struggled with ${missedQuestions?.[0]?.question || 'multi-step problem'}. Often occurs when skipping intermediate reduction steps.`,
      everydayAnalogyFix: 'Pouring water through a funnel: do not rush all at once or it overflows. Step by step!',
      sideQuestTitle: `Side Quest: Demystifying ${missedQuestions?.[0]?.gapTopic || 'This Topic'}`,
      parentAdvice: 'Encourage your child to explain their thinking out loud using cups or beans on the dining table.'
    }
  };

  const ai = getGeminiClient();
  if (!ai) {
    return res.json(fallbackGap);
  }

  try {
    const prompt = `Analyze these quiz questions that a Nigerian secondary school student answered incorrectly:
${JSON.stringify(missedQuestions, null, 2)}

Provide a diagnostic assessment:
1. Identify the exact root misunderstanding (e.g. confusing LCM with GCD, or confusing force with work).
2. A concrete, zero-cost everyday analogy to fix the mental model.
3. A title for a 2-minute "Side Quest" challenge to clear this gap.
4. A 1-sentence tip for the student's parent or supervisor.

Output strictly as JSON:
{
  "detectedGap": {
    "topic": "string",
    "diagnosticNote": "string",
    "everydayAnalogyFix": "string",
    "sideQuestTitle": "string",
    "parentAdvice": "string"
  }
}`;

    const response = await callGeminiSafe(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    });

    if (response && response.text) {
      const parsed = JSON.parse(response.text || '{}');
      if (parsed && parsed.detectedGap) {
        return res.json(parsed);
      }
    }
    res.json(fallbackGap);
  } catch (err) {
    console.warn('Diagnose gap notice (fallback active):', err);
    res.json(fallbackGap);
  }
});

// Built-in class level curriculum generator for offline fallback
function getOfflineCurriculumForClass(classLevel: string, customTitle?: string, sourceUrl?: string) {
  const isJSS = classLevel.startsWith('JSS') || classLevel === 'Primary 6';
  const subjects = [
    {
      id: `math-${classLevel.toLowerCase().replace(/\s+/g, '-')}`,
      subject_id: `math-${classLevel.toLowerCase().replace(/\s+/g, '-')}`,
      subject_name: 'Mathematics',
      class: classLevel,
      category: 'Mathematics',
      icon: '📐',
      accentColor: 'blue',
      modules: [
        {
          id: `mod-math-01-${classLevel}`,
          subject_id: `math-${classLevel.toLowerCase().replace(/\s+/g, '-')}`,
          title: isJSS ? 'Numbers, Fractions & Real Proportions' : 'Algebraic Methods & Quadratic Functions',
          order: 1,
          status: 'unlocked',
          total_steps: 3,
          current_step: 1,
          steps: [
            {
              id: `step-m1-1`,
              title: isJSS ? 'Fractions as Real-World Sharing' : 'Factorisation by Inspection',
              summary: isJSS ? 'Understand denominators by sharing Agege bread at home.' : 'Grouping terms like bundling firewood into equal bundles.',
              everydayAnalogy: 'Cutting an Agege loaf: more slices means smaller portions.',
              conceptMarkdown: 'A fraction represents parts of a whole. The denominator tells you how many equal portions exist, while the numerator is how many you hold.',
              quickCheckQuestion: {
                question: 'Which is larger: 1/3 or 1/5 of the same watermelon?',
                options: ['1/3', '1/5', 'They are equal', 'Cannot tell'],
                correctAnswer: 0,
                explanation: 'Cutting into 3 produces larger pieces than cutting into 5.'
              }
            },
            {
              id: `step-m1-2`,
              title: 'The Roadside Market Balance (Equations)',
              summary: 'Whatever you do to one side of the scale, you must do to the other side.',
              everydayAnalogy: 'A two-pan scale: remove 5 naira coins from left pan means removing 5 coins from right pan.',
              conceptMarkdown: 'An equation balances two quantities. When solving 2x + 4 = 14, subtract 4 from both sides to get 2x = 10, then divide by 2 to find x = 5.',
              quickCheckQuestion: {
                question: 'If 2 tins balance 10 coins, how many coins are in one tin?',
                options: ['5 coins', '2 coins', '10 coins', '20 coins'],
                correctAnswer: 0,
                explanation: '10 divided by 2 equals 5 coins per tin.'
              }
            }
          ]
        }
      ],
      sideQuests: [
        {
          id: `sq-math-01`,
          title: 'Roadside Scale Calibration',
          reason: 'Master equation balance using everyday market items.',
          gapTopic: 'Linear Equations & Proportions',
          sparksReward: 40,
          status: 'available'
        }
      ]
    },
    {
      id: `sci-${classLevel.toLowerCase().replace(/\s+/g, '-')}`,
      subject_id: `sci-${classLevel.toLowerCase().replace(/\s+/g, '-')}`,
      subject_name: 'Basic Science & Technology',
      class: classLevel,
      category: 'Sciences',
      icon: '🔬',
      accentColor: 'emerald',
      modules: [
        {
          id: `mod-sci-01-${classLevel}`,
          subject_id: `sci-${classLevel.toLowerCase().replace(/\s+/g, '-')}`,
          title: 'Energy, Forces & Living Organisms',
          order: 1,
          status: 'unlocked',
          total_steps: 3,
          current_step: 1,
          steps: [
            {
              id: `step-s1-1`,
              title: 'Work vs Force: The Water Jerrycan',
              summary: 'Force only does work when an object physically moves.',
              everydayAnalogy: 'Pushing a solid borehole wall does 0 work; carrying a 20L jerrycan across the compound does real work.',
              conceptMarkdown: 'Work = Force applied × Distance moved. If distance is zero, work done is zero Joules.',
              quickCheckQuestion: {
                question: 'If you push an immovable rock with 100N of force, how much scientific work is done?',
                options: ['0 Joules', '100 Joules', '50 Joules', '1000 Joules'],
                correctAnswer: 0,
                explanation: 'Because distance is 0 meters, Work = 100 × 0 = 0 Joules.'
              }
            }
          ]
        }
      ],
      sideQuests: [
        {
          id: `sq-sci-01`,
          title: 'The Compound Dynamo',
          reason: 'Connect energy transfer to a bicycle headlight dynamo.',
          gapTopic: 'Energy Conversion',
          sparksReward: 45,
          status: 'available'
        }
      ]
    },
    {
      id: `eng-${classLevel.toLowerCase().replace(/\s+/g, '-')}`,
      subject_id: `eng-${classLevel.toLowerCase().replace(/\s+/g, '-')}`,
      subject_name: 'English Studies',
      class: classLevel,
      category: 'Languages',
      icon: '📚',
      accentColor: 'amber',
      modules: [
        {
          id: `mod-eng-01-${classLevel}`,
          subject_id: `eng-${classLevel.toLowerCase().replace(/\s+/g, '-')}`,
          title: 'Grammar, Reading & Active Communication',
          order: 1,
          status: 'unlocked',
          total_steps: 2,
          current_step: 1,
          steps: [
            {
              id: `step-e1-1`,
              title: 'Active vs Passive Voice in Daily News',
              summary: 'Identify who is doing the action versus who is receiving it.',
              everydayAnalogy: 'The goat ate the cassava leaves (Active) vs The cassava leaves were eaten by the goat (Passive).',
              conceptMarkdown: 'In active voice, the subject performs the action. It makes writing direct, vivid, and lively.',
              quickCheckQuestion: {
                question: 'Which sentence is written in the active voice?',
                options: [
                  'Kemi kicked the football into the goal.',
                  'The football was kicked by Kemi.',
                  'The goal was scored during the match.',
                  'The whistle was blown by the referee.'
                ],
                correctAnswer: 0,
                explanation: 'Kemi (the subject) directly performs the action of kicking.'
              }
            }
          ]
        }
      ],
      sideQuests: []
    }
  ];

  return {
    learningPlanTitle: customTitle || `NERDC ${classLevel} National Standard Curriculum Plan`,
    classLevel,
    sourceUrl: sourceUrl || undefined,
    subjects,
    overviewNotes: `Tailored curriculum roadmap for ${classLevel} designed with African cultural analogies and structured for 100% offline study.`
  };
}

// Onboarding: Generate Learning Plan from Online Link or Syllabus
app.post('/api/curriculum/import-link', async (req: Request, res: Response) => {
  const { linkUrl, classLevel = 'JSS 1', notesText = '', userAge = 13 } = req.body;

  const offlinePlan = getOfflineCurriculumForClass(
    classLevel, 
    linkUrl ? `Custom Plan: ${linkUrl.replace(/^https?:\/\//, '').slice(0, 30)}` : undefined, 
    linkUrl
  );

  const ai = getGeminiClient();
  if (!ai || (!linkUrl && !notesText)) {
    return res.json(offlinePlan);
  }

  try {
    const prompt = `A Nigerian school student in class level "${classLevel}" (approx ${userAge} years old) wants to import their curriculum from this syllabus source:
Link / Source: ${linkUrl || 'Custom Syllabus'}
Notes / Content excerpt:
"""
${notesText || linkUrl}
"""

Generate a tailored Learning Plan for "${classLevel}" matching the Nigerian NERDC/WAEC curriculum guidelines.
Include 3 primary subjects (Mathematics, Basic Science & Technology, English Studies).
For each subject:
- Provide 1-2 interactive modules with titles and order.
- Each module has 1-2 learning steps with:
  * title
  * summary
  * everydayAnalogy (grounded in everyday African life, e.g. market scale, jerrycan, Agege bread, bicycle dynamo)
  * conceptMarkdown
  * quickCheckQuestion ({ question, options: [4 choices], correctAnswer: 0-3, explanation })
- Provide 1 optional sideQuest.

Format your response strictly as valid JSON matching this schema:
{
  "learningPlanTitle": "Curriculum Plan Title",
  "classLevel": "${classLevel}",
  "subjects": [
    {
      "id": "subject-id",
      "subject_id": "subject-id",
      "subject_name": "Subject Name",
      "class": "${classLevel}",
      "category": "Sciences" | "Mathematics" | "Languages",
      "icon": "emoji icon",
      "accentColor": "blue" | "emerald" | "amber",
      "modules": [
        {
          "id": "mod-1",
          "subject_id": "subject-id",
          "title": "Module Title",
          "order": 1,
          "status": "unlocked",
          "total_steps": 2,
          "current_step": 1,
          "steps": [
            {
              "id": "step-1",
              "title": "Step Title",
              "summary": "Summary",
              "everydayAnalogy": "Everyday African Analogy",
              "conceptMarkdown": "Concept in clean text without LaTeX",
              "quickCheckQuestion": {
                "question": "Question text",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": 0,
                "explanation": "Explanation"
              }
            }
          ]
        }
      ],
      "sideQuests": []
    }
  ]
}`;

    const response = await callGeminiSafe(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6
      }
    });

    if (response && response.text) {
      const parsed = JSON.parse(response.text || '{}');
      if (parsed && Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
        return res.json({
          learningPlanTitle: parsed.learningPlanTitle || `Imported Learning Plan (${classLevel})`,
          classLevel,
          sourceUrl: linkUrl,
          subjects: parsed.subjects
        });
      }
    }
    res.json(offlinePlan);
  } catch (err) {
    console.warn('Curriculum import notice (using structured offline plan):', err);
    res.json(offlinePlan);
  }
});

// Vite middleware & Static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Òyè-versity server running on http://0.0.0.0:${PORT}`);
  });
}

start();
