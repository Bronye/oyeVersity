import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShieldAlert, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  FileText, 
  Lightbulb,
  ArrowRight,
  Trash2,
  Brain,
  CheckCircle2,
  Check,
  RotateCw,
  Award,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';
import { ChatMessage, UserProfile, Flashcard, Quiz, QuizQuestion } from '../types';
import { sounds, speakText, stopSpeaking } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import { useGamificationStore } from '../store/useGamificationStore';
import { 
  getChatMessages, 
  saveChatMessage, 
  clearChatMessages, 
  addFlashcard, 
  addQuiz 
} from '../db/dexie';

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

interface AskAmoyeWorkspaceProps {
  profile: UserProfile;
  subjectName?: string;
  initialPrompt?: string;
  onClose: () => void;
  onSaveFlashcards?: (flashcards: Flashcard[]) => void;
  onSaveQuiz?: (quiz: Quiz) => void;
  onStartQuizFromAI?: (quiz: Quiz) => void;
}

// Built-in intelligent offline Socratic response generator for zero-bandwidth / offline / rate-limited states
function getLocalOfflineTutorResponse(prompt: string, subject: string, classLevel: string, age: number): any {
  const lower = (prompt || '').toLowerCase();
  const rawTopic = prompt ? prompt.trim().replace(/[?.!]+$/, '') : 'General Concept';
  const topic = rawTopic.length > 40 ? `${rawTopic.slice(0, 37)}...` : rawTopic;

  // 1. Linear Equations / Algebra
  if (/equation|solve|calculate|3x|value of x|find x|variable/i.test(lower)) {
    return {
      text: `### 💡 Guiding Your Curiosity: Balancing Equations Step-by-Step

Welcome! I see you are working on a mathematics problem. Let's walk through the core logic together using an everyday market balance so you can solve equations like this with total confidence!

#### 1. The Roadside Market Scale Breakdown
Picture an everyday two-pan balance scale at a local market stall:
- **On the left pan:** You have 3 mystery sealed tins (3x) plus 5 loose one-naira coins (+ 5).
- **On the right pan:** You have 20 loose one-naira coins.
- The scale is balanced completely level!

#### 2. Step-by-Step Understanding
1. **The Golden Rule of Balance:** Whatever you take away from one pan, you must also take away from the other pan to keep it level.
2. **Clear the loose coins first:** Subtract 5 coins from both sides. Now 3 tins balance 15 coins (3x = 15).
3. **Share into equal portions:** Divide the 15 coins evenly across the 3 tins.

#### 3. Guiding Question for You
👉 **What do you think?** If 3 identical tins balance 15 coins equally, how many coins must be inside just one tin?`,
      topic: 'Linear Equations & Balance',
      isHomeworkOrTest: true,
      suggestedQuestions: [
        "Each tin holds 5 coins (x = 5)",
        "Why do we subtract 5 from both sides first?",
        "Can we try another equation together?"
      ],
      analogy: "A two-pan market scale balancing mystery tins against naira coins.",
      flashcards: [
        {
          front: "What is the golden rule when solving an algebraic equation?",
          back: "Whatever operation you perform on one side, you must perform on the other side to keep the balance equal.",
          analogy: "Keeping both pans of a market scale balanced."
        },
        {
          front: "In the equation 3x + 5 = 20, what is x called?",
          back: "x is a variable or unknown value that we are finding.",
          analogy: "A closed mystery tin whose contents we want to count."
        }
      ],
      quiz: {
        title: "Linear Equations Practice",
        questions: [
          {
            question: "In the equation 2x + 4 = 14, what is the first step to balance the scale?",
            options: [
              "Subtract 4 from both sides",
              "Add 14 to both sides",
              "Multiply both sides by 2",
              "Divide 4 by 14"
            ],
            correctIndex: 0,
            explanation: "Removing loose items first leaves only the unknown containers to divide.",
            everydayAnalogy: "Take off the loose coins before dividing the remaining weight."
          },
          {
            question: "If 2x = 10, what is the value of x?",
            options: ["5", "8", "12", "20"],
            correctIndex: 0,
            explanation: "Dividing 10 by 2 gives 5.",
            everydayAnalogy: "Sharing 10 oranges equally between 2 baskets."
          }
        ]
      }
    };
  }

  // 2. Fractions & Ratios
  if (/fraction|share|divide|ratio|portion|half|quarter|1\/2|1\/4/i.test(lower)) {
    return {
      text: `### 💡 Guiding Your Curiosity: Understanding Fractions as Real-World Sharing

Welcome! Fractions are simply a fair way to describe sharing and portions in our daily lives.

#### 1. Relatable Everyday Breakdown: Agege Bread Slices
Picture buying a fresh loaf of Agege bread at a kiosk:
- The **denominator** (bottom number) tells you how many equal slices the whole bread is cut into.
- The **numerator** (top number) tells you how many of those slices you are holding in your hand!
- If you slice a loaf into 4 parts and take 1 slice, you have 1/4 of the loaf.

#### 2. Step-by-Step Understanding
1. **Equal Sizes Matter:** Every single slice must be the exact same size, otherwise it is not a true fraction.
2. **More Slices Mean Smaller Pieces:** Notice that 1/8 of a loaf is much smaller than 1/2 of a loaf, because you shared it among more people!

#### 3. Guiding Question for You
👉 **What do you think?** If you have 1/2 of an Agege loaf and cut that exact piece into two equal halves, what fraction of the original whole loaf is each piece?`,
      topic: 'Fractions & Proportions',
      isHomeworkOrTest: false,
      suggestedQuestions: [
        "Each piece is 1/4 of the original loaf",
        "Why is 1/5 smaller than 1/3?",
        "How do we add fractions with different denominators?"
      ],
      analogy: "Slicing an Agege bread loaf into equal portions for your family.",
      flashcards: [
        {
          front: "In a fraction, what does the denominator represent?",
          back: "The total number of equal parts into which the whole is divided.",
          analogy: "The total number of slices cut from a bread loaf."
        },
        {
          front: "Which is larger: 1/3 or 1/6 of the same object?",
          back: "1/3 is larger, because dividing into fewer parts produces larger portions.",
          analogy: "Sharing water among 3 cups gives fuller cups than sharing among 6 cups."
        }
      ],
      quiz: {
        title: "Fractions Mastery Check",
        questions: [
          {
            question: "Which fraction represents the largest quantity?",
            options: ["1/2", "1/4", "1/8", "1/10"],
            correctIndex: 0,
            explanation: "Fewer divisions mean each piece is larger.",
            everydayAnalogy: "Half a watermelon is much bigger than an eighth."
          }
        ]
      }
    };
  }

  // 3. Work, Force & Energy
  if (/work|force|energy|power|gravity|newton|joule|friction|motion/i.test(lower)) {
    return {
      text: `### 💡 Guiding Your Curiosity: Work vs. Force in Everyday Life

Welcome! In physics, "work" has a very specific meaning that is quite different from simply feeling tired. Let's see why!

#### 1. Relatable Everyday Breakdown: The Borehole Water Jerrycan
Picture standing by a community borehole:
- If you push as hard as you can against the concrete borehole wall for 2 hours, you will sweat and feel exhausted. But in scientific terms, **you did 0 Joules of work!**
- Why? Because the wall did not move a single centimeter!
- But if you pick up a 20-liter yellow jerrycan of water and carry it 15 meters across the compound, you have done **real mechanical work**!

#### 2. Step-by-Step Understanding
1. **The Scientific Formula:** Work = Force applied × Distance moved in the direction of the force.
2. **Movement is Required:** If Distance = 0 meters, Work = Force × 0 = 0 Joules.
3. **Measurement Units:** Force is measured in Newtons (N), distance in meters (m), and work in Joules (J).

#### 3. Guiding Question for You
👉 **What do you think?** If a student exerts 50 Newtons of force to push a heavy box 3 meters across the classroom floor, how much work was done?`,
      topic: 'Work, Energy & Force',
      isHomeworkOrTest: false,
      suggestedQuestions: [
        "Work = 50 N × 3 m = 150 Joules",
        "Why is pushing a solid wall zero work?",
        "What is the difference between kinetic and potential energy?"
      ],
      analogy: "Carrying a 20-liter yellow water jerrycan across the compound versus pushing an unmoving wall.",
      flashcards: [
        {
          front: "What is the scientific formula for mechanical work?",
          back: "Work = Force × Distance moved (measured in Joules).",
          analogy: "Carrying a water jerrycan over a certain distance."
        },
        {
          front: "If you push an immovable boulder for 1 hour, how much work is done?",
          back: "Zero Joules, because the distance moved is zero.",
          analogy: "Pushing a concrete building wall."
        }
      ],
      quiz: {
        title: "Work & Force Practice",
        questions: [
          {
            question: "A student pushes a cart with 20 Newtons of force over a distance of 4 meters. How much work is done?",
            options: ["80 Joules", "5 Joules", "24 Joules", "0 Joules"],
            correctIndex: 0,
            explanation: "Work = Force × Distance = 20 × 4 = 80 Joules.",
            everydayAnalogy: "Moving the cart 4 steps forward with steady push."
          }
        ]
      }
    };
  }

  // 4. Default High-Quality Socratic Response
  return {
    text: `### 💡 Guiding Your Curiosity: ${topic}

Welcome! I am glad you are exploring this concept for your **${classLevel}** studies. Let's break it down into simple, memorable building blocks!

#### 1. Relatable Everyday Breakdown
Think of **${topic}** like learning a traditional craft or balancing items at a market stall:
- Everything begins with foundational units that you can touch, count, and verify.
- Rather than memorizing rules without understanding, look for the rhythm: what changes, and what stays constant?

#### 2. Step-by-Step Understanding
1. **Identify the Core Principle:** What is the main question asking you to determine?
2. **Connect to What You Already Know:** Break complex steps into smaller, familiar actions.
3. **Check Your Reasoning:** Test your answer with an everyday real-world test to make sure it makes common sense!

#### 3. Guiding Question for You
👉 **What do you think?** When you look at "${topic}", what is the first step or piece of information you feel most confident about?`,
    topic,
    isHomeworkOrTest: false,
    suggestedQuestions: [
      `Break ${topic} down into 3 simple steps`,
      `Give me a real-world Nigerian example of this`,
      `Give me a practice quiz question on this topic`
    ],
    analogy: "Assembling a strong foundation block by block before raising classroom walls.",
    flashcards: [
      {
        front: `Core Foundation of ${topic}`,
        back: `Understanding the fundamental building block is essential for ${classLevel} mastery.`,
        analogy: "Laying the corner foundation stone of a house."
      },
      {
        front: `Why does ${topic} matter in daily life?`,
        back: "It develops logical reasoning and problem-solving skills for real-world decisions.",
        analogy: "Planning market budget before heading out to shop."
      }
    ],
    quiz: {
      title: `${topic} Quick Check`,
      questions: [
        {
          question: `What is the most effective way to understand ${topic}?`,
          options: [
            "Break it down into step-by-step everyday analogies",
            "Memorize answers without understanding why",
            "Skip the foundation and guess",
            "Ignore the units and definitions"
          ],
          correctIndex: 0,
          explanation: "Connecting concepts to familiar daily items builds permanent understanding.",
          everydayAnalogy: "Testing your scale before weighing provisions."
        }
      ]
    }
  };
}

export const AskAmoyeWorkspace: React.FC<AskAmoyeWorkspaceProps> = ({
  profile,
  subjectName = 'General Studies',
  initialPrompt,
  onClose,
  onSaveFlashcards,
  onSaveQuiz,
  onStartQuizFromAI
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState(initialPrompt || '');
  const [outputMode, setOutputMode] = useState<'socratic' | 'story' | 'quiz' | 'flashcard' | 'notes'>('socratic');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Modals for Reviewing Flashcards and Quizzes generated by AI
  const [activeReviewFlashcards, setActiveReviewFlashcards] = useState<{ topic: string; cards: Flashcard[] } | null>(null);
  const [activeReviewQuiz, setActiveReviewQuiz] = useState<Quiz | null>(null);

  // In-modal Flashcard state
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // In-modal Quiz state
  const [quizQIndex, setQuizQIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const { recordAskAmoyeUsage } = useGamificationStore();

  // Load previous chat history from offline storage (Dexie + localStorage) on mount
  useEffect(() => {
    async function loadSavedHistory() {
      try {
        const dbMsgs = await getChatMessages();
        if (dbMsgs && dbMsgs.length > 0) {
          // Filter out standard initial welcome placeholder if user has actual messages
          const realMsgs = dbMsgs.filter(m => m.id !== 'msg-welcome-01');
          if (realMsgs.length > 0) {
            setMessages(realMsgs);
            return;
          }
        }
        
        // Fallback to localStorage
        const stored = localStorage.getItem('oye_amoye_offline_chats_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (err) {
        console.warn('Could not load offline chat history:', err);
      }
    }
    loadSavedHistory();
  }, []);

  // Sync scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up speech and voice recognition on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // If initialPrompt was provided from external lesson and no messages yet, auto-send
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && messages.length === 0) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  // Save every message for offline use
  const persistMessageOffline = async (msg: ChatMessage) => {
    try {
      await saveChatMessage(msg);
      setMessages(prev => {
        const next = [...prev, msg];
        try {
          localStorage.setItem('oye_amoye_offline_chats_v2', JSON.stringify(next.slice(-50)));
        } catch (e) {
          // ignore quota limits
        }
        return next;
      });
    } catch (err) {
      console.warn('Failed to persist message offline:', err);
      setMessages(prev => [...prev, msg]);
    }
  };

  // Clear chat while leaving flashcards and quizzes in the offline database
  const handleClearChat = async () => {
    if (window.confirm('Clear your conversation screen? Your saved flashcards and quizzes will remain safely in your offline library.')) {
      sounds.playTap();
      await clearChatMessages();
      localStorage.removeItem('oye_amoye_offline_chats_v2');
      setMessages([]);
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : inputPrompt;
    if (!textToSend.trim() && !uploadedImage) return;

    sounds.playTap();
    recordAskAmoyeUsage(textToSend);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
      imageUri: uploadedImage || undefined
    };

    await persistMessageOffline(userMsg);
    setInputPrompt('');
    const curImage = uploadedImage;
    setUploadedImage(null);
    setIsLoading(true);

    let data: any = null;

    try {
      const response = await fetch('/api/gemini/socratic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          userAge: profile.age,
          classLevel: profile.classLevel,
          subject: subjectName,
          mode: outputMode,
          imageBase64: curImage
        })
      });

      if (response.ok) {
        data = await response.json();
      }
    } catch (err: any) {
      console.warn('Network fetch unavailable, using Amoye offline Socratic engine:', err?.message || err);
    }

    if (!data || !data.text) {
      data = getLocalOfflineTutorResponse(textToSend, subjectName, profile.classLevel, profile.age);
    }

    try {
      // Convert generated flashcards and quizzes to standard app models & save offline
      const topicName = data.topic || textToSend.slice(0, 30);
      const subjectId = subjectName.toLowerCase().replace(/\s+/g, '-');

      let processedFlashcards: Flashcard[] = [];
      if (Array.isArray(data.flashcards) && data.flashcards.length > 0) {
        processedFlashcards = data.flashcards.map((f: any, idx: number) => ({
          id: f.id || `amoye-fc-${Date.now()}-${idx}`,
          subjectId,
          front: cleanMathLaTeX(f.front || 'Key Concept'),
          back: cleanMathLaTeX(f.back || ''),
          analogy: cleanMathLaTeX(f.analogy || 'Connected to everyday life'),
          mastered: false,
          reviewCount: 0
        }));

        // Persist each flashcard into offline database
        for (const card of processedFlashcards) {
          await addFlashcard(card);
        }
        onSaveFlashcards?.(processedFlashcards);
      }

      let processedQuiz: Quiz | undefined = undefined;
      if (data.quiz && Array.isArray(data.quiz.questions) && data.quiz.questions.length > 0) {
        processedQuiz = {
          id: data.quiz.id || `amoye-quiz-${Date.now()}`,
          subjectId,
          title: cleanMathLaTeX(data.quiz.title || `${topicName} Quick Check`),
          difficulty: 'medium',
          xpReward: 30,
          sparksReward: 20,
          questions: data.quiz.questions.map((q: any, idx: number) => ({
            id: q.id || `amoye-q-${Date.now()}-${idx}`,
            question: cleanMathLaTeX(q.question || ''),
            options: Array.isArray(q.options) ? q.options.map((o: any) => cleanMathLaTeX(String(o))) : [],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
            explanation: cleanMathLaTeX(q.explanation || ''),
            everydayAnalogy: cleanMathLaTeX(q.everydayAnalogy || ''),
            gapTopic: topicName
          }))
        };

        // Persist quiz into offline database
        await addQuiz(processedQuiz);
        onSaveQuiz?.(processedQuiz);
      }

      const amoyeMsg: ChatMessage = {
        id: `amoye-${Date.now()}`,
        sender: 'amoye',
        text: cleanMathLaTeX(data.text),
        timestamp: Date.now(),
        type: outputMode,
        topic: topicName,
        isHomeworkOrTest: Boolean(data.isHomeworkOrTest),
        isDirectAnswerAttempt: data.isDirectAnswerAttempt,
        suggestedQuestions: Array.isArray(data.suggestedQuestions)
          ? data.suggestedQuestions.map((q: any) => cleanMathLaTeX(String(q)))
          : [
              `Explain with an everyday example for ${profile.classLevel}`,
              `Test my understanding with 1 quick question`,
              `Break it down into simpler steps`
            ],
        analogy: cleanMathLaTeX(data.analogy || ''),
        generatedFlashcards: processedFlashcards.length > 0 ? processedFlashcards : undefined,
        generatedQuiz: processedQuiz
      };

      await persistMessageOffline(amoyeMsg);
      sounds.playSparkEarned();
    } catch (procErr) {
      console.warn('Processing message offline fallback notice:', procErr);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Text-to-Speech
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      const success = speakText(text, () => {
        setSpeakingMsgId(null);
      });
      if (!success) {
        setSpeakingMsgId(null);
      }
    }
  };

  // Voice Input via Web Speech API
  const handleVoiceInput = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsRecording(false);
      setVoiceStatus(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('Voice recognition is not supported in this browser. Please type your question.');
      setTimeout(() => setVoiceStatus(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-NG'; // Nigerian English context
      recognition.interimResults = true;
      recognition.continuous = false;

      setIsRecording(true);
      setVoiceStatus('Listening... speak your question now');

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputPrompt(transcript);
        if (event.results[0].isFinal) {
          setIsRecording(false);
          setVoiceStatus(null);
        }
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setVoiceStatus('Microphone permission blocked. Please allow microphone access in your browser settings.');
        } else {
          setVoiceStatus('Could not capture voice. Please try speaking again or type.');
        }
        setTimeout(() => setVoiceStatus(null), 4000);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setVoiceStatus(null);
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
      setVoiceStatus('Unable to access microphone.');
      setTimeout(() => setVoiceStatus(null), 3000);
    }
  };

  // Image upload handling
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Launch in-workspace Flashcard Reviewer
  const handleOpenFlashcardsReview = (topic: string, cards: Flashcard[]) => {
    sounds.playTap();
    setActiveReviewFlashcards({ topic, cards });
    setActiveCardIndex(0);
    setIsCardFlipped(false);
  };

  // Launch in-workspace Quiz Player
  const handleOpenQuiz = (quiz: Quiz) => {
    sounds.playTap();
    if (onStartQuizFromAI) {
      // If parent has dedicated quiz flow, use it, or use built-in player
      onStartQuizFromAI(quiz);
      return;
    }
    setActiveReviewQuiz(quiz);
    setQuizQIndex(0);
    setQuizSelectedOption(null);
    setQuizAnswered(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  // Handle quiz option selection in-workspace
  const handleQuizAnswer = (idx: number) => {
    if (quizAnswered || !activeReviewQuiz) return;
    setQuizSelectedOption(idx);
    setQuizAnswered(true);

    const curQ = activeReviewQuiz.questions[quizQIndex];
    const isCorrect = idx === curQ.correctIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      sounds.playCorrectAnswer();
    } else {
      sounds.playIncorrect();
    }
  };

  const handleNextQuizQuestion = () => {
    if (!activeReviewQuiz) return;
    if (quizQIndex < activeReviewQuiz.questions.length - 1) {
      setQuizQIndex(prev => prev + 1);
      setQuizSelectedOption(null);
      setQuizAnswered(false);
    } else {
      setQuizFinished(true);
      fireConfetti();
      sounds.playBadgeUnlocked();
    }
  };

  // Starters tailored to the subject for empty state
  const getSubjectStarters = () => {
    const s = subjectName.toLowerCase();
    if (s.includes('math')) {
      return [
        "Why does 1/2 + 1/3 not equal 2/5?",
        "Explain how equations stay balanced using a market scale",
        "How do ratios work when sharing money or food?"
      ];
    }
    if (s.includes('science') || s.includes('tech')) {
      return [
        "Why is pushing a concrete wall not scientific work?",
        "Explain photosynthesis using an outdoor cooking kitchen analogy",
        "How do bicycle gears give mechanical advantage?"
      ];
    }
    if (s.includes('english') || s.includes('lang')) {
      return [
        "What is the difference between active and passive voice?",
        "How do I write a compelling essay opening paragraph?",
        "Explain metaphors and similes with everyday expressions"
      ];
    }
    return [
      `Explain a key concept in ${subjectName} using an everyday analogy`,
      `Break down a tricky question in ${subjectName} step-by-step`,
      `Give me 3 practice questions for ${profile.classLevel}`
    ];
  };

  return (
    <div 
      id="ask-amoye-workspace-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-end sm:justify-center sm:p-4"
    >
      <div className="w-full sm:max-w-2xl h-[92vh] sm:h-[88vh] bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 text-white flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-base sm:text-lg leading-tight text-slate-900 dark:text-white">
                  Ask Amoye
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Socratic AI Tutor
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" /> Offline Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{profile.classLevel} • Age {profile.age} • <strong className="text-slate-700 dark:text-slate-200">{subjectName}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                title="Clear conversation screen (saved flashcards & quizzes remain in your offline library)"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close Ask Amoye"
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Output Style Toggles */}
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Output Style:
          </span>
          <button
            onClick={() => setOutputMode('socratic')}
            className={`px-3 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
              outputMode === 'socratic'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" /> Socratic Steps
          </button>

          <button
            onClick={() => setOutputMode('story')}
            className={`px-3 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
              outputMode === 'story'
                ? 'bg-orange-500 text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Story Cards
          </button>

          <button
            onClick={() => setOutputMode('quiz')}
            className={`px-3 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
              outputMode === 'quiz'
                ? 'bg-amber-500 text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Quick Quiz
          </button>

          <button
            onClick={() => setOutputMode('flashcard')}
            className={`px-3 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
              outputMode === 'flashcard'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Flashcards
          </button>

          <button
            onClick={() => setOutputMode('notes')}
            className={`px-3 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
              outputMode === 'notes'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Study Notes
          </button>
        </div>

        {/* Voice status banner if recording or error */}
        {voiceStatus && (
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{voiceStatus}</span>
            </div>
            {isRecording && (
              <button
                onClick={handleVoiceInput}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                Stop Listening
              </button>
            )}
          </div>
        )}

        {/* Chat / Interaction Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Clean Empty State when no messages yet */}
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
              <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                What would you like to explore in {subjectName}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                Type your question, speak with the microphone, or take a picture of your homework. Amoye guides you step-by-step with zero-cost everyday examples!
              </p>

              {/* Subject-specific starters */}
              <div className="w-full max-w-md space-y-2 text-left">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">
                  Try asking:
                </p>
                {getSubjectStarters().map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(starter)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors flex items-center justify-between gap-2 text-left cursor-pointer group"
                  >
                    <span>{starter}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Stream */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeaking = speakingMsgId === msg.id;
            const hasStudyTools = (msg.generatedFlashcards && msg.generatedFlashcards.length > 0) || Boolean(msg.generatedQuiz);

            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 shadow-xs relative ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                }`}>
                  
                  {/* Uploaded image if any */}
                  {msg.imageUri && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-white/20 max-h-52 bg-black/10">
                      <img src={msg.imageUri} alt="Uploaded Problem" className="w-full object-cover" />
                    </div>
                  )}

                  {/* Guided Homework & Practice Notice */}
                  {msg.isHomeworkOrTest && !isUser && (
                    <div className="mb-3 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Guided Learning (Homework / Practice Mode):</span>
                        <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-tight">
                          Amoye walks you through the step-by-step method with an everyday analogy so your brain masters the skill for life!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Message Markdown Body - properly rendered with clean readable math */}
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                    <Markdown>{msg.text}</Markdown>
                  </div>

                  {/* Audio Listen Speaker Button for AI responses */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-500" /> Saved for offline
                      </span>
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.text)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        title={isSpeaking ? 'Stop reading' : 'Read aloud with Text-to-Speech'}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-4 h-4 text-red-500 animate-pulse" />
                            <span className="text-red-500 font-bold">Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Listen to Explanation</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Interactive Study & Practice Pack Container (Flashcards & Quiz stored for offline) */}
                  {!isUser && hasStudyTools && (
                    <div className="mt-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Study & Practice Pack
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Saved Offline
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
                        Now that you’ve read the explanation, test what you learned! These study tools are safely saved on your device:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Check out Flashcards Action Button */}
                        {msg.generatedFlashcards && msg.generatedFlashcards.length > 0 && (
                          <button
                            onClick={() => handleOpenFlashcardsReview(msg.topic || 'This Topic', msg.generatedFlashcards!)}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 transition-colors cursor-pointer group text-left"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                <Layers className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold leading-tight">Review Flashcards</div>
                                <div className="text-[10px] text-purple-700/80 dark:text-purple-300/80">
                                  {msg.generatedFlashcards.length} cards generated
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-purple-500 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}

                        {/* Take Quiz Action Button */}
                        {msg.generatedQuiz && (
                          <button
                            onClick={() => handleOpenQuiz(msg.generatedQuiz!)}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer group text-left"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                <HelpCircle className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold leading-tight">Take the Quiz</div>
                                <div className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                                  {msg.generatedQuiz.questions.length} questions ready
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Suggested Socratic Follow-up Prompts */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && !isUser && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className="text-xs px-3 py-1 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-left cursor-pointer"
                      >
                        <span>{q}</span>
                        <ArrowRight className="w-3 h-3 shrink-0 opacity-70" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5 p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-xs text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <span>Amoye is guiding your curiosity and preparing study tools...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Upload preview thumbnail if attached */}
        {uploadedImage && (
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <img src={uploadedImage} alt="Preview" className="w-9 h-9 rounded-lg object-cover border border-slate-300 dark:border-slate-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Textbook Diagram / Photo Attached</span>
            </div>
            <button 
              onClick={() => setUploadedImage(null)}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        )}

        {/* Input Bar with Voice, Camera/Image, Text Box, and Send */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageFile}
          />

          {/* Camera / Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              uploadedImage 
                ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Upload photo of textbook diagram or homework question"
            aria-label="Upload photo"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isRecording 
                ? 'bg-red-500 border-red-400 text-white animate-pulse' 
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Ask via Voice Input'}
            aria-label="Voice Input"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? 'Listening to your voice...' : `Ask a question in ${subjectName}...`}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isLoading || (!inputPrompt.trim() && !uploadedImage)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Send message to Amoye"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* MODAL 1: Interactive Flashcards Reviewer Modal */}
      {activeReviewFlashcards && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-purple-200 dark:border-purple-900 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-purple-50/70 dark:bg-purple-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Flashcard Practice
                  </h3>
                  <p className="text-[11px] text-purple-700 dark:text-purple-300">
                    {activeReviewFlashcards.topic} • Card {activeCardIndex + 1} of {activeReviewFlashcards.cards.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveReviewFlashcards(null)}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Flashcard Body */}
            <div className="p-6 flex-1 flex flex-col items-center justify-center">
              {activeReviewFlashcards.cards[activeCardIndex] && (
                <div
                  onClick={() => {
                    sounds.playTap();
                    setIsCardFlipped(!isCardFlipped);
                  }}
                  className="w-full min-h-[260px] p-6 rounded-2xl border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50/50 via-white to-slate-50 dark:from-purple-950/20 dark:via-slate-850 dark:to-slate-900 shadow-lg cursor-pointer flex flex-col items-center justify-between text-center transition-all hover:scale-[1.01]"
                >
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    <span className="uppercase tracking-wider">
                      {isCardFlipped ? 'Answer / Explanation' : 'Question / Concept'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <RotateCw className="w-3 h-3" /> Tap to Flip
                    </span>
                  </div>

                  <div className="my-auto py-4">
                    <div className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
                      {isCardFlipped
                        ? activeReviewFlashcards.cards[activeCardIndex].back
                        : activeReviewFlashcards.cards[activeCardIndex].front}
                    </div>

                    {isCardFlipped && activeReviewFlashcards.cards[activeCardIndex].analogy && (
                      <div className="mt-4 p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2 text-left">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                            Everyday Analogy:
                          </strong>
                          {activeReviewFlashcards.cards[activeCardIndex].analogy}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400">
                    {isCardFlipped ? 'Tap card to flip back' : 'Tap card to reveal answer'}
                  </div>
                </div>
              )}
            </div>

            {/* Flashcard Footer Controls */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <button
                disabled={activeCardIndex === 0}
                onClick={() => {
                  sounds.playTap();
                  setActiveCardIndex(prev => prev - 1);
                  setIsCardFlipped(false);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs font-bold text-slate-500">
                {activeCardIndex + 1} / {activeReviewFlashcards.cards.length}
              </span>

              <button
                disabled={activeCardIndex === activeReviewFlashcards.cards.length - 1}
                onClick={() => {
                  sounds.playTap();
                  setActiveCardIndex(prev => prev + 1);
                  setIsCardFlipped(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Interactive In-Workspace Quiz Player Modal */}
      {activeReviewQuiz && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-200 dark:border-amber-900 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50/70 dark:bg-amber-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {activeReviewQuiz.title}
                  </h3>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Question {quizQIndex + 1} of {activeReviewQuiz.questions.length} • Score: {quizScore}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveReviewQuiz(null)}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quiz Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {!quizFinished ? (
                <>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed">
                      {activeReviewQuiz.questions[quizQIndex]?.question}
                    </h4>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {activeReviewQuiz.questions[quizQIndex]?.options.map((option, idx) => {
                      const curQ = activeReviewQuiz.questions[quizQIndex];
                      const isSelected = quizSelectedOption === idx;
                      const isCorrect = idx === curQ.correctIndex;

                      let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-800 dark:text-slate-200';
                      if (quizAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200 font-semibold';
                        } else {
                          btnStyle = 'opacity-50 border-slate-200 dark:border-slate-800 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={quizAnswered}
                          onClick={() => handleQuizAnswer(idx)}
                          className={`w-full p-3 rounded-xl border text-xs sm:text-sm font-medium text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {quizAnswered && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Socratic Feedback */}
                  {quizAnswered && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {quizSelectedOption === activeReviewQuiz.questions[quizQIndex].correctIndex ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-4 h-4" /> Correct! Outstanding!
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <ShieldAlert className="w-4 h-4" /> Great effort! Let's understand why:
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        {activeReviewQuiz.questions[quizQIndex].explanation}
                      </p>
                      {activeReviewQuiz.questions[quizQIndex].everydayAnalogy && (
                        <div className="text-[11px] p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{activeReviewQuiz.questions[quizQIndex].everydayAnalogy}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Quiz Finished Celebration Screen */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-md">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                      Practice Quiz Complete!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      You scored <strong>{quizScore}</strong> out of <strong>{activeReviewQuiz.questions.length}</strong>!
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      <Sparkles className="w-4 h-4 text-emerald-500" /> +{quizScore * 15} Sparks
                    </div>
                    <div className="w-px h-4 bg-emerald-200 dark:bg-emerald-800" />
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Flame className="w-4 h-4" /> +{quizScore * 20} XP
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quiz Footer Controls */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              {!quizFinished ? (
                <button
                  disabled={!quizAnswered}
                  onClick={handleNextQuizQuestion}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{quizQIndex < activeReviewQuiz.questions.length - 1 ? 'Next Question' : 'View Final Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-full flex items-center gap-2">
                  <button
                    onClick={() => {
                      setQuizQIndex(0);
                      setQuizSelectedOption(null);
                      setQuizAnswered(false);
                      setQuizScore(0);
                      setQuizFinished(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => setActiveReviewQuiz(null)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
