export type ClassLevel = 'Primary 6' | 'JSS 1' | 'JSS 2' | 'JSS 3' | 'SSS 1' | 'SSS 2' | 'SSS 3' | string;
export type CognitiveStyle = 'everyday-analogy' | 'visual-story' | 'step-by-step' | 'visual-analogy' | 'storyteller' | string;
export type ComprehensionSpeed = 'fast' | 'steady' | 'deep-diver' | string;

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  classLevel: ClassLevel;
  cognitiveStyle: CognitiveStyle;
  comprehensionSpeed?: ComprehensionSpeed;
  sparks: number;
  totalXp: number;
  streakDays: number;
  lastHiScore: number;
  weeklyStudyMinutes?: number;
  rank: string;
  avatar: string;
  selectedSubjects?: string[];
  lowBandwidthMode: boolean;
  highContrastMode?: boolean;
  parentPin: string;
  completedStepIds?: string[];
  unlockedModuleIds?: string[];
  dailyGoalProgress?: number; // 0 - 100
  registeredAt?: string;
  isOnboarded?: boolean;
  lastActiveDate?: string;
}

export interface LearningStep {
  id: string;
  title: string;
  summary: string;
  everydayAnalogy: string;
  conceptMarkdown: string;
  quickCheckQuestion: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
}

export interface LearningModule {
  id: string;
  subject_id: string;
  title: string;
  order: number;
  status: 'locked' | 'unlocked' | 'completed' | 'in_progress';
  total_steps: number;
  current_step: number;
  steps: LearningStep[];
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  everydayAnalogy: string;
  gapTopic?: string;
}

export interface SideQuest {
  id: string;
  subjectId?: string;
  subject_id?: string;
  title: string;
  reason: string;
  gapTopic: string;
  sparksReward: number;
  status: 'available' | 'completed';
  challengeType?: 'mini-quiz' | 'analogy-mastery' | 'flashcard-sprint';
  questions?: QuizQuestion[];
  analogyStory?: string;
}

export interface SubjectData {
  id: string;
  subject_id: string;
  subject_name: string;
  class: ClassLevel;
  category?: 'Sciences' | 'Mathematics' | 'Languages' | 'Vocational' | string;
  icon?: string;
  accentColor?: string;
  modules: LearningModule[];
  sideQuests: SideQuest[];
}

export interface Flashcard {
  id: string;
  subjectId: string;
  moduleId?: string;
  front: string;
  back: string;
  analogy: string;
  mastered: boolean;
  reviewCount: number;
}

export interface Quiz {
  id: string;
  subjectId: string;
  title: string;
  difficulty?: 'Easy' | 'Medium' | 'Challenge' | string;
  class?: string;
  questions: QuizQuestion[];
  xpReward: number;
  sparksReward: number;
}

export interface KnowledgeGap {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  missedCount: number;
  diagnosticNote: string;
  everydayAnalogyFix: string;
  sideQuestId?: string;
  status: 'active' | 'resolved' | 'cleared';
  detectedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'amoye' | 'system';
  text: string;
  timestamp: number;
  type?: 'socratic' | 'story' | 'quiz' | 'flashcard' | 'notes' | 'guardrail';
  suggestedQuestions?: string[];
  analogy?: string;
  imageUri?: string;
  isDirectAnswerAttempt?: boolean;
  socraticStep?: {
    stepNumber: number;
    totalSteps: number;
    guidingQuestion: string;
  };
}

export interface MarketItem {
  id: string;
  title?: string;
  name?: string;
  description: string;
  costSparks?: number;
  cost?: number;
  category: 'badge' | 'avatar' | 'offline-pack' | 'powerup' | 'pack' | 'utility';
  icon: string;
  purchased?: boolean;
  unlockedPayload?: string;
}

export type BadgeCategory = 'subject_mastery' | 'quiz_excellence' | 'socratic_inquiry' | 'streak' | 'data_saver' | 'curriculum' | string;
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface RewardAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardSparks?: number;
  rewardXp?: number;
  unlocked: boolean;
  unlockedAt?: string;
  category?: BadgeCategory;
  tier?: BadgeTier;
  progress?: number;
  target?: number;
  criteria?: string;
}

export type Achievement = RewardAchievement;
export type Badge = RewardAchievement;

export interface TelemetryLog {
  id: string;
  date: string;
  minutesSpent: number;
  quizzesSolved: number;
  cardsMastered: number;
  accuracyRate: number;
}
