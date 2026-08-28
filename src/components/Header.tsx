import React from 'react';
import { 
  Flame, 
  Zap, 
  Trophy, 
  Wifi, 
  WifiOff, 
  Lock, 
  Wand2, 
  User, 
  SlidersHorizontal,
  Sparkles,
  Award
} from 'lucide-react';
import { UserProfile } from '../types';
import { useGamificationStore } from '../store/useGamificationStore';

interface HeaderProps {
  profile: UserProfile;
  onOpenParentPortal: () => void;
  onOpenStudyTools: () => void;
  onOpenOnboarding: () => void;
  onToggleLowBandwidth: () => void;
  onOpenRewards?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenParentPortal,
  onOpenStudyTools,
  onOpenOnboarding,
  onToggleLowBandwidth,
  onOpenRewards
}) => {
  const { totalXp, streakDays, sparks } = useGamificationStore();
  const displayXp = totalXp ?? profile.totalXp;
  const displayStreak = streakDays ?? profile.streakDays;
  const displaySparks = sparks ?? profile.sparks;
  return (
    <header 
      id="dashboard-header" 
      className={`h-16 w-full sticky top-0 z-30 transition-colors duration-200 shrink-0 ${
        profile.lowBandwidthMode 
          ? 'bg-slate-900 border-b border-slate-800 text-white' 
          : 'bg-white border-b border-slate-200 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
        
        {/* Left: Brand Identity with Vibrant Emerald Logo Mark */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <span className="text-white font-black text-xl leading-none">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white leading-tight">
                AMOYE
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-0.5 hidden sm:inline">
                Òyè-versity
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

          {/* Student Class / Scholar Badge */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-700 dark:text-slate-300 font-bold">
              {profile.name}
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md text-[11px] font-bold border border-slate-200 dark:border-slate-700">
              {profile.classLevel}
            </span>
          </div>
        </div>

        {/* Center / Right: Vibrant Pill Badges matching Vibrant Palette Design */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* XP Badge */}
          <button 
            id="stat-xp-pill"
            onClick={onOpenRewards}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800 cursor-pointer transition-colors"
            title="Total Experience Points (Click to view Level & Badges)"
          >
            <span className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold">
              {displayXp} XP
            </span>
          </button>

          {/* Streak Badge */}
          <button 
            id="stat-streak-pill"
            onClick={onOpenRewards}
            className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 dark:hover:bg-orange-900/60 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-800 cursor-pointer transition-colors"
            title="Daily consecutive study streak (Click to view streaks)"
          >
            <span className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-bold flex items-center gap-1">
              <span>🔥</span>
              <span>{displayStreak} DAY STREAK</span>
            </span>
          </button>

          {/* Sparks Balance Badge (Mobile/Desktop) */}
          <div 
            id="stat-sparks-pill"
            className="hidden sm:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800"
            title="Sparks Balance"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-bold">
              {displaySparks} Sparks
            </span>
          </div>

          {/* Functional Actions: Tools, 3G, Portal */}
          <div className="flex items-center gap-1.5">
            {/* Auto Study Tools Generator Trigger */}
            <button
              id="btn-open-study-tools"
              onClick={onOpenStudyTools}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
              title="Pillar 2: AI Toolmaker - Convert notes into quizzes & flashcards"
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Study Tools</span>
            </button>

            {/* Low-Bandwidth / 3G Ultra Data Saver Toggle */}
            <button
              id="btn-toggle-3g"
              onClick={onToggleLowBandwidth}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                profile.lowBandwidthMode
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
              title={profile.lowBandwidthMode ? '3G Ultra-Data Saver ON' : 'Toggle 3G Ultra-Data Saver'}
            >
              {profile.lowBandwidthMode ? (
                <WifiOff className="w-3.5 h-3.5" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="hidden sm:inline">3G</span>
            </button>

            {/* Parent / Supervisor Portal */}
            <button
              id="btn-parent-portal-desktop"
              onClick={onOpenParentPortal}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold transition-all flex items-center gap-1"
              title="Supervisor / Parent Telemetry (PIN Protected)"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xl:inline">Parent</span>
            </button>

            {/* Avatar Circle matching design HTML */}
            <button
              id="btn-user-avatar"
              onClick={onOpenOnboarding}
              title="Edit Profile & Learning Preferences"
              className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {profile.avatar === 'cap-student' ? '🎓' : profile.name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AM'}
              </div>
            </button>
          </div>

        </div>

      </div>

      {/* Low-Bandwidth telemetry banner when activated */}
      {profile.lowBandwidthMode && (
        <div className="py-1 px-4 bg-emerald-950/90 border-t border-emerald-800 flex items-center justify-between text-[11px] text-emerald-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Ultra-Data-Saver Active • Assets cached locally via Dexie.js (Saved 8.4 MB)
          </span>
          <span className="font-mono text-emerald-400">● SYNCED OFFLINE</span>
        </div>
      )}
    </header>
  );
};
