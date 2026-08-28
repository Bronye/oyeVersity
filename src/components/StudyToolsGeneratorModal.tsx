import React, { useState } from 'react';
import { 
  X, 
  Wand2, 
  Sparkles, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Check, 
  ArrowRight,
  Flame,
  FileText,
  Copy
} from 'lucide-react';
import { Quiz, Flashcard, UserProfile } from '../types';
import { sounds } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';

interface StudyToolsGeneratorModalProps {
  profile: UserProfile;
  activeSubjectId: string;
  onClose: () => void;
  onSaveGeneratedTools: (quiz: Quiz, flashcards: Flashcard[]) => void;
}

const SAMPLE_TEXTS = [
  {
    title: "Basic Science: Photosynthesis",
    text: "Photosynthesis is the biological process by which green plants and some organisms use sunlight, water, and carbon dioxide to create oxygen and energy in the form of glucose sugar. Chlorophyll in leaves absorbs solar radiation, while roots draw groundwater via xylem tubes."
  },
  {
    title: "Mathematics: Fractions & Denominators",
    text: "When adding fractions with unlike denominators, one cannot simply add the numerators together. A common denominator representing the lowest common multiple (LCM) must be identified so both fractions represent identical partitioning of the whole."
  },
  {
    title: "Agricultural Science: Soil Erosion & Mulching",
    text: "Soil erosion is the washing away of the fertile topsoil by torrential rainfall and wind. Mulching involves covering the soil surface with dry plant leaves, grass clippings, or wood chips to conserve moisture, prevent water runoff, and enrich humus content."
  }
];

export const StudyToolsGeneratorModal: React.FC<StudyToolsGeneratorModalProps> = ({
  profile,
  activeSubjectId,
  onClose,
  onSaveGeneratedTools
}) => {
  const [inputText, setInputText] = useState(SAMPLE_TEXTS[0].text);
  const [targetAge, setTargetAge] = useState(profile.age);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    simplifiedText: string;
    analogy: string;
    quiz: Quiz;
    flashcards: Flashcard[];
  } | null>(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    sounds.playTap();
    setIsGenerating(true);

    try {
      const response = await fetch('/api/gemini/generate-study-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: inputText,
          targetAge,
          subjectId: activeSubjectId,
          classLevel: profile.classLevel
        })
      });

      const data = await response.json();
      setGeneratedResult(data);
      sounds.playSparkEarned();
      fireConfetti();
    } catch (err) {
      console.error('Study tools generator error:', err);
      // Offline mock generation fallback
      setGeneratedResult({
        simplifiedText: `### Simplified for Age ${targetAge}\n\nHere is the core idea: Just like a cook needs water, firewood, and raw yams to make a delicious meal, green plants need sunlight, groundwater, and air to make their own food!`,
        analogy: "Like cooking yam pottage on a kerosene stove: you need heat and raw ingredients to produce food.",
        quiz: {
          id: `quiz-gen-${Date.now()}`,
          subjectId: activeSubjectId,
          title: "Practice on Generated Material",
          class: profile.classLevel,
          sparksReward: 30,
          xpReward: 50,
          questions: [
            {
              id: `q-gen-1`,
              question: "What is the primary purpose of the process described?",
              options: ["To create food and energy", "To waste groundwater", "To stop plant growth", "To block sunlight"],
              correctIndex: 0,
              explanation: "Plants make their own nourishment and release oxygen.",
              everydayAnalogy: "Like a bakery producing fresh bread loaves every morning.",
              gapTopic: "Plant Nutrition"
            }
          ]
        },
        flashcards: [
          {
            id: `fc-gen-1`,
            subjectId: activeSubjectId,
            front: "What is the main energy source used?",
            back: "Sunlight absorbed by chlorophyll in leaves.",
            analogy: "Like solar panels catching light on top of a shop roof.",
            mastered: false,
            reviewCount: 0
          }
        ]
      });
      sounds.playSparkEarned();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDeck = () => {
    if (!generatedResult) return;
    onSaveGeneratedTools(generatedResult.quiz, generatedResult.flashcards);
    sounds.playCorrectAnswer();
    fireConfetti();
    onClose();
  };

  return (
    <div 
      id="study-tools-generator-overlay"
      className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-200">
                Pillar 2 • Automated Study Toolmaker
              </span>
              <h2 className="font-heading font-extrabold text-base sm:text-lg leading-tight">
                Notes & Textbook Transformer
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Preset sample buttons */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Or Try A Sample Excerpt:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_TEXTS.map((sample, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => setInputText(sample.text)}
                  className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Raw Text Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
              Raw Textbook or Class Notes:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste any textbook chapter, homework paragraph, or teacher notes here..."
              rows={4}
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Age Adaptive Control (Pillar 1) */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-slate-800/80 border border-emerald-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Target Age Calibration:
              </span>
              <span className="text-slate-500 text-[11px]">
                Rewrites vocabulary depth and sentence complexity for age {targetAge}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-md">
                Age {targetAge}
              </span>
              <input
                type="range"
                min="9"
                max="18"
                value={targetAge}
                onChange={(e) => setTargetAge(Number(e.target.value))}
                className="w-24 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Transforming into Quizzes & Flashcards...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Interactive Study Tools</span>
              </>
            )}
          </button>

          {/* Render Generated Results */}
          {generatedResult && (
            <div className="space-y-4 pt-2 animate-in fade-in">
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Generated Study Tools Pack
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Ready to Save
                  </span>
                </div>
              </div>

              {/* Age-Simplified Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  1. Age-Adaptive Simplification
                </span>
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {generatedResult.simplifiedText}
                </div>
                {generatedResult.analogy && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                    <span><strong>Everyday Analogy:</strong> {generatedResult.analogy}</span>
                  </div>
                )}
              </div>

              {/* Generated Quiz summary */}
              <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-slate-800 border border-orange-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs text-orange-700 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" /> 2. Practice Quiz ({generatedResult.quiz.questions.length} Questions)
                  </span>
                  <span>+{generatedResult.quiz.sparksReward} Sparks</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {generatedResult.quiz.title} • Includes automatic diagnostic feedback for missed questions.
                </p>
              </div>

              {/* Generated Flashcards summary */}
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-slate-800 border border-purple-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs text-purple-700 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Layers className="w-4 h-4" /> 3. Digital Flashcards ({generatedResult.flashcards.length} Cards)
                  </span>
                  <span>Offline Ready</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Interactive flip cards calibrated with zero-cost community analogies.
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveToDeck}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              >
                <Check className="w-4 h-4" />
                <span>Save All to Offline Storage (Dexie.js)</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
