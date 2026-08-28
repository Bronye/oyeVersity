import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Lock, 
  TrendingUp, 
  Zap, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { useGamificationStore, calculateLevel, Badge } from '../store/useGamificationStore';
import { sounds } from '../utils/audio';

interface GamificationHubProps {
  onOpenAskAmoye: () => void;
  onOpenQuizzes: () => void;
  onOpenFlashcards: () => void;
  onOpenRewards: () => void;
  onOpenStudyNotes: () => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({
  onOpenAskAmoye,
  onOpenQuizzes,
  onOpenFlashcards,
  onOpenRewards,
  onOpenStudyNotes
}) => {
  const {
    totalXp,
    sparks,
    streakDays,
    weeklyDaysActive,
    streakFrozen,
    badges,
    recentActivities,
    modulesCompletedCount,
    quizzesCompletedCount,
    highestQuizScore,
    askAmoyeUsageCount,
    recordAskAmoyeUsage
  } = useGamificationStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const levelInfo = calculateLevel(totalXp);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  const filteredBadges = badges.filter(b => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'mastery') return b.category === 'subject_mastery';
    if (activeCategory === 'quiz') return b.category === 'quiz_excellence';
    if (activeCategory === 'socratic') return b.category === 'socratic_inquiry';
    if (activeCategory === 'streak') return b.category === 'streak';
    return true;
  });

  return (
    <div id="gamification-hub-container" className="flex flex-col gap-5">
      
      {/* 1. TOP STATS & STREAK BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Level & XP Progress Card (Col 7) */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-xl font-black">
                  {levelInfo.icon}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Level {levelInfo.level} Scholar
                  </span>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                    {levelInfo.title}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {totalXp} XP
                </span>
                <p className="text-[11px] text-slate-400">
                  {levelInfo.xpRemaining} XP to Level {levelInfo.level + 1}
                </p>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 mt-1">
                <span>{levelInfo.currentLevelMinXp} XP</span>
                <span className="text-emerald-600 font-bold">{levelInfo.progressPercent}% to next rank</span>
                <span>{levelInfo.nextLevelXp} XP</span>
              </div>
            </div>
          </div>

          {/* XP Source Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Modules</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                +{modulesCompletedCount * 50} XP
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Quizzes</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                +{quizzesCompletedCount * 40} XP
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Ask Amoye</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                +{askAmoyeUsageCount * 15} XP
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Study Streak</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                +{streakDays * 20} XP
              </span>
            </div>
          </div>
        </div>

        {/* Streak Counter & Weekly Heatmap (Col 5) */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-xl shrink-0">
                <span className="animate-pulse">🔥</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Study Streak
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight flex items-center gap-1.5">
                  <span>{streakDays} Days</span>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-bold px-2 py-0.5 rounded-full">
                    1.2x Boost
                  </span>
                </h3>
              </div>
            </div>

            {streakFrozen && (
              <span className="text-[10px] bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Frozen
              </span>
            )}
          </div>

          {/* Weekly Day Dots */}
          <div className="mt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Weekly Consistency Tracker
            </span>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {weeklyDaysActive.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    {item.day}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    item.completed 
                      ? 'bg-orange-500 text-white shadow-xs' 
                      : item.isToday
                        ? 'bg-orange-100 text-orange-700 border-2 border-orange-400 dark:bg-orange-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {item.completed ? '✓' : item.isToday ? '•' : '○'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1">
            <span>🔥</span>
            <span>Study today to protect your 1.2x XP multiplier bonus!</span>
          </p>
        </div>

      </div>

      {/* 2. XP ACTION ACCELERATORS ("WAYS TO EARN XP TODAY") */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-orange-50 dark:from-slate-850 dark:to-slate-900 rounded-2xl border border-emerald-100 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Ways to Earn XP Today
            </h4>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            Daily Goal: Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action 1: Ask Amoye */}
          <button
            onClick={() => { sounds.playTap(); onOpenAskAmoye(); }}
            className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-750 hover:border-emerald-400 text-left transition-all group shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">💡</span>
              <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                +15 XP
              </span>
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-white block group-hover:text-emerald-600 transition-colors">
                Ask Amoye
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Explore an everyday analogy
              </span>
            </div>
          </button>

          {/* Action 2: Practice Quiz */}
          <button
            onClick={() => { sounds.playTap(); onOpenQuizzes(); }}
            className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-750 hover:border-emerald-400 text-left transition-all group shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">🎯</span>
              <span className="text-[10px] font-extrabold bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-md">
                +40 to +100 XP
              </span>
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-white block group-hover:text-orange-600 transition-colors">
                Take Practice Quiz
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                90%+ earns Prodigy Medal
              </span>
            </div>
          </button>

          {/* Action 3: Complete Module */}
          <button
            onClick={() => { sounds.playTap(); onOpenStudyNotes(); }}
            className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-750 hover:border-emerald-400 text-left transition-all group shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">📝</span>
              <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                +50 XP
              </span>
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-white block group-hover:text-emerald-600 transition-colors">
                Master Next Unit
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Unlocks Subject Mastery
              </span>
            </div>
          </button>

          {/* Action 4: Flashcards */}
          <button
            onClick={() => { sounds.playTap(); onOpenFlashcards(); }}
            className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-750 hover:border-emerald-400 text-left transition-all group shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">🗂️</span>
              <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md">
                +20 XP
              </span>
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-white block group-hover:text-amber-600 transition-colors">
                Review Flashcards
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Active recall practice
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. BADGE SYSTEM: ACHIEVEMENTS & MEDALS SHOWCASE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Earned Badges & Honor Roll
              </h3>
              <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                {unlockedCount} / {badges.length} Unlocked
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rewards for subject mastery, 90%+ quiz excellence, Socratic curiosity, and daily streaks.
            </p>
          </div>

          <button
            onClick={() => { sounds.playTap(); onOpenRewards(); }}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0"
          >
            <span>View Full Trophy Room</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs font-bold">
          {[
            { id: 'all', label: 'All Badges' },
            { id: 'mastery', label: 'Subject Mastery' },
            { id: 'quiz', label: 'Quiz High Scores' },
            { id: 'socratic', label: 'Socratic Inquiry' },
            { id: 'streak', label: 'Streaks' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === tab.id
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 relative overflow-hidden ${
                badge.unlocked
                  ? 'bg-slate-50 dark:bg-slate-850 border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75'
              }`}
            >
              {/* Badge Icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                badge.unlocked
                  ? badge.tier === 'diamond' 
                    ? 'bg-cyan-100 dark:bg-cyan-950 border border-cyan-300'
                    : badge.tier === 'gold'
                      ? 'bg-amber-100 dark:bg-amber-950 border border-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 border border-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}>
                {badge.unlocked ? badge.icon : <Lock className="w-4 h-4 text-slate-400" />}
              </div>

              {/* Badge Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-white truncate">
                    {badge.title}
                  </h5>
                  {badge.unlocked ? (
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded shrink-0">
                      EARNED
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      {badge.progress !== undefined && badge.target ? `${badge.progress}/${badge.target}` : 'LOCKED'}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug line-clamp-2">
                  {badge.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-bold mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-amber-600 dark:text-amber-400">
                    +{badge.rewardXp} XP • +{badge.rewardSparks} Sparks
                  </span>
                  {badge.unlockedAt && (
                    <span className="text-slate-400">
                      {badge.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. RECENT XP ACTIVITY TICKER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Recent Experience Feed</span>
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">
            Real-time Gamification Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {recentActivities.slice(0, 4).map((act) => (
            <div 
              key={act.id}
              className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2.5"
            >
              <span className="text-base">{act.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-xs text-slate-800 dark:text-white truncate block">
                  {act.title}
                </span>
                <span className="text-[10px] text-slate-400">
                  {act.timestamp}
                </span>
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                +{act.amount} XP
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
