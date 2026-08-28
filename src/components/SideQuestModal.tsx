import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Target,
  Trophy
} from 'lucide-react';
import { SideQuest } from '../types';
import { sounds } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';

interface SideQuestModalProps {
  sideQuest: SideQuest;
  onClose: () => void;
  onCompleteQuest: (sideQuestId: string, rewardSparks: number) => void;
}

export const SideQuestModal: React.FC<SideQuestModalProps> = ({
  sideQuest,
  onClose,
  onCompleteQuest
}) => {
  const questions = sideQuest.questions || [];
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const curQ = questions[currentQIndex];

  const handleSelectOption = (idx: number) => {
    if (hasChecked) return;
    setSelectedOpt(idx);
    setHasChecked(true);

    if (curQ && idx === curQ.correctIndex) {
      sounds.playCorrectAnswer();
    } else {
      sounds.playTap();
    }
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOpt(null);
      setHasChecked(false);
    } else {
      setIsCompleted(true);
      sounds.playSparkEarned();
      fireConfetti();
      onCompleteQuest(sideQuest.id, sideQuest.sparksReward);
    }
  };

  return (
    <div 
      id="sidequest-modal-overlay"
      className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-400 dark:border-amber-600 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-white animate-spin" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-100">
                Knowledge Gap Side-Quest
              </span>
              <h2 className="font-heading font-extrabold text-base sm:text-lg leading-tight">
                {sideQuest.title}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Reason Badge */}
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{sideQuest.reason}</span>
          </div>

          {/* Analogy Story Card */}
          {sideQuest.analogyStory && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-orange-600 flex items-center gap-1.5 mb-1.5">
                <Flame className="w-4 h-4 fill-orange-500" />
                The Everyday Analogy Story
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {sideQuest.analogyStory}
              </p>
            </div>
          )}

          {/* If completed celebration screen */}
          {isCompleted ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                Knowledge Gap Cleared!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                You resolved the misunderstanding around <strong>{sideQuest.gapTopic}</strong> using everyday mental models!
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100 text-amber-900 font-extrabold text-sm border border-amber-300">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>+{sideQuest.sparksReward} Sparks Added to Balance!</span>
              </div>
            </div>
          ) : curQ ? (
            /* Interactive Challenge Question */
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-700 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold uppercase tracking-wider">
                  Challenge {currentQIndex + 1} of {questions.length}
                </span>
                <span className="font-extrabold text-orange-600">
                  +{sideQuest.sparksReward} Sparks Reward
                </span>
              </div>

              <p className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {curQ.question}
              </p>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {curQ.options.map((opt, oIdx) => {
                  const isSelected = selectedOpt === oIdx;
                  const isCorrect = oIdx === curQ.correctIndex;
                  let style = 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-amber-400';

                  if (hasChecked) {
                    if (isCorrect) {
                      style = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
                    } else if (isSelected) {
                      style = 'bg-red-100 border-red-500 text-red-900';
                    } else {
                      style = 'opacity-50 border-slate-200';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={hasChecked}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
                    >
                      <span>{opt}</span>
                      {hasChecked && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation note */}
              {hasChecked && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                  <p className="font-bold">Everyday Fix:</p>
                  <p className="mt-0.5 opacity-90">{curQ.explanation}</p>
                </div>
              )}
            </div>
          ) : null}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
          >
            {isCompleted ? 'Close' : 'Save for Later'}
          </button>

          {!isCompleted && hasChecked && (
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-colors"
            >
              <span>{currentQIndex < questions.length - 1 ? 'Next Question' : 'Complete Quest!'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
