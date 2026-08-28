import React, { useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Award, 
  ChevronRight, 
  CheckCircle2,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useGamificationStore } from '../store/useGamificationStore';
import { sounds } from '../utils/audio';

export const GamificationCelebration: React.FC = () => {
  const {
    activeToast,
    newBadgeUnlocked,
    newLevelUnlocked,
    dismissToast,
    dismissBadgeCelebration,
    dismissLevelCelebration
  } = useGamificationStore();

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeToast, dismissToast]);

  return (
    <>
      {/* 1. FLOATING TOAST NOTIFICATION */}
      {activeToast && (
        <div 
          id="gamification-toast"
          className="fixed bottom-20 right-4 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-3.5 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
            {activeToast.icon || '⭐'}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-sm text-white truncate">
              {activeToast.title}
            </h5>
            {activeToast.subtitle && (
              <p className="text-xs text-slate-300 truncate">
                {activeToast.subtitle}
              </p>
            )}
          </div>
          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. BADGE UNLOCKED MODAL */}
      {newBadgeUnlocked && (
        <div 
          id="badge-unlocked-modal"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-600/60 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center relative">
            <button
              onClick={dismissBadgeCelebration}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full mb-3">
              🎉 New Achievement Unlocked!
            </span>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-200 dark:from-amber-950 dark:to-amber-900 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-inner mb-3">
              {newBadgeUnlocked.icon}
            </div>

            <h3 className="text-xl font-heading font-black text-slate-900 dark:text-white">
              {newBadgeUnlocked.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-xs">
              {newBadgeUnlocked.description}
            </p>

            <div className="flex items-center gap-3 mt-4 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +{newBadgeUnlocked.rewardXp} XP Awarded
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                +{newBadgeUnlocked.rewardSparks} Sparks Awarded
              </span>
            </div>

            <button
              onClick={dismissBadgeCelebration}
              className="mt-5 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-98"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {/* 3. LEVEL UP MODAL */}
      {newLevelUnlocked && (
        <div 
          id="level-up-modal"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center relative">
            <button
              onClick={dismissLevelCelebration}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full mb-3">
              ⚡ Academic Level Up!
            </span>

            <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-4xl shadow-inner mb-3">
              {newLevelUnlocked.icon}
            </div>

            <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white">
              Level {newLevelUnlocked.level}
            </h3>

            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {newLevelUnlocked.title}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Your dedication to Socratic study and everyday problem solving is paying off.
            </p>

            <button
              onClick={dismissLevelCelebration}
              className="mt-5 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-98"
            >
              Claim Rank & Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};
