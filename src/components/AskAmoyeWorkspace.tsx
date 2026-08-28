import React, { useState, useRef, useEffect } from 'react';
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
  Flame, 
  CheckCircle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { sounds, speakText, stopSpeaking } from '../utils/audio';
import { useGamificationStore } from '../store/useGamificationStore';

interface AskAmoyeWorkspaceProps {
  profile: UserProfile;
  onClose: () => void;
  onSaveFlashcards?: (flashcards: any[]) => void;
  onStartQuizFromAI?: (quiz: any) => void;
}

export const AskAmoyeWorkspace: React.FC<AskAmoyeWorkspaceProps> = ({
  profile,
  onClose,
  onSaveFlashcards,
  onStartQuizFromAI
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'amoye',
      text: `### Ẹ n lẹ o, ${profile.name}! 💡\n\nI am **Amoye**, your Socratic learning companion. I am calibrated for **${profile.classLevel}** (Age ${profile.age}).\n\n🛡️ **My Golden Rule:** I will never do your homework or exam questions for you! If you bring a tough problem, I will use **everyday items like water jerrycans, market scales, and bicycle gears** to guide you until YOU master it.\n\nWhat are you working on right now?`,
      timestamp: Date.now(),
      suggestedQuestions: [
        "Why does 1/2 + 1/3 not equal 2/5?",
        "Explain photosynthesis using a cooking pot analogy",
        "Solve 3x + 5 = 20 for me (Test the anti-cheat guardrail!)",
        "How do gears on a bicycle give mechanical advantage?"
      ]
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [outputMode, setOutputMode] = useState<'socratic' | 'story' | 'quiz' | 'flashcard' | 'notes'>('socratic');
  const [ageOverride, setAgeOverride] = useState<number>(profile.age);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showAgeSlider, setShowAgeSlider] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const { recordAskAmoyeUsage } = useGamificationStore();

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
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

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    const curImage = uploadedImage;
    setUploadedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/socratic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          userAge: ageOverride,
          classLevel: profile.classLevel,
          mode: outputMode,
          imageBase64: curImage,
          cognitiveStyle: profile.cognitiveStyle
        })
      });

      const data = await response.json();

      const amoyeMsg: ChatMessage = {
        id: `amoye-${Date.now()}`,
        sender: 'amoye',
        text: data.text || 'Let us explore this together step by step.',
        timestamp: Date.now(),
        type: outputMode,
        suggestedQuestions: data.suggestedQuestions || [
          "Give me an everyday market analogy",
          "Test my understanding with 1 quick question"
        ],
        analogy: data.analogy,
        isDirectAnswerAttempt: data.isDirectAnswerAttempt
      };

      setMessages(prev => [...prev, amoyeMsg]);
      sounds.playSparkEarned();
    } catch (err) {
      console.error('Ask Amoye error:', err);
      // Offline fallback
      setMessages(prev => [
        ...prev,
        {
          id: `amoye-${Date.now()}`,
          sender: 'amoye',
          text: `### 💡 Socratic Step-by-Step (Offline Mode)\n\nYou asked: "${textToSend}"\n\nLet's break this down using an **everyday market scale**:\n- What happens when you change something on one side?\n- Does the opposite side stay balanced unless you change it by the exact same amount?\n\n👉 **Your turn:** What do you predict happens next?`,
          timestamp: Date.now(),
          suggestedQuestions: [
            "Tell me more about the market scale",
            "Try a simpler explanation"
          ]
        }
      ]);
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

  // Voice Query (SpeechRecognition)
  const handleVoiceInput = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Friendly simulation if speech API is unavailable in iframe
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setInputPrompt("How do fractions work with market cups of garri?");
      }, 1500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-NG'; // Nigerian English context
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsRecording(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
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
  };

  return (
    <div 
      id="ask-amoye-workspace-overlay"
      className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-end sm:justify-center sm:p-4"
    >
      <div className="w-full sm:max-w-2xl h-[92vh] sm:h-[88vh] bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header with Anti-Cheating Guardrail Badge */}
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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-emerald-600" />
                  Socratic Anti-Cheat Guardrails
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>Calibrated for {profile.classLevel} (Age {ageOverride})</span>
                <button 
                  onClick={() => setShowAgeSlider(!showAgeSlider)}
                  className="text-[11px] text-emerald-600 font-semibold hover:underline flex items-center gap-0.5"
                >
                  <Sliders className="w-3 h-3" /> Adjust Age
                </button>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Age-Adaptive Slider (Pillar 1) */}
        {showAgeSlider && (
          <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-slate-800 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="font-bold">Target Age Simplification:</span>
              <span className="font-extrabold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-md">
                Age {ageOverride} ({ageOverride <= 11 ? 'Primary / JSS 1' : ageOverride <= 14 ? 'Junior Secondary' : 'Senior Secondary / WAEC'})
              </span>
            </div>
            <input 
              type="range" 
              min="9" 
              max="18" 
              value={ageOverride} 
              onChange={(e) => setAgeOverride(Number(e.target.value))}
              className="w-36 accent-amber-600 cursor-pointer"
            />
          </div>
        )}

        {/* Output Mode Toggles (Pillar 4: quiz, flashcards, story cards, notes, socratic) */}
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Output Style:
          </span>
          <button
            onClick={() => setOutputMode('socratic')}
            className={`px-3 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-colors ${
              outputMode === 'socratic'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" /> Socratic Steps
          </button>

          <button
            onClick={() => setOutputMode('story')}
            className={`px-3 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-colors ${
              outputMode === 'story'
                ? 'bg-orange-500 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Story Cards
          </button>

          <button
            onClick={() => setOutputMode('quiz')}
            className={`px-3 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-colors ${
              outputMode === 'quiz'
                ? 'bg-amber-500 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Quick Quiz
          </button>

          <button
            onClick={() => setOutputMode('flashcard')}
            className={`px-3 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-colors ${
              outputMode === 'flashcard'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Flashcards
          </button>

          <button
            onClick={() => setOutputMode('notes')}
            className={`px-3 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-colors ${
              outputMode === 'notes'
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Study Notes
          </button>
        </div>

        {/* Chat History Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeaking = speakingMsgId === msg.id;

            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm relative ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                }`}>
                  
                  {/* Uploaded image if any */}
                  {msg.imageUri && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-white/20 max-h-48">
                      <img src={msg.imageUri} alt="Uploaded Problem" className="w-full object-cover" />
                    </div>
                  )}

                  {/* Anti-Cheating Flag Notice */}
                  {msg.isDirectAnswerAttempt && (
                    <div className="mb-3 p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Cheating Guardrail Engaged: Direct solution withheld. Guiding step initiated!</span>
                    </div>
                  )}

                  {/* Message Markdown Body */}
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {/* Everyday Analogy Callout Pill */}
                  {msg.analogy && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
                      <Flame className="w-3.5 h-3.5 fill-orange-500" />
                      <span>Everyday Analogy: {msg.analogy}</span>
                    </div>
                  )}

                  {/* Audio Listen Speaker Button */}
                  {!isUser && (
                    <div className="mt-2.5 flex items-center justify-end">
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.text)}
                        className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-emerald-600 transition-colors"
                        title={isSpeaking ? 'Stop reading' : 'Read aloud with Text-to-Speech'}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            <span className="text-red-500">Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
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
                        className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-left"
                      >
                        <span>{q}</span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator with Socratic prompt thought */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-xs text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Amoye is shaping an everyday analogy for you...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Zero-Cost Analogy Quick Chips Bar (Competition-Winning Feature 2) */}
        <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold shrink-0">Quick Analogies:</span>
          <button 
            onClick={() => handleSend("Explain this using water jerrycans and buckets")}
            className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 shrink-0"
          >
            🛢️ Water Jerrycans
          </button>
          <button 
            onClick={() => handleSend("Explain this using a roadside market scale with naira coins")}
            className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 shrink-0"
          >
            ⚖️ Market Scale & Naira
          </button>
          <button 
            onClick={() => handleSend("Explain this like sharing Agege bread among siblings")}
            className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 shrink-0"
          >
            🍞 Agege Bread Portions
          </button>
          <button 
            onClick={() => handleSend("Explain this using bicycle gears and pedaling uphill")}
            className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 shrink-0"
          >
            🚲 Bicycle Pedals & Chain
          </button>
        </div>

        {/* Upload preview thumbnail if attached */}
        {uploadedImage && (
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={uploadedImage} alt="Preview" className="w-8 h-8 rounded-lg object-cover border" />
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Textbook Diagram Attached</span>
            </div>
            <button 
              onClick={() => setUploadedImage(null)}
              className="text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        {/* Input Bar with Voice, Camera, and Send */}
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
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Upload photo of textbook diagram or homework question"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Voice Mic Button */}
          <button
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-xl border transition-colors ${
              isRecording 
                ? 'bg-red-500 border-red-400 text-white animate-pulse' 
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Ask via Voice Input"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? 'Listening to your voice...' : 'Ask a question or paste problem...'}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={isLoading || (!inputPrompt.trim() && !uploadedImage)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
