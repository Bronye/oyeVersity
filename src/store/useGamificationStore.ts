import { create } from 'zustand';
import { Badge, UserProfile } from '../types';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

export type { Badge };

export interface XpActivity {
  id: string;
  title: string;
  amount: number;
  icon: string;
  category: 'module' | 'quiz' | 'amoye' | 'streak' | 'quest' | 'badge';
  timestamp: string;
}

export interface DayStreakStatus {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  completed: boolean;
  isToday: boolean;
}

export interface LevelInfo {
  level: number;
  title: string;
  icon: string;
  currentLevelMinXp: number;
  nextLevelXp: number;
  xpRemaining: number;
  progressPercent: number;
}

export interface ToastCelebration {
  id: string;
  type: 'xp' | 'badge' | 'streak' | 'level';
  title: string;
  subtitle?: string;
  amount?: number;
  icon?: string;
}

export const LEVELS = [
  { level: 1, title: 'Novice Scholar', minXp: 0, maxXp: 200, icon: '🌱' },
  { level: 2, title: 'Curious Inquirer', minXp: 200, maxXp: 450, icon: '🔎' },
  { level: 3, title: 'Diligent Apprentice', minXp: 450, maxXp: 750, icon: '⚡' },
  { level: 4, title: 'Knowledge Seeker', minXp: 750, maxXp: 1150, icon: '📚' },
  { level: 5, title: 'Socratic Scholar', minXp: 1150, maxXp: 1650, icon: '💡' },
  { level: 6, title: 'Academic Vanguard', minXp: 1650, maxXp: 2300, icon: '🌟' },
  { level: 7, title: 'Grand Oyela Master', minXp: 2300, maxXp: 3500, icon: '👑' },
];

export function calculateLevel(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) {
      current = lvl;
    }
  }

  const range = current.maxXp - current.minXp;
  const currentInLevel = Math.max(0, xp - current.minXp);
  const progressPercent = Math.min(100, Math.round((currentInLevel / range) * 100));

  return {
    level: current.level,
    title: current.title,
    icon: current.icon,
    currentLevelMinXp: current.minXp,
    nextLevelXp: current.maxXp,
    xpRemaining: Math.max(0, current.maxXp - xp),
    progressPercent
  };
}

export const INITIAL_BADGES: Badge[] = [
  // Subject Mastery Badges
  {
    id: 'math-master',
    title: 'Mathematics Master',
    description: 'Master 2+ curriculum modules in Mathematics (Number Base & Fractions).',
    icon: '📐',
    category: 'subject_mastery',
    tier: 'gold',
    rewardXp: 100,
    rewardSparks: 50,
    target: 2,
    progress: 1,
    unlocked: false,
    criteria: 'Complete 2 Mathematics modules'
  },
  {
    id: 'science-pioneer',
    title: 'Science Pioneer',
    description: 'Master foundational Integrated Science units (Work, Energy & Force).',
    icon: '🔬',
    category: 'subject_mastery',
    tier: 'silver',
    rewardXp: 80,
    rewardSparks: 40,
    target: 1,
    progress: 0,
    unlocked: false,
    criteria: 'Complete 1 Science module'
  },
  {
    id: 'foundational-scholar',
    title: 'Foundational Scholar',
    description: 'Master your first full curriculum unit with zero remaining knowledge gaps.',
    icon: '🏛️',
    category: 'subject_mastery',
    tier: 'bronze',
    rewardXp: 50,
    rewardSparks: 25,
    target: 1,
    progress: 1,
    unlocked: true,
    unlockedAt: '2026-08-25',
    criteria: 'Complete your first interactive lesson unit'
  },

  // Quiz High Score Badges
  {
    id: 'quiz-prodigy',
    title: 'Quiz Prodigy (90%+)',
    description: 'Achieve a score of 90% or higher in any practice quiz arena.',
    icon: '🌟',
    category: 'quiz_excellence',
    tier: 'gold',
    rewardXp: 60,
    rewardSparks: 35,
    target: 90,
    progress: 92,
    unlocked: true,
    unlockedAt: '2026-08-26',
    criteria: 'Score 90% or higher in a quiz arena'
  },
  {
    id: 'quiz-flawless',
    title: 'Perfect 100',
    description: 'Score 100% on a full 5-question practice quiz without a single error.',
    icon: '💎',
    category: 'quiz_excellence',
    tier: 'diamond',
    rewardXp: 100,
    rewardSparks: 50,
    target: 100,
    progress: 92,
    unlocked: false,
    criteria: 'Achieve 100% accuracy on any quiz'
  },
  {
    id: 'quiz-veteran',
    title: 'Quiz Sprint Champion',
    description: 'Complete 3 practice quiz sessions to strengthen exam endurance.',
    icon: '⚡',
    category: 'quiz_excellence',
    tier: 'silver',
    rewardXp: 50,
    rewardSparks: 30,
    target: 3,
    progress: 2,
    unlocked: false,
    criteria: 'Complete 3 practice quizzes'
  },

  // Socratic Inquiry Badges ('Ask Amoye')
  {
    id: 'socratic-pioneer',
    title: 'Socratic Pioneer',
    description: 'Engage Amoye with curiosity without asking for direct answers.',
    icon: '💡',
    category: 'socratic_inquiry',
    tier: 'silver',
    rewardXp: 40,
    rewardSparks: 20,
    target: 1,
    progress: 1,
    unlocked: true,
    unlockedAt: '2026-08-25',
    criteria: 'Ask a conceptual question to Amoye'
  },
  {
    id: 'curious-mind',
    title: 'Deep Inquirer',
    description: 'Use the Ask Amoye feature 3+ times to uncover underlying concepts.',
    icon: '🧭',
    category: 'socratic_inquiry',
    tier: 'gold',
    rewardXp: 60,
    rewardSparks: 30,
    target: 3,
    progress: 2,
    unlocked: false,
    criteria: 'Ask 3 Socratic questions'
  },
  {
    id: 'analogy-master',
    title: 'Market Analogy Master',
    description: 'Learn an algebraic or scientific concept through everyday African market analogies.',
    icon: '🍞',
    category: 'socratic_inquiry',
    tier: 'bronze',
    rewardXp: 40,
    rewardSparks: 20,
    target: 1,
    progress: 1,
    unlocked: true,
    unlockedAt: '2026-08-26',
    criteria: 'Review an everyday Agege bread or market scale analogy'
  },

  // Streak Counter Badges
  {
    id: 'streak-ignited',
    title: 'The Spark Ignited',
    description: 'Begin your study journey with your first active daily study session.',
    icon: '✨',
    category: 'streak',
    tier: 'bronze',
    rewardXp: 30,
    rewardSparks: 15,
    target: 1,
    progress: 1,
    unlocked: true,
    unlockedAt: '2026-08-23',
    criteria: 'Complete day 1 of study'
  },
  {
    id: 'streak-fire',
    title: '3-Day Unbroken Fire',
    description: 'Maintain a consecutive study streak for 3 days in a row.',
    icon: '🔥',
    category: 'streak',
    tier: 'silver',
    rewardXp: 50,
    rewardSparks: 25,
    target: 3,
    progress: 5,
    unlocked: true,
    unlockedAt: '2026-08-26',
    criteria: 'Reach a 3-day study streak'
  },
  {
    id: 'streak-legend',
    title: '7-Day Warrior',
    description: 'Maintain an unbroken study streak for 7 consecutive days.',
    icon: '👑',
    category: 'streak',
    tier: 'gold',
    rewardXp: 100,
    rewardSparks: 60,
    target: 7,
    progress: 5,
    unlocked: false,
    criteria: 'Reach a 7-day study streak'
  },

  // Accessibility & Diagnostic Badges
  {
    id: 'data-guardian',
    title: '3G Data Guardian',
    description: 'Study using 3G Ultra-Data-Saver mode to preserve community bandwidth.',
    icon: '📶',
    category: 'data_saver',
    tier: 'bronze',
    rewardXp: 30,
    rewardSparks: 20,
    target: 1,
    progress: 0,
    unlocked: false,
    criteria: 'Activate 3G Ultra-Data Saver'
  },
  {
    id: 'gap-slayer',
    title: 'Zero-Gap Scholar',
    description: 'Diagnose and conquer a knowledge gap via an AI Side-Quest.',
    icon: '🎯',
    category: 'curriculum',
    tier: 'silver',
    rewardXp: 60,
    rewardSparks: 40,
    target: 1,
    progress: 0,
    unlocked: false,
    criteria: 'Complete a Diagnostic Side-Quest'
  }
];

interface GamificationState {
  // Core XP & Currency
  totalXp: number;
  sparks: number;
  
  // Streak Counter
  streakDays: number;
  lastActiveDate: string;
  streakFrozen: boolean;
  weeklyDaysActive: DayStreakStatus[];
  
  // Progress Counters
  modulesCompletedCount: number;
  completedModuleIds: string[];
  quizzesCompletedCount: number;
  highestQuizScore: number;
  askAmoyeUsageCount: number;
  
  // Badges & Achievements
  badges: Badge[];
  
  // Recent XP Log
  recentActivities: XpActivity[];
  
  // Celebrations & Notifications
  activeToast: ToastCelebration | null;
  newBadgeUnlocked: Badge | null;
  newLevelUnlocked: LevelInfo | null;
  
  // Actions
  earnXp: (amount: number, reason: string, icon?: string, category?: XpActivity['category']) => void;
  earnSparks: (amount: number, reason?: string) => void;
  spendSparks: (amount: number) => boolean;
  
  // Gamification triggers
  recordAskAmoyeUsage: (prompt?: string) => void;
  recordModuleStepCompleted: (moduleId: string, stepTitle?: string) => void;
  recordModuleCompleted: (moduleId: string, subjectId: string, moduleTitle: string) => void;
  recordQuizCompleted: (score: number, total: number, subjectTitle?: string) => void;
  recordSideQuestCompleted: (sideQuestId: string, rewardSparks: number) => void;
  recordFlashcardMastered: (cardTitle?: string) => void;
  
  // Streak check
  checkDailyStreak: () => void;
  dailyCheckIn: () => void;
  setStreakFrozen: (frozen: boolean) => void;
  
  // Badges
  unlockBadge: (badgeId: string) => void;
  claimBadgeReward: (badgeId: string) => void;
  
  // UI notifications
  dismissToast: () => void;
  dismissBadgeCelebration: () => void;
  dismissLevelCelebration: () => void;
  
  // Sync helper
  syncWithProfile: (profile: Partial<UserProfile>) => void;
}

// Load initial stored values if present in localStorage
function loadStoredState() {
  try {
    const raw = localStorage.getItem('oyela_gamification_state');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

const initialSaved = loadStoredState();

export const useGamificationStore = create<GamificationState>((set, get) => ({
  totalXp: initialSaved?.totalXp ?? 450,
  sparks: initialSaved?.sparks ?? 380,
  
  streakDays: initialSaved?.streakDays ?? 5,
  lastActiveDate: initialSaved?.lastActiveDate ?? new Date().toISOString().split('T')[0],
  streakFrozen: initialSaved?.streakFrozen ?? false,
  weeklyDaysActive: [
    { day: 'Mon', completed: true, isToday: false },
    { day: 'Tue', completed: true, isToday: false },
    { day: 'Wed', completed: true, isToday: false },
    { day: 'Thu', completed: true, isToday: true },
    { day: 'Fri', completed: false, isToday: false },
    { day: 'Sat', completed: false, isToday: false },
    { day: 'Sun', completed: false, isToday: false },
  ],
  
  modulesCompletedCount: initialSaved?.modulesCompletedCount ?? 1,
  completedModuleIds: initialSaved?.completedModuleIds ?? ['mod-math-01'],
  quizzesCompletedCount: initialSaved?.quizzesCompletedCount ?? 2,
  highestQuizScore: initialSaved?.highestQuizScore ?? 92,
  askAmoyeUsageCount: initialSaved?.askAmoyeUsageCount ?? 3,
  
  badges: initialSaved?.badges ?? INITIAL_BADGES,
  
  recentActivities: initialSaved?.recentActivities ?? [
    {
      id: 'act-1',
      title: 'Practice Quiz High Score (92%)',
      amount: 40,
      icon: '🏆',
      category: 'quiz',
      timestamp: 'Today, 2:15 PM'
    },
    {
      id: 'act-2',
      title: 'Agege Bread Fractions Inquiry with Amoye',
      amount: 15,
      icon: '💡',
      category: 'amoye',
      timestamp: 'Today, 1:40 PM'
    },
    {
      id: 'act-3',
      title: 'Number Base Systems Step 2 Completed',
      amount: 25,
      icon: '📝',
      category: 'module',
      timestamp: 'Yesterday'
    },
    {
      id: 'act-4',
      title: '5-Day Study Streak Maintained',
      amount: 20,
      icon: '🔥',
      category: 'streak',
      timestamp: 'Yesterday'
    }
  ],
  
  activeToast: null,
  newBadgeUnlocked: null,
  newLevelUnlocked: null,

  earnXp: (amount: number, reason: string, icon = '⭐', category: XpActivity['category'] = 'module') => {
    const currentXp = get().totalXp;
    const oldLevelInfo = calculateLevel(currentXp);
    const newTotalXp = currentXp + amount;
    const newLevelInfo = calculateLevel(newTotalXp);

    const newActivity: XpActivity = {
      id: `xp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: reason,
      amount,
      icon,
      category,
      timestamp: 'Just now'
    };

    set((state) => ({
      totalXp: newTotalXp,
      recentActivities: [newActivity, ...state.recentActivities.slice(0, 9)],
      activeToast: {
        id: `toast-${Date.now()}`,
        type: 'xp',
        title: `+${amount} XP Earned!`,
        subtitle: reason,
        amount,
        icon
      }
    }));

    sounds.playSparkEarned();

    // Check for Level Up!
    if (newLevelInfo.level > oldLevelInfo.level) {
      sounds.playLevelUp();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      set({
        newLevelUnlocked: newLevelInfo,
        activeToast: {
          id: `toast-lvl-${Date.now()}`,
          type: 'level',
          title: `Level Up! Level ${newLevelInfo.level}`,
          subtitle: `Congratulations! You are now a ${newLevelInfo.title}`,
          icon: newLevelInfo.icon
        }
      });
    }

    // Save to localStorage
    try {
      localStorage.setItem('oyela_gamification_state', JSON.stringify({
        ...get(),
        activeToast: null,
        newBadgeUnlocked: null,
        newLevelUnlocked: null
      }));
    } catch (e) {}
  },

  earnSparks: (amount: number, reason = 'Study Reward') => {
    sounds.playSparkEarned();
    set((state) => ({
      sparks: state.sparks + amount,
      activeToast: {
        id: `toast-sparks-${Date.now()}`,
        type: 'xp',
        title: `+${amount} Sparks!`,
        subtitle: reason,
        icon: '⚡'
      }
    }));
  },

  spendSparks: (amount: number) => {
    const current = get().sparks;
    if (current < amount) return false;
    set((state) => ({ sparks: state.sparks - amount }));
    return true;
  },

  // 1. EARN POINTS FOR USING 'ASK AMOYE' FEATURE
  recordAskAmoyeUsage: (prompt?: string) => {
    const newCount = get().askAmoyeUsageCount + 1;
    set({ askAmoyeUsageCount: newCount });

    // Award +15 XP and +5 Sparks
    get().earnXp(15, 'Engaged Socratic Study with Amoye', '💡', 'amoye');
    set((state) => ({ sparks: state.sparks + 5 }));

    // Check Socratic badges
    const badges = get().badges;
    // Badge 1: Socratic Pioneer (at least 1 question)
    const pioneer = badges.find(b => b.id === 'socratic-pioneer');
    if (pioneer && !pioneer.unlocked) {
      get().unlockBadge('socratic-pioneer');
    }

    // Badge 2: Deep Inquirer (3+ questions)
    const deep = badges.find(b => b.id === 'curious-mind');
    if (deep) {
      set((state) => ({
        badges: state.badges.map(b => b.id === 'curious-mind' ? { ...b, progress: newCount } : b)
      }));
      if (newCount >= 3 && !deep.unlocked) {
        get().unlockBadge('curious-mind');
      }
    }

    // Badge 3: Market Analogy Master if question touches analogies
    const lower = (prompt || '').toLowerCase();
    if (lower.includes('analogy') || lower.includes('bread') || lower.includes('scale') || lower.includes('market') || lower.includes('jerrycan')) {
      const analogyBadge = badges.find(b => b.id === 'analogy-master');
      if (analogyBadge && !analogyBadge.unlocked) {
        get().unlockBadge('analogy-master');
      }
    }
  },

  // 2. EARN POINTS FOR MODULE STEPS
  recordModuleStepCompleted: (moduleId: string, stepTitle?: string) => {
    get().earnXp(25, `Completed Step: ${stepTitle || 'Lesson Section'}`, '📝', 'module');
    set((state) => ({ sparks: state.sparks + 10 }));
  },

  // 3. EARN POINTS FOR COMPLETING MODULES & MASTERING A SUBJECT
  recordModuleCompleted: (moduleId: string, subjectId: string, moduleTitle: string) => {
    const alreadyCompleted = get().completedModuleIds.includes(moduleId);
    const newCompletedIds = alreadyCompleted ? get().completedModuleIds : [...get().completedModuleIds, moduleId];
    const newCount = newCompletedIds.length;

    set({
      completedModuleIds: newCompletedIds,
      modulesCompletedCount: newCount
    });

    // Award +50 XP and +25 Sparks for completing an entire module
    get().earnXp(50, `Mastered Unit: ${moduleTitle}`, '🏆', 'module');
    set((state) => ({ sparks: state.sparks + 25 }));

    // Check Subject Mastery Badge (e.g. Mathematics Master: 2 math modules)
    const mathMaster = get().badges.find(b => b.id === 'math-master');
    if (mathMaster) {
      const mathModulesDone = newCompletedIds.filter(id => id.includes('math')).length;
      set((state) => ({
        badges: state.badges.map(b => b.id === 'math-master' ? { ...b, progress: mathModulesDone } : b)
      }));
      if (mathModulesDone >= 2 && !mathMaster.unlocked) {
        get().unlockBadge('math-master');
      }
    }

    // Check Science Pioneer Badge
    if (subjectId.includes('science') || moduleId.includes('science')) {
      const sciMaster = get().badges.find(b => b.id === 'science-pioneer');
      if (sciMaster && !sciMaster.unlocked) {
        get().unlockBadge('science-pioneer');
      }
    }

    // Check Foundational Scholar
    const foundBadge = get().badges.find(b => b.id === 'foundational-scholar');
    if (foundBadge && !foundBadge.unlocked) {
      get().unlockBadge('foundational-scholar');
    }
  },

  // 4. EARN POINTS FOR COMPLETING QUIZZES & HIGH SCORES
  recordQuizCompleted: (score: number, total: number, subjectTitle = 'Practice Quiz') => {
    const accuracy = Math.round((score / total) * 100);
    const newCount = get().quizzesCompletedCount + 1;
    const newHighest = Math.max(get().highestQuizScore, accuracy);

    // Calculate XP reward
    let earnedXp = 40;
    let earnedSparks = 20;

    if (accuracy >= 90) {
      earnedXp += 30; // High score bonus
      earnedSparks += 15;
    }
    if (accuracy === 100) {
      earnedXp += 30; // Perfect 100 bonus
      earnedSparks += 20;
    }

    set({
      quizzesCompletedCount: newCount,
      highestQuizScore: newHighest
    });

    get().earnXp(earnedXp, `Completed ${subjectTitle} (${accuracy}% Accuracy)`, '🎯', 'quiz');
    set((state) => ({ sparks: state.sparks + earnedSparks }));

    // Check High Score Badges
    const badges = get().badges;

    // Badge: Quiz Prodigy (90%+)
    const prodigy = badges.find(b => b.id === 'quiz-prodigy');
    if (prodigy) {
      set((state) => ({
        badges: state.badges.map(b => b.id === 'quiz-prodigy' ? { ...b, progress: newHighest } : b)
      }));
      if (accuracy >= 90 && !prodigy.unlocked) {
        get().unlockBadge('quiz-prodigy');
      }
    }

    // Badge: Perfect 100
    const flawless = badges.find(b => b.id === 'quiz-flawless');
    if (flawless) {
      set((state) => ({
        badges: state.badges.map(b => b.id === 'quiz-flawless' ? { ...b, progress: newHighest } : b)
      }));
      if (accuracy === 100 && !flawless.unlocked) {
        get().unlockBadge('quiz-flawless');
      }
    }

    // Badge: Quiz Veteran (3 quizzes)
    const veteran = badges.find(b => b.id === 'quiz-veteran');
    if (veteran) {
      set((state) => ({
        badges: state.badges.map(b => b.id === 'quiz-veteran' ? { ...b, progress: newCount } : b)
      }));
      if (newCount >= 3 && !veteran.unlocked) {
        get().unlockBadge('quiz-veteran');
      }
    }
  },

  // 5. STREAK COUNTER FOR CONSECUTIVE DAYS OF STUDY
  checkDailyStreak: () => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = get().lastActiveDate;

    if (lastActive === today) {
      // Already checked in today, keep active status
      return;
    }

    const lastDate = new Date(lastActive);
    const currDate = new Date(today);
    const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = get().streakDays;

    if (diffDays === 1) {
      // Consecutive day!
      newStreak += 1;
      get().earnXp(20, `${newStreak}-Day Consecutive Study Streak!`, '🔥', 'streak');
    } else if (diffDays > 1) {
      if (get().streakFrozen) {
        // Streak saved by shield!
        set({ streakFrozen: false });
        get().earnXp(10, `Streak Freeze Shield protected your streak!`, '🛡️', 'streak');
      } else {
        // Streak resets to 1
        newStreak = 1;
      }
    }

    set({
      streakDays: newStreak,
      lastActiveDate: today
    });

    // Check streak badges
    if (newStreak >= 1) {
      const b1 = get().badges.find(b => b.id === 'streak-ignited');
      if (b1 && !b1.unlocked) get().unlockBadge('streak-ignited');
    }
    if (newStreak >= 3) {
      const b3 = get().badges.find(b => b.id === 'streak-fire');
      if (b3 && !b3.unlocked) get().unlockBadge('streak-fire');
    }
    if (newStreak >= 7) {
      const b7 = get().badges.find(b => b.id === 'streak-legend');
      if (b7 && !b7.unlocked) get().unlockBadge('streak-legend');
    }
  },

  dailyCheckIn: () => get().checkDailyStreak(),

  setStreakFrozen: (frozen: boolean) => set({ streakFrozen: frozen }),

  recordSideQuestCompleted: (sideQuestId: string, rewardSparks: number) => {
    get().earnXp(40, 'Conquered Diagnostic Side Quest', '🎯', 'quest');
    set((state) => ({ sparks: state.sparks + rewardSparks }));

    const gapBadge = get().badges.find(b => b.id === 'gap-slayer');
    if (gapBadge && !gapBadge.unlocked) {
      get().unlockBadge('gap-slayer');
    }
  },

  recordFlashcardMastered: (cardTitle?: string) => {
    get().earnXp(10, `Mastered Flashcard: ${cardTitle || 'Key Concept'}`, '🗂️', 'module');
    set((state) => ({ sparks: state.sparks + 5 }));
  },

  // BADGE UNLOCK SYSTEM
  unlockBadge: (badgeId: string) => {
    const badge = get().badges.find(b => b.id === badgeId);
    if (!badge || badge.unlocked) return;

    sounds.playBadgeUnlocked();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    const today = new Date().toISOString().split('T')[0];

    set((state) => ({
      badges: state.badges.map(b => b.id === badgeId ? { ...b, unlocked: true, unlockedAt: today } : b),
      newBadgeUnlocked: { ...badge, unlocked: true, unlockedAt: today },
      activeToast: {
        id: `toast-badge-${Date.now()}`,
        type: 'badge',
        title: `Badge Unlocked: ${badge.title}`,
        subtitle: badge.description,
        icon: badge.icon
      }
    }));

    // Award badge bonus XP & Sparks
    if (badge.rewardXp) {
      get().earnXp(badge.rewardXp, `Honor Medal: ${badge.title}`, badge.icon, 'badge');
    }
    if (badge.rewardSparks) {
      get().earnSparks(badge.rewardSparks, `Honor Reward: ${badge.title}`);
    }
  },

  claimBadgeReward: (badgeId: string) => {
    const badge = get().badges.find(b => b.id === badgeId);
    if (badge && badge.unlocked) {
      sounds.playSparkEarned();
      if (badge.rewardSparks) {
        get().earnSparks(badge.rewardSparks, `Claimed: ${badge.title}`);
      }
    }
  },

  dismissToast: () => set({ activeToast: null }),
  dismissBadgeCelebration: () => set({ newBadgeUnlocked: null }),
  dismissLevelCelebration: () => set({ newLevelUnlocked: null }),

  syncWithProfile: (profile: Partial<UserProfile>) => {
    set((state) => ({
      totalXp: profile.totalXp !== undefined ? Math.max(state.totalXp, profile.totalXp) : state.totalXp,
      sparks: profile.sparks !== undefined ? Math.max(state.sparks, profile.sparks) : state.sparks,
      streakDays: profile.streakDays !== undefined ? Math.max(state.streakDays, profile.streakDays) : state.streakDays
    }));
  }
}));
