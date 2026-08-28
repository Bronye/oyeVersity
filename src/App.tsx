import React, { useEffect, useState } from 'react';
import { 
  initDatabase, 
  getUserProfile, 
  saveUserProfile, 
  getSubjects, 
  getQuizzes, 
  getFlashcards, 
  getKnowledgeGaps, 
  addKnowledgeGap,
  updateFlashcardStatus,
  addFlashcard,
  addQuiz
} from './db/dexie';
import { 
  UserProfile, 
  SubjectData, 
  LearningModule, 
  SideQuest, 
  Quiz, 
  Flashcard, 
  KnowledgeGap, 
  Achievement 
} from './types';
import { LoadingScreen } from './components/LoadingScreen';
import { Header } from './components/Header';
import { LearningPath } from './components/LearningPath';
import { BottomDock } from './components/BottomDock';
import { AskAmoyeWorkspace } from './components/AskAmoyeWorkspace';
import { ModuleStudyModal } from './components/ModuleStudyModal';
import { SideQuestModal } from './components/SideQuestModal';
import { QuizzesModal } from './components/QuizzesModal';
import { FlashcardsModal } from './components/FlashcardsModal';
import { StudyToolsGeneratorModal } from './components/StudyToolsGeneratorModal';
import { MarketModal } from './components/MarketModal';
import { RewardsModal } from './components/RewardsModal';
import { ParentPortalModal } from './components/ParentPortalModal';
import { OnboardingModal } from './components/OnboardingModal';
import { GamificationHub } from './components/GamificationHub';
import { GamificationCelebration } from './components/GamificationCelebration';
import { useGamificationStore, calculateLevel } from './store/useGamificationStore';
import { sounds } from './utils/audio';
import { Sparkles, Maximize2, Send, Trophy, Flame, Award, BarChart3 } from 'lucide-react';

export default function App() {
  // App initialization state
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    id: 'student-primary',
    name: 'Amara Okafor',
    age: 12,
    classLevel: 'JSS 1',
    avatar: 'cap-student',
    sparks: 380,
    streakDays: 5,
    totalXp: 450,
    lastHiScore: 92,
    weeklyStudyMinutes: 185,
    lowBandwidthMode: false,
    cognitiveStyle: 'everyday-analogy',
    parentPin: '1234',
    isOnboarded: true,
    lastActiveDate: new Date().toISOString().split('T')[0]
  });

  // Curriculum & Study Data state
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string>('math-jss1');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGap[]>([]);

  // Overlays / Active View State (Single-Page Overlay Architecture)
  const [activeOverlay, setActiveOverlay] = useState<
    'askAmoye' | 'studyTools' | 'moduleStudy' | 'sideQuest' | 'quizzes' | 'flashcards' | 'market' | 'rewards' | 'parentPortal' | 'onboarding' | null
  >(null);

  // Selected sub-elements for modals
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [activeSideQuest, setActiveSideQuest] = useState<SideQuest | null>(null);
  const [amoyeInitialPrompt, setAmoyeInitialPrompt] = useState<string | null>(null);

  // Active Workspace Embedded State (Vibrant Palette Socratic Engine)
  const [inlineAmoyePrompt, setInlineAmoyePrompt] = useState('');
  const [isInlineThinking, setIsInlineThinking] = useState(false);
  const [inlineAmoyeMessages, setInlineAmoyeMessages] = useState<Array<{ sender: 'user' | 'amoye'; text: string; analogy?: string }>>([
    {
      sender: 'user',
      text: 'Why is 1/2 bigger than 1/4?'
    },
    {
      sender: 'amoye',
      text: 'Imagine cutting a fresh loaf of Agege bread in 2 pieces versus 4 pieces. Which single piece fills your stomach more?',
      analogy: 'Loaf of Agege bread'
    }
  ]);
  const [dismissedGap, setDismissedGap] = useState(false);
  const [mobileTab, setMobileTab] = useState<'workspace' | 'path'>('workspace');
  const [dashboardView, setDashboardView] = useState<'workspace' | 'gamification'>('workspace');

  // Zustand Gamification state
  const {
    totalXp,
    streakDays,
    sparks,
    badges,
    dailyCheckIn,
    recordAskAmoyeUsage
  } = useGamificationStore();
  const currentLevelInfo = calculateLevel(totalXp);
  const displayXp = totalXp ?? profile.totalXp;
  const displayStreak = streakDays ?? profile.streakDays;
  const displaySparks = sparks ?? profile.sparks;

  // Run daily check-in on app mount to track streak
  useEffect(() => {
    dailyCheckIn();
  }, [dailyCheckIn]);

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'ach-first-step',
      title: 'First Step',
      description: 'Completed your first interactive lesson module.',
      icon: '🌱',
      unlocked: true,
      category: 'study'
    },
    {
      id: 'ach-socratic-pioneer',
      title: 'Socratic Pioneer',
      description: 'Engaged Amoye with curiosity without asking for direct answers.',
      icon: '💡',
      unlocked: true,
      category: 'streak'
    },
    {
      id: 'ach-market-analogy',
      title: 'Market Master',
      description: 'Solved an algebraic concept using the roadside market scale analogy.',
      icon: '⚖️',
      unlocked: true,
      category: 'mastery'
    },
    {
      id: 'ach-gap-slayer',
      title: 'Gap Slayer',
      description: 'Cleared a diagnostic Knowledge Gap via an AI Side-Quest.',
      icon: '🎯',
      unlocked: false,
      category: 'mastery'
    },
    {
      id: 'ach-data-guardian',
      title: '3G Data Guardian',
      description: 'Studied with 3G Ultra-Data-Saver mode to preserve community bandwidth.',
      icon: '📶',
      unlocked: false,
      category: 'streak'
    },
    {
      id: 'ach-waec-ready',
      title: 'Perseverance Star',
      description: 'Achieved 90%+ in a practice quiz arena.',
      icon: '⭐',
      unlocked: true,
      category: 'mastery'
    }
  ]);

  // Load from Dexie on mount
  useEffect(() => {
    async function loadAppData() {
      try {
        await initDatabase();
        const loadedProfile = await getUserProfile();
        if (loadedProfile) {
          setProfile(loadedProfile);
        }
        const loadedSubjects = await getSubjects();
        setSubjects(loadedSubjects);

        if (loadedSubjects.length > 0) {
          setActiveSubjectId(loadedSubjects[0].subject_id);
        }

        const loadedQuizzes = await getQuizzes();
        setQuizzes(loadedQuizzes);

        const loadedFlashcards = await getFlashcards();
        setFlashcards(loadedFlashcards);

        const loadedGaps = await getKnowledgeGaps();
        setKnowledgeGaps(loadedGaps);
      } catch (err) {
        console.error('Failed to load Dexie local data:', err);
      }
    }

    loadAppData();
  }, []);

  // Save profile updates to Dexie
  const handleUpdateProfile = async (updated: UserProfile) => {
    setProfile(updated);
    await saveUserProfile(updated);
  };

  // Toggle Low Bandwidth 3G mode
  const handleToggleLowBandwidth = () => {
    sounds.playTap();
    const updated = {
      ...profile,
      lowBandwidthMode: !profile.lowBandwidthMode
    };
    handleUpdateProfile(updated);

    // Unlock Data Guardian achievement
    if (!profile.lowBandwidthMode) {
      setAchievements(prev => prev.map(a => a.id === 'ach-data-guardian' ? { ...a, unlocked: true } : a));
    }
  };

  // Active Subject Data
  const currentSubject = subjects.find(s => s.subject_id === activeSubjectId) || subjects[0];
  const subjectQuizzes = quizzes.filter(q => q.subjectId === activeSubjectId);
  const subjectFlashcards = flashcards.filter(f => f.subjectId === activeSubjectId);

  // Lesson Module step completed
  const handleCompleteStep = async (moduleId: string, stepIndex: number) => {
    const updatedSubjects = subjects.map(sub => {
      if (sub.subject_id !== activeSubjectId) return sub;
      const updatedModules = sub.modules.map(mod => {
        if (mod.id !== moduleId) return mod;
        const total = mod.steps?.length || mod.total_steps;
        const isFinished = stepIndex >= total;
        return {
          ...mod,
          current_step: Math.min(stepIndex, total),
          status: isFinished ? ('completed' as const) : ('in_progress' as const)
        };
      });

      // If finished, unlock next module
      const curIndex = updatedModules.findIndex(m => m.id === moduleId);
      if (curIndex !== -1 && curIndex < updatedModules.length - 1 && updatedModules[curIndex].status === 'completed') {
        if (updatedModules[curIndex + 1].status === 'locked') {
          updatedModules[curIndex + 1].status = 'unlocked';
        }
      }

      return {
        ...sub,
        modules: updatedModules
      };
    });

    setSubjects(updatedSubjects);

    // Award Sparks & XP
    const newSparks = profile.sparks + 15;
    const newXp = profile.totalXp + 25;
    handleUpdateProfile({
      ...profile,
      sparks: newSparks,
      totalXp: newXp
    });
  };

  // Diagnostic Side-Quest completed
  const handleCompleteSideQuest = async (sideQuestId: string, rewardSparks: number) => {
    // Mark sidequest completed in subject
    const updatedSubjects = subjects.map(sub => {
      if (sub.subject_id !== activeSubjectId) return sub;
      return {
        ...sub,
        sideQuests: sub.sideQuests.map(sq => sq.id === sideQuestId ? { ...sq, status: 'completed' as const } : sq)
      };
    });
    setSubjects(updatedSubjects);

    // Mark gap resolved in knowledgeGaps
    const sq = currentSubject?.sideQuests.find(s => s.id === sideQuestId);
    if (sq) {
      setKnowledgeGaps(prev => prev.map(g => g.topic === sq.gapTopic ? { ...g, status: 'resolved' } : g));
    }

    // Award bonus sparks
    handleUpdateProfile({
      ...profile,
      sparks: profile.sparks + rewardSparks,
      totalXp: profile.totalXp + 50
    });

    // Unlock Gap Slayer achievement
    setAchievements(prev => prev.map(a => a.id === 'ach-gap-slayer' ? { ...a, unlocked: true } : a));
  };

  // Quiz completed handler
  const handleQuizCompleted = (score: number, total: number, sparksEarned: number, xpEarned: number) => {
    const accuracy = Math.round((score / total) * 100);
    const updated = {
      ...profile,
      sparks: profile.sparks + sparksEarned,
      totalXp: profile.totalXp + xpEarned,
      lastHiScore: Math.max(profile.lastHiScore, accuracy)
    };
    handleUpdateProfile(updated);
  };

  // New Knowledge Gap detected by Quiz Diagnostic Engine
  const handleNewKnowledgeGap = async (gap: KnowledgeGap) => {
    await addKnowledgeGap(gap);
    setKnowledgeGaps(prev => [gap, ...prev]);

    // Inject dynamic Side-Quest into subject track (matching sketch note)
    const newSideQuest: SideQuest = {
      id: `sq-${Date.now()}`,
      subjectId: gap.subjectId,
      title: `Mastering ${gap.topic}`,
      gapTopic: gap.topic,
      reason: gap.diagnosticNote,
      sparksReward: 40,
      status: 'available',
      analogyStory: `Let's use an everyday community example: ${gap.everydayAnalogyFix}`,
      questions: [
        {
          question: `How should you tackle a challenge involving ${gap.topic}?`,
          options: [
            "Break it down into equal real-world portions first",
            "Rush to add numbers without checking common denominators",
            "Ignore the units completely"
          ],
          correctIndex: 0,
          explanation: gap.everydayAnalogyFix,
          everydayAnalogy: gap.everydayAnalogyFix
        }
      ]
    };

    setSubjects(prev => prev.map(sub => {
      if (sub.subject_id === gap.subjectId) {
        return {
          ...sub,
          sideQuests: [newSideQuest, ...sub.sideQuests]
        };
      }
      return sub;
    }));
  };

  // Flashcard status toggle
  const handleUpdateCardStatus = async (cardId: string, mastered: boolean) => {
    await updateFlashcardStatus(cardId, mastered);
    setFlashcards(prev => prev.map(f => f.id === cardId ? { ...f, mastered } : f));
    if (mastered) {
      handleUpdateProfile({
        ...profile,
        sparks: profile.sparks + 10,
        totalXp: profile.totalXp + 15
      });
    }
  };

  // Add custom or generated flashcard
  const handleAddCard = async (card: Flashcard) => {
    await addFlashcard(card);
    setFlashcards(prev => [card, ...prev]);
  };

  // Save tools from Study Tools Generator
  const handleSaveGeneratedTools = async (newQuiz: Quiz, newCards: Flashcard[]) => {
    await addQuiz(newQuiz);
    setQuizzes(prev => [newQuiz, ...prev]);

    for (const card of newCards) {
      await addFlashcard(card);
    }
    setFlashcards(prev => [...newCards, ...prev]);

    // Award bonus sparks for study tool generation
    handleUpdateProfile({
      ...profile,
      sparks: profile.sparks + 25,
      totalXp: profile.totalXp + 40
    });
  };

  // Purchase market item
  const handlePurchaseItem = (cost: number, itemName: string) => {
    if (profile.sparks < cost) return false;
    handleUpdateProfile({
      ...profile,
      sparks: profile.sparks - cost
    });
    return true;
  };

  // Send inline question to Amoye Socratic Engine
  const handleSendInlineAmoye = async (customPrompt?: string) => {
    const textToSend = customPrompt || inlineAmoyePrompt;
    if (!textToSend.trim()) return;

    sounds.playTap();
    recordAskAmoyeUsage(textToSend);
    setInlineAmoyeMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInlineAmoyePrompt('');
    setIsInlineThinking(true);

    try {
      const response = await fetch('/api/gemini/socratic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          userAge: profile.age,
          classLevel: profile.classLevel,
          mode: 'socratic',
          cognitiveStyle: profile.cognitiveStyle
        })
      });
      const data = await response.json();
      setInlineAmoyeMessages(prev => [
        ...prev, 
        { 
          sender: 'amoye', 
          text: data.text || 'Think about what changes when you cut something into more parts!',
          analogy: data.analogy || 'Roadside Market Balance'
        }
      ]);
      sounds.playSparkEarned();
    } catch {
      setInlineAmoyeMessages(prev => [
        ...prev,
        {
          sender: 'amoye',
          text: 'Think of pouring water from a full jerrycan: if you share it into 2 containers versus 4 containers, which one gives bigger shares?',
          analogy: 'Water Jerrycan Portions'
        }
      ]);
    } finally {
      setIsInlineThinking(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      profile.lowBandwidthMode 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 1. Loading Screen */}
      {isLoading && (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      )}

      {/* 2. Header (Vibrant Palette Branding) */}
      <Header
        profile={profile}
        onOpenParentPortal={() => setActiveOverlay('parentPortal')}
        onOpenStudyTools={() => setActiveOverlay('studyTools')}
        onOpenOnboarding={() => setActiveOverlay('onboarding')}
        onToggleLowBandwidth={handleToggleLowBandwidth}
        onOpenRewards={() => setActiveOverlay('rewards')}
      />

      {/* 3. Master-Detail Layout (Vibrant Palette Theme) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 pb-16 lg:pb-0">
        
        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold w-full max-w-sm">
            <button
              onClick={() => setMobileTab('workspace')}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                mobileTab === 'workspace' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Active Workspace
            </button>
            <button
              onClick={() => setMobileTab('path')}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                mobileTab === 'path' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Learning Path
            </button>
          </div>
        </div>

        {/* Aside: Learning Path (Desktop Sidebar or Mobile Tab) */}
        <aside className={`w-full lg:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 shrink-0 overflow-y-auto ${
          mobileTab === 'path' ? 'block' : 'hidden lg:flex'
        }`}>
          {currentSubject ? (
            <LearningPath
              subjects={subjects}
              currentSubject={currentSubject}
              onSelectSubject={(subId) => setActiveSubjectId(subId)}
              onSelectModule={(mod) => {
                setActiveModule(mod);
                setActiveOverlay('moduleStudy');
              }}
              onSelectSideQuest={(sq) => {
                setActiveSideQuest(sq);
                setActiveOverlay('sideQuest');
              }}
              lowBandwidthMode={profile.lowBandwidthMode}
            />
          ) : (
            <div className="text-center py-16 text-slate-500">
              Loading curriculum paths...
            </div>
          )}
        </aside>

        {/* Section: Active Workspace (Desktop Main or Mobile Tab) */}
        <section className={`flex-1 p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto min-w-0 ${
          mobileTab === 'workspace' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Active Workspace Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                  {dashboardView === 'gamification' 
                    ? 'Student Gamification & Honor Hub'
                    : `Active Workspace: ${activeModule ? activeModule.title : currentSubject?.modules.find(m => m.status === 'in_progress')?.title || 'Fractions & Decimals'}`}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {dashboardView === 'gamification'
                  ? 'XP Mastery Engine • Socratic Inquiry • Daily Streaks • Badges'
                  : `Calibrated for ${profile.classLevel} • Socratic Inquiry & Diagnostic Mastery`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Dashboard View Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  id="tab-view-workspace"
                  onClick={() => setDashboardView('workspace')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    dashboardView === 'workspace'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Workspace</span>
                </button>
                <button
                  id="tab-view-gamification"
                  onClick={() => setDashboardView('gamification')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    dashboardView === 'gamification'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Gamification Hub</span>
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {displayXp} XP
                  </span>
                </button>
              </div>

              {dashboardView === 'workspace' && (
                <>
                  <button
                    id="btn-workspace-study-notes"
                    onClick={() => {
                      const targetModule = activeModule || currentSubject?.modules.find(m => m.status === 'in_progress') || currentSubject?.modules[0];
                      if (targetModule) {
                        setActiveModule(targetModule);
                        setActiveOverlay('moduleStudy');
                      }
                    }}
                    className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
                  >
                    Study Notes
                  </button>
                  <button
                    id="btn-workspace-practice-quiz"
                    onClick={() => setActiveOverlay('quizzes')}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition-colors"
                  >
                    Practice Quiz
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Gamification Interactive Ribbon on Main Dashboard */}
          <div 
            id="main-dashboard-gamification-ribbon"
            className="p-3.5 bg-gradient-to-r from-emerald-50/90 via-slate-50 to-amber-50/80 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-emerald-200/80 dark:border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xs"
          >
            {/* Level & XP Progress */}
            <div className="flex items-center gap-3 min-w-[220px] flex-1">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-xl shadow-xs shrink-0">
                {currentLevelInfo.icon}
              </div>
              <div className="flex-1 min-w-[140px]">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
                  <span>Level {currentLevelInfo.level}: {currentLevelInfo.title}</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold">{displayXp} / {currentLevelInfo.nextLevelXp} XP</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${currentLevelInfo.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Streak Counter Pill */}
            <button 
              onClick={() => setActiveOverlay('rewards')}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-900/50 px-3 py-1.5 rounded-xl hover:bg-orange-50/50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer"
              title="Click to view Streak details & rewards"
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-white leading-none">
                  {displayStreak} Day Streak
                </div>
                <div className="text-[10px] text-orange-600 dark:text-orange-400 font-medium leading-tight">
                  1.2x XP Active
                </div>
              </div>
            </button>

            {/* Badges Unlocked Pill */}
            <button 
              onClick={() => setActiveOverlay('rewards')}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50 px-3 py-1.5 rounded-xl hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
              title="Click to view all Badges"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-white leading-none">
                  {badges.filter(b => b.unlocked).length} / {badges.length} Badges
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium leading-tight">
                  Honor Roll
                </div>
              </div>
            </button>

            {/* Hub Quick Toggle Button */}
            <button
              onClick={() => setDashboardView(dashboardView === 'gamification' ? 'workspace' : 'gamification')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 ml-auto"
            >
              <span>{dashboardView === 'gamification' ? 'Back to Lesson' : 'Open Full Hub →'}</span>
            </button>
          </div>

          {/* Conditional Main View: Gamification Hub OR Socratic Workspace */}
          {dashboardView === 'gamification' ? (
            <GamificationHub 
              onOpenQuiz={() => setActiveOverlay('quizzes')}
              onOpenAmoye={() => setActiveOverlay('askAmoye')}
              onOpenFlashcards={() => setActiveOverlay('flashcards')}
            />
          ) : (
            /* 2-Column Grid (Ask Amoye + Diagnostic / Study Pack) */
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-0 flex-1">
            
            {/* Column 1: Ask Amoye (Socratic Mode) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-[460px] xl:h-auto">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ask Amoye (Socratic Mode)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <button
                  onClick={() => setActiveOverlay('askAmoye')}
                  className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
                  title="Expand Full Screen Socratic Workspace"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Screen</span>
                </button>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto text-sm">
                {inlineAmoyeMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-3.5 max-w-[85%] text-sm ${
                        msg.sender === 'user'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl rounded-tr-none'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-slate-800 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl rounded-tl-none'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      {msg.analogy && (
                        <div className="mt-2 pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <span>💡 Everyday Analogy: {msg.analogy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isInlineThinking && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl self-start text-xs text-slate-500 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                    <span>Amoye is brewing a Socratic analogy...</span>
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900">
                <input
                  type="text"
                  value={inlineAmoyePrompt}
                  onChange={(e) => setInlineAmoyePrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInlineAmoye()}
                  placeholder="Ask Amoye a question..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100"
                />
                <button
                  onClick={() => handleSendInlineAmoye()}
                  disabled={!inlineAmoyePrompt.trim() || isInlineThinking}
                  className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20 disabled:opacity-40 transition-colors"
                >
                  <span className="text-xl font-bold leading-none">→</span>
                </button>
              </div>
            </div>

            {/* Column 2: Knowledge Gap Found + Daily Study Pack */}
            <div className="flex flex-col gap-6">
              
              {/* Knowledge Gap Found Card */}
              {!dismissedGap && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg">
                      !
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight">
                        Knowledge Gap Found
                      </h3>
                      <span className="text-xs text-orange-600 font-semibold">
                        Pillar 3 Diagnostic Engine
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    You missed 3 questions about <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wide">Equivalence</span> in the last quiz. Amoye recommends a quick review.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const targetQuest = currentSubject?.sideQuests.find(sq => sq.status === 'available') || {
                          id: 'sq-diagnostic',
                          subjectId: currentSubject?.subject_id || 'math-jss1',
                          title: 'Equivalence & Portions Sprint',
                          reason: 'Diagnosed struggle in equivalent fractions ratio conversion',
                          sparksReward: 40,
                          status: 'available' as const,
                          questionsCount: 3
                        };
                        setActiveSideQuest(targetQuest);
                        setActiveOverlay('sideQuest');
                      }}
                      className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold shadow-md shadow-orange-500/20 transition-colors"
                    >
                      Review Gap
                    </button>
                    <button
                      onClick={() => setDismissedGap(true)}
                      className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors"
                    >
                      Later
                    </button>
                  </div>
                </div>
              )}

              {/* Daily Study Pack Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">
                    Daily Study Pack
                  </h3>
                  <span className="text-xs font-semibold text-emerald-600">
                    Offline Ready
                  </span>
                </div>
                <div className="space-y-3">
                  {/* Pack item 1: Flashcards */}
                  <div
                    onClick={() => setActiveOverlay('flashcards')}
                    className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🗂️</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">12 New Flashcards</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded">
                      READY
                    </span>
                  </div>

                  {/* Pack item 2: Notes */}
                  <div
                    onClick={() => {
                      const targetModule = activeModule || currentSubject?.modules[1] || currentSubject?.modules[0];
                      if (targetModule) {
                        setActiveModule(targetModule);
                        setActiveOverlay('moduleStudy');
                      }
                    }}
                    className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📝</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Simplified Notes: Decimals</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-2 py-0.5 rounded">
                      OFFLINE
                    </span>
                  </div>

                  {/* Pack item 3: Challenge */}
                  <div
                    onClick={() => setActiveOverlay('quizzes')}
                    className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏆</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Challenge: Math Sprint</span>
                    </div>
                    <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded">
                      +50 XP
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
          )}
        </section>
      </main>

      {/* 4. Bottom Footer Bar (Exact match to Vibrant Palette Design HTML) */}
      <footer className="h-12 bg-slate-900 flex items-center justify-between px-6 sm:px-8 text-[11px] text-slate-400 shrink-0 uppercase tracking-widest border-t border-slate-800">
        <span>BUILD FEST 2026 • TRACK 4 CASE STUDY 1</span>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SYNCED OFFLINE
          </span>
          <span>V1.0.2-LOW-BANDWIDTH</span>
        </div>
      </footer>

      {/* 5. Bottom Navigation Dock for Mobile Devices */}
      <BottomDock
        activeView={activeOverlay}
        onOpenMarket={() => setActiveOverlay('market')}
        onOpenRewards={() => setActiveOverlay('rewards')}
        onOpenAskAmoye={() => setActiveOverlay('askAmoye')}
        onOpenFlashcards={() => setActiveOverlay('flashcards')}
        onOpenQuizzes={() => setActiveOverlay('quizzes')}
        lowBandwidthMode={profile.lowBandwidthMode}
      />

      {/* 5. ACTIVE WORKSPACE OVERLAYS */}

      {/* Overlay: Ask Amoye (Socratic AI Tutor) */}
      {activeOverlay === 'askAmoye' && (
        <AskAmoyeWorkspace
          profile={profile}
          onClose={() => setActiveOverlay(null)}
          onSaveFlashcards={(cards) => {
            cards.forEach(c => handleAddCard(c));
          }}
        />
      )}

      {/* Overlay: Module Study Step-by-Step Lesson */}
      {activeOverlay === 'moduleStudy' && activeModule && (
        <ModuleStudyModal
          module={activeModule}
          onClose={() => {
            setActiveModule(null);
            setActiveOverlay(null);
          }}
          onCompleteStep={handleCompleteStep}
          onOpenAmoyeWithPrompt={(prompt) => {
            setActiveModule(null);
            setAmoyeInitialPrompt(prompt);
            setActiveOverlay('askAmoye');
          }}
        />
      )}

      {/* Overlay: Knowledge Gap Diagnostic Side-Quest */}
      {activeOverlay === 'sideQuest' && activeSideQuest && (
        <SideQuestModal
          sideQuest={activeSideQuest}
          onClose={() => {
            setActiveSideQuest(null);
            setActiveOverlay(null);
          }}
          onCompleteQuest={handleCompleteSideQuest}
        />
      )}

      {/* Overlay: Practice Quizzes Arena */}
      {activeOverlay === 'quizzes' && currentSubject && (
        <QuizzesModal
          quizzes={subjectQuizzes}
          subjectName={currentSubject.subject_name}
          onClose={() => setActiveOverlay(null)}
          onQuizCompleted={handleQuizCompleted}
          onNewKnowledgeGapDetected={handleNewKnowledgeGap}
          lowBandwidthMode={profile.lowBandwidthMode}
        />
      )}

      {/* Overlay: Digital Flashcards Deck */}
      {activeOverlay === 'flashcards' && currentSubject && (
        <FlashcardsModal
          flashcards={subjectFlashcards}
          subjectName={currentSubject.subject_name}
          onClose={() => setActiveOverlay(null)}
          onUpdateCardStatus={handleUpdateCardStatus}
          onAddCard={handleAddCard}
          lowBandwidthMode={profile.lowBandwidthMode}
        />
      )}

      {/* Overlay: Automated Study Tools Generator (Pillar 2) */}
      {activeOverlay === 'studyTools' && (
        <StudyToolsGeneratorModal
          profile={profile}
          activeSubjectId={activeSubjectId}
          onClose={() => setActiveOverlay(null)}
          onSaveGeneratedTools={handleSaveGeneratedTools}
        />
      )}

      {/* Overlay: Market Bazaar (Spend Sparks) */}
      {activeOverlay === 'market' && (
        <MarketModal
          profile={profile}
          onClose={() => setActiveOverlay(null)}
          onPurchaseItem={handlePurchaseItem}
        />
      )}

      {/* Overlay: Rewards & Achievements */}
      {activeOverlay === 'rewards' && (
        <RewardsModal
          profile={profile}
          achievements={achievements}
          onClose={() => setActiveOverlay(null)}
        />
      )}

      {/* Overlay: Parent / Supervisor Portal */}
      {activeOverlay === 'parentPortal' && (
        <ParentPortalModal
          profile={profile}
          knowledgeGaps={knowledgeGaps}
          onClose={() => setActiveOverlay(null)}
        />
      )}

      {/* Overlay: Onboarding & Profile Calibration */}
      {(!profile.isOnboarded || activeOverlay === 'onboarding') && (
        <OnboardingModal
          initialProfile={profile}
          onComplete={(updated) => {
            handleUpdateProfile(updated);
            setActiveOverlay(null);
          }}
          onClose={profile.isOnboarded ? () => setActiveOverlay(null) : undefined}
        />
      )}

      {/* Global Gamification Toast & Modal Celebrations */}
      <GamificationCelebration />

    </div>
  );
}
