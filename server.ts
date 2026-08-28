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

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString()
  });
});

// Socratic Tutor Route ("Ask Amoye")
app.post('/api/gemini/socratic-tutor', async (req: Request, res: Response) => {
  const { prompt, userAge = 13, classLevel = 'JSS 1', mode = 'socratic', imageBase64, history = [] } = req.body;

  if (!prompt && !imageBase64) {
    return res.status(400).json({ error: 'Prompt or image is required' });
  }

  // Built-in intelligent Socratic heuristic fallback for offline / mock / no-key mode
  const getFallbackResponse = () => {
    const lower = (prompt || '').toLowerCase();
    
    // Anti-cheating guardrail check
    const isDirectAnswerRequest = /solve this|what is the answer|give me the answer|do my homework|exam question/i.test(lower);
    
    if (isDirectAnswerRequest || /3x\s*\+\s*5\s*=\s*20|calculate|evaluate/i.test(lower)) {
      return {
        text: `### 🛑 Let's Build Your Understanding!\n\nI see you have an equation to solve! In Òyè-versity, we don't hand out direct answers, because when you figure it out yourself, that knowledge stays with you forever.\n\nImagine an **old roadside market scale**:\n- On the left pan: You have 3 mystery boxes ($3x$) plus 5 loose one-naira coins ($+5$).\n- On the right pan: You have 20 one-naira coins.\n- The scale is completely balanced!\n\n👉 **My question for you:** If you want to find out what is in the 3 mystery boxes, what happens if you remove the 5 loose coins from *both* pans first? How many coins are left on the right pan?`,
        suggestedQuestions: [
          "There would be 15 coins left on the right",
          "Why do we remove from both sides?",
          "Show me another everyday analogy"
        ],
        isDirectAnswerAttempt: true,
        analogy: "A two-pan market scale balancing mystery boxes against naira coins."
      };
    }

    if (lower.includes('fraction') || lower.includes('denominator') || lower.includes('half')) {
      return {
        text: `### 🍞 The Agege Bread Rule\n\nFractions can seem tricky until you picture sharing food in your house!\n\nSuppose you have a whole loaf of fresh Agege bread:\n1. **Denominator (Bottom number):** How many equal slices the knife cuts the bread into.\n2. **Numerator (Top number):** How many slices you are holding in your hand.\n\nIf you cut the loaf into 4 equal slices and take 1, you have $1/4$.\nIf your sister cuts her identical loaf into 2 big slices and takes 1, she has $1/2$.\n\nNotice: Even though 2 is smaller than 4, **her 1/2 slice is twice as big as your 1/4 slice!**\n\n👉 **Question for you:** How many of your $1/4$ slices would you need to put together to equal her single $1/2$ slice?`,
        suggestedQuestions: [
          "I would need 2 slices of 1/4",
          "What if we need to add 1/3 and 1/6?",
          "Turn this into 3 practice flashcards"
        ],
        analogy: "Sharing Agege bread slices among family members."
      };
    }

    if (lower.includes('energy') || lower.includes('work') || lower.includes('force')) {
      return {
        text: `### 🛢️ The Jerrycan Borehole Challenge\n\nIn everyday life, we say "I did so much work carrying water today!" But in science, **Work** has a very strict mathematical definition:\n\n$$\\text{Work} = \\text{Force (effort)} \\times \\text{Distance moved}$$\n\nImagine you try to push a giant concrete borehole wall with all your strength for 30 minutes until you sweat. \n- **Did you push hard?** Yes! (Great Force).\n- **Did the wall move?** Zero centimeters (Distance = 0).\n- **Scientific Work done:** $Force \\times 0 = 0 \\text{ Joules}!$\n\nNow imagine you carry a 20-liter yellow jerrycan of water from the tap to your kitchen (15 meters). You applied force AND moved it 15 meters. That IS scientific work!\n\n👉 **Try this:** If you lift a 5kg bucket of water 2 meters high, what two things are multiplying together?`,
        suggestedQuestions: [
          "Weight of the bucket and the 2 meters height",
          "Why is holding something still not work?",
          "Give me a quick 3-question quiz on this"
        ],
        analogy: "Pushing a concrete borehole wall vs carrying a yellow water jerrycan."
      };
    }

    // Default friendly Socratic response
    return {
      text: `### 💡 Guiding Your Curiosity\n\nYou asked about: **"${prompt || 'this diagram'}"**.\n\nTo understand this for your ${classLevel} level (around age ${userAge}), let's break it down into familiar steps:\n\n1. What do you already know about this topic from your everyday surroundings?\n2. Think of a common tool around you—like a bicycle pedal, a market counter, or pouring water between cups.\n\n👉 **Let's take the first step together:** Which part of this concept feels most puzzling to you right now? The rule itself, or how to calculate with it?`,
      suggestedQuestions: [
        "Explain it using a market transaction example",
        "Give me a real-world story about this",
        "Test me with a simple question"
      ],
      analogy: "Step-by-step building blocks like laying foundation bricks for a house."
    };
  };

  const ai = getGeminiClient();
  if (!ai) {
    // Return high quality offline heuristic fallback
    return res.json(getFallbackResponse());
  }

  try {
    const systemInstruction = `You are "Amoye", an empathetic, brilliant African Socratic AI study companion for students in underserved communities (ages 10-18, Nigerian NERDC curriculum).
STRICT GUARDRAILS & PEDAGOGICAL RULES:
1. ANTI-CHEATING: NEVER directly solve homework or exam questions. If asked "Solve 3x + 5 = 20" or "What is the answer to question 2?", politely decline to give the direct answer. State that you want their brain to master it, and immediately provide an everyday analogy and ask a guiding question to lead them to step 1.
2. SOCIOECONOMIC EVERYDAY ANALOGIES: Exclusively ground scientific and mathematical concepts in zero-cost, everyday African/Nigerian household items (yellow water jerrycans, Agege bread slices, roadside market scales, tomatoes in baskets, mudu cups of garri, bicycle chains, solar study lanterns, well pulleys, kerosene lamps, naira/kobo coins).
3. AGE-ADAPTIVE: The user is approximately ${userAge} years old in ${classLevel}. Calibrate vocabulary, sentence length, and tone to be clear, encouraging, and respectful.
4. FORMAT: Return response in Markdown format with bold key terms and a closing question prompting the learner to think.`;

    const contents: any[] = [];
    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
        }
      });
    }

    contents.push({
      text: `Student prompt: ${prompt || 'Analyze this image and guide me Socratic style.'}\nMode requested: ${mode}`
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: contents },
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    const text = response.text || '';
    res.json({
      text,
      suggestedQuestions: [
        "Give me an everyday market analogy for this",
        "Generate 3 practice questions",
        "Explain it simpler like I am 10 years old"
      ],
      analogy: "Everyday African household and community context"
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert educator specializing in simplifying complex curriculum for students in developing regions.",
        temperature: 0.6
      }
    });

    res.json({ simplifiedMarkdown: response.text || '' });
  } catch (err) {
    console.error('Simplify content error:', err);
    res.json({
      simplifiedMarkdown: `### 🌟 Simplified Concept (Offline Mode)\n\n**Core Idea:** ${rawText}\n\n**Everyday Analogy:** Think of sharing a basket of ripe oranges among your study group. Each person gets an equal share, and any leftovers represent the remainder in division!`
    });
  }
});

// Automated Study Tools Generator (Quizzes & Flashcards from text)
app.post('/api/gemini/generate-study-tools', async (req: Request, res: Response) => {
  const { notesText, subjectName = 'General Studies' } = req.body;

  const fallbackData = {
    quizQuestions: [
      {
        id: `gen-q-${Date.now()}-1`,
        question: `Based on your notes: What is the primary role of the main concept discussed in "${notesText.slice(0, 30)}..."?`,
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
    ],
    flashcards: [
      {
        id: `gen-fc-${Date.now()}-1`,
        subjectId: 'custom-notes',
        front: 'Key Definition from Notes',
        back: notesText.slice(0, 120) + '...',
        analogy: 'Think of this like the foundation blocks laid before building classroom walls.',
        mastered: false,
        reviewCount: 0
      },
      {
        id: `gen-fc-${Date.now()}-2`,
        subjectId: 'custom-notes',
        front: 'Why does this concept matter in everyday life?',
        back: 'It allows you to calculate quantities accurately and avoid being cheated or making mistakes.',
        analogy: 'Counting your change carefully after buying provisions at the kiosk.',
        mastered: false,
        reviewCount: 0
      }
    ]
  };

  const ai = getGeminiClient();
  if (!ai) {
    return res.json(fallbackData);
  }

  try {
    const prompt = `From the following study notes, generate:
1. Exactly 3 multiple-choice quiz questions (with 4 options, correctIndex 0-3, explanation, everydayAnalogy, and gapTopic).
2. Exactly 3 digital flashcards (with front, back, and everydayAnalogy).

Notes:
"""
${notesText}
"""

Format your output strictly as a valid JSON object matching this schema:
{
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.quizQuestions && parsed.flashcards) {
      return res.json(parsed);
    }
    res.json(fallbackData);
  } catch (err) {
    console.error('Generate study tools error:', err);
    res.json(fallbackData);
  }
});

// Knowledge Gap Diagnostic Engine
app.post('/api/gemini/diagnose-gap', async (req: Request, res: Response) => {
  const { missedQuestions, subjectName = 'Mathematics' } = req.body;

  const fallbackGap = {
    detectedGap: {
      topic: missedQuestions?.[0]?.gapTopic || `${subjectName}: Foundational Concept`,
      diagnosticNote: `The student struggled with ${missedQuestions?.[0]?.question || 'multi-step calculation'}. Often occurs when skipping intermediate reduction steps.`,
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err) {
    console.error('Diagnose gap error:', err);
    res.json(fallbackGap);
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
