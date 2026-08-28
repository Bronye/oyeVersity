import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Flame, 
  Trophy, 
  Star, 
  CheckCircle2, 
  Lock, 
  Zap, 
  ShieldCheck,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { UserProfile, Achievement } from '../types';
import { useGamificationStore, calculateLevel } from '../store/useGamificationStore';
import { sounds } from '../utils/audio';

interface RewardsModalProps {
  profile: UserProfile;
  achievements?: Achievement[];
  onClose: () => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  profile,
  onClose
}) => {
  const { totalXp, streakDays, sparks, badges, claimBadgeReward } = useGamificationStore();
  const levelInfo = calculateLevel(totalXp);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const unlockedCount = badges.filter(b => b.unlocked).length;

  const filteredBadges = badges.filter(b => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'mastery') return b.category === 'subject_mastery';
    if (selectedFilter === 'quiz') return b.category === 'quiz_excellence';
    if (selectedFilter === 'socratic') return b.category === 'socratic_inquiry';
    if (selectedFilter === 'streak') return b.category === 'streak';
    return true;
  });

  return (
    <div 
      id="rewards-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md text-xl">
              🏆
            </div>
            <div>
              <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                Achievements & Honor Roll
              </span>
              <h2 className="font-heading font-extrabold text-base sm:text-lg leading-tight text-slate-900 dark:text-white">
                Student Accomplishments
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Academic Rank Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <span className="text-5xl">{levelInfo.icon}</span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-200/80 px-2 py-0.5 rounded-md">
                  Level {levelInfo.level} Scholar
                </span>
                <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white mt-1">
                  {levelInfo.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Total Experience: <strong>{totalXp} XP</strong> • Next rank at {levelInfo.nextLevelXp} XP
                </p>
              </div>
            </div>

            {/* Progress bar to next rank */}
            <div className="w-full sm:w-44">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                <span>Progress</span>
                <span>{levelInfo.progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Streak Highlight */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-pulse" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  {streakDays} Consecutive Day Study Streak!
                </h4>
                <p className="text-xs text-slate-500">
                  Daily active learning grants a 1.2x XP boost and +20 XP daily streak bonus.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full shrink-0">
              Active Streak
            </span>
          </div>

          {/* Badges Filter Tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Earned Badges & Medals ({unlockedCount} / {badges.length})
              </h4>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 text-xs font-bold scrollbar-none">
              {[
                { id: 'all', label: 'All' },
                { id: 'mastery', label: 'Subject Mastery' },
                { id: 'quiz', label: 'Quiz Scores' },
                { id: 'socratic', label: 'Ask Amoye' },
                { id: 'streak', label: 'Streaks' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors ${
                    selectedFilter === tab.id
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredBadges.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    ach.unlocked
                      ? 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    ach.unlocked ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-slate-200 dark:bg-slate-700'
                  }`}>
                    {ach.unlocked ? ach.icon : <Lock className="w-4 h-4 text-slate-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {ach.title}
                      </h5>
                      {ach.unlocked && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      {ach.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-2">
                      <span>+{ach.rewardXp} XP • +{ach.rewardSparks} Sparks</span>
                      {ach.unlockedAt && (
                        <span className="text-slate-400 font-normal">
                          {ach.unlockedAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
