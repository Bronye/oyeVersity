import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Flame, 
  HelpCircle, 
  BookOpen, 
  Bot,
  Star,
  Check
} from 'lucide-react';
import { LearningModule, LearningStep } from '../types';
import { sounds } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import { useGamificationStore } from '../store/useGamificationStore';

interface ModuleStudyModalProps {
  module: LearningModule;
  onClose: () => void;
  onCompleteStep: (moduleId: string, stepIndex: number) => void;
  onOpenAmoyeWithPrompt: (prompt: string) => void;
}

export const ModuleStudyModal: React.FC<ModuleStudyModalProps> = ({
  module,
  onClose,
  onCompleteStep,
  onOpenAmoyeWithPrompt
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(
    Math.min(module.current_step, Math.max(0, (module.steps?.length || 1) - 1))
  );

  const steps = module.steps || [];
  const currentStep: LearningStep | undefined = steps[activeStepIndex];

  // Quick check question state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // If no steps defined, provide rich default step
  const fallbackStep: LearningStep = {
    id: `step-${module.id}-default`,
    title: `${module.title}: Fundamentals`,
    summary: 'Mastering the foundational principles step-by-step.',
    everydayAnalogy: 'Think of pouring water into a measuring cup: you check the level line to get the exact amount.',
    conceptMarkdown: `### ${module.title}\n\nEvery journey in ${module.title} starts by understanding how the basic units interact. When you practice consistently, you build neural pathways that make advanced problems feel natural!`,
    quickCheckQuestion: {
      question: `What is the key goal of studying ${module.title}?`,
      options: [
        'To memorize without understanding',
        'To understand how patterns operate in everyday life',
        'To rush through without checking work',
        'To avoid practical questions'
      ],
      correctAnswer: 1,
      explanation: 'True mastery comes from connecting academic patterns to everyday life.'
    }
  };

  const step = currentStep || fallbackStep;

  const handleOptionSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedOption(index);
    setHasAnswered(true);
    const correct = index === step.quickCheckQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      sounds.playCorrectAnswer();
      fireConfetti();
    } else {
      sounds.playTap();
    }
  };

  const handleNext = () => {
    sounds.playTap();
    onCompleteStep(module.id, activeStepIndex + 1);

    // Record step XP
    try {
      useGamificationStore.getState().recordModuleStepCompleted(module.id, currentStep?.title);
    } catch (e) {}

    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setIsCorrect(false);
    } else {
      // Completed all steps!
      try {
        useGamificationStore.getState().recordModuleCompleted(module.id, module.subject_id, module.title);
      } catch (e) {}
      sounds.playSparkEarned();
      fireConfetti();
      onClose();
    }
  };

  return (
    <div 
      id="module-study-overlay"
      className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Module {module.order} • Step {activeStepIndex + 1} of {Math.max(steps.length, 1)}
              </span>
              <h2 className="font-heading font-extrabold text-base sm:text-lg leading-tight text-slate-900 dark:text-white">
                {module.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Stepper Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 flex">
          {Array.from({ length: Math.max(steps.length, 1) }).map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 transition-all duration-300 ${
                i <= activeStepIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Step Title & Summary */}
          <div>
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
              {step.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {step.summary}
            </p>
          </div>

          {/* Everyday Analogy Callout Card (Competition-Winning Feature 2) */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 flex items-start gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Zero-Cost Everyday Analogy
              </h4>
              <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 mt-1 leading-relaxed font-medium">
                {step.everydayAnalogy}
              </p>
            </div>
          </div>

          {/* Core Concept Markdown text */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
            {step.conceptMarkdown}
          </div>

          {/* Quick Check Question Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                Quick Concept Check
              </span>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950 px-2 py-0.5 rounded-full border border-orange-200">
                +15 Sparks
              </span>
            </div>

            <p className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              {step.quickCheckQuestion.question}
            </p>

            {/* Options */}
            <div className="space-y-2 pt-1">
              {step.quickCheckQuestion.options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrectOption = oIdx === step.quickCheckQuestion.correctAnswer;
                
                let btnStyle = 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-emerald-400';
                if (hasAnswered) {
                  if (isCorrectOption) {
                    btnStyle = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-100 dark:bg-red-950 border-red-500 text-red-900 dark:text-red-200';
                  } else {
                    btnStyle = 'opacity-50 border-slate-200';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleOptionSelect(oIdx)}
                    disabled={hasAnswered}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {hasAnswered && isCorrectOption && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Explanation */}
            {hasAnswered && (
              <div className={`p-3 rounded-xl text-xs sm:text-sm mt-3 ${
                isCorrect 
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200' 
                  : 'bg-orange-50 text-orange-900 border border-orange-300 dark:bg-orange-950/60 dark:text-orange-200'
              }`}>
                <p className="font-bold">
                  {isCorrect ? '🎉 Correct! Well done.' : '💡 Good effort! Review the step:'}
                </p>
                <p className="mt-0.5 text-xs opacity-90">
                  {step.quickCheckQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          {/* Ask Amoye about this concept button */}
          <button
            onClick={() => {
              onClose();
              onOpenAmoyeWithPrompt(`Explain "${step.title}" from ${module.title} using a simple everyday analogy.`);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-slate-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <Bot className="w-4 h-4 text-emerald-600" />
            <span>Ask Amoye to Explain</span>
          </button>

          {/* Continue / Next Step Button */}
          <div className="flex items-center gap-2">
            {activeStepIndex > 0 && (
              <button
                onClick={() => {
                  setActiveStepIndex(prev => prev - 1);
                  setSelectedOption(null);
                  setHasAnswered(false);
                }}
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100"
              >
                Previous
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-colors"
            >
              <span>{activeStepIndex < steps.length - 1 ? 'Next Step' : 'Finish Module!'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
