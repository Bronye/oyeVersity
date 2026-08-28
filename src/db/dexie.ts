import Dexie, { Table } from 'dexie';
import { 
  UserProfile, 
  SubjectData, 
  Flashcard, 
  Quiz, 
  KnowledgeGap, 
  MarketItem, 
  RewardAchievement, 
  ChatMessage 
} from '../types';
import { 
  INITIAL_SUBJECTS, 
  INITIAL_FLASHCARDS, 
  INITIAL_QUIZZES, 
  INITIAL_MARKET_ITEMS, 
  INITIAL_ACHIEVEMENTS 
} from '../data/curriculum';

export class OyeVersityDatabase extends Dexie {
  userProfiles!: Table<UserProfile, string>;
  subjects!: Table<SubjectData, string>;
  flashcards!: Table<Flashcard, string>;
  quizzes!: Table<Quiz, string>;
  knowledgeGaps!: Table<KnowledgeGap, string>;
  marketItems!: Table<MarketItem, string>;
  achievements!: Table<RewardAchievement, string>;
  chatMessages!: Table<ChatMessage, string>;

  constructor() {
    super('OyeVersityDB');
    this.version(1).stores({
      userProfiles: 'id, name, classLevel',
      subjects: 'id, subject_id, class',
      flashcards: 'id, subjectId, mastered',
      quizzes: 'id, subjectId, difficulty',
      knowledgeGaps: 'id, subjectId, status',
      marketItems: 'id, category, purchased',
      achievements: 'id, unlocked',
      chatMessages: 'id, timestamp, sender'
    });
  }
}

export const db = new OyeVersityDatabase();

// Default initial user profile
export const DEFAULT_PROFILE: UserProfile = {
  id: 'student-primary',
  name: 'Amara Okafor',
  age: 12,
  classLevel: 'JSS 1',
  cognitiveStyle: 'everyday-analogy',
  comprehensionSpeed: 'steady',
  sparks: 380,
  totalXp: 450,
  streakDays: 5,
  lastHiScore: 92,
  weeklyStudyMinutes: 185,
  rank: 'Silver Explorer',
  avatar: 'cap-student',
  selectedSubjects: ['math-jss1', 'science-jss1', 'english-jss1', 'agric-jss1'],
  lowBandwidthMode: false,
  highContrastMode: false,
  parentPin: '1234',
  completedStepIds: ['step-m1-1', 'step-m1-2'],
  unlockedModuleIds: ['mod-math-01', 'mod-math-02', 'mod-sci-01', 'mod-eng-01'],
  dailyGoalProgress: 65,
  registeredAt: '2026-08-20',
  isOnboarded: true,
  lastActiveDate: new Date().toISOString().split('T')[0]
};

export const INITIAL_KNOWLEDGE_GAPS: KnowledgeGap[] = [
  {
    id: 'gap-01',
    subjectId: 'math-jss1',
    subjectName: 'Mathematics',
    topic: 'Fractions: Unlike Denominators & LCM',
    missedCount: 2,
    diagnosticNote: 'Tends to add denominators directly (e.g. 1/2 + 1/4 = 2/6 instead of converting to common denominator 3/4).',
    everydayAnalogyFix: 'Remember: You cannot mix small milk tins and big milo tins into one count until you measure both using the same standard tea cup!',
    sideQuestId: 'sq-math-01',
    status: 'active',
    detectedAt: '2026-08-26'
  }
];

/**
 * Preload and seed the offline database if cold booted or empty
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  try {
    const profileCount = await db.userProfiles.count();
    if (profileCount === 0) {
      await db.userProfiles.add(DEFAULT_PROFILE);
      await db.subjects.bulkAdd(INITIAL_SUBJECTS);
      await db.flashcards.bulkAdd(INITIAL_FLASHCARDS);
      await db.quizzes.bulkAdd(INITIAL_QUIZZES);
      await db.marketItems.bulkAdd(INITIAL_MARKET_ITEMS);
      await db.achievements.bulkAdd(INITIAL_ACHIEVEMENTS);
      await db.knowledgeGaps.bulkAdd(INITIAL_KNOWLEDGE_GAPS);
      
      // Add a welcoming message from Amoye
      await db.chatMessages.add({
        id: 'msg-welcome-01',
        sender: 'amoye',
        text: "Ẹ n lẹ o! Hello! I am **Amoye**, your Socratic study companion. 💡\n\nI am not here to do your homework or give you quick cheat answers. Instead, I will ask you smart questions and guide you with everyday analogies like water jerrycans, market scales, and bicycle wheels so YOU understand it for life.\n\nWhat concept or question are you curious about today?",
        timestamp: Date.now(),
        type: 'socratic',
        suggestedQuestions: [
          "Why can't I just add 1/2 + 1/3 as 2/5?",
          "How does a bicycle gear make it easier to climb a hill?",
          "Simplify 2x + 7 = 15 using a market scale analogy",
          "What is the difference between mass and weight?"
        ]
      });
    }
  } catch (err) {
    console.warn('Dexie DB seeding warning (will use memory/local fallback):', err);
  }
}

export async function initDatabase(): Promise<void> {
  await seedDatabaseIfEmpty();
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const profiles = await db.userProfiles.toArray();
    return profiles[0] || DEFAULT_PROFILE;
  } catch (err) {
    return DEFAULT_PROFILE;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await db.userProfiles.put(profile);
  } catch (err) {
    console.warn('Failed to save profile to Dexie:', err);
  }
}

export async function getSubjects(): Promise<SubjectData[]> {
  try {
    const list = await db.subjects.toArray();
    if (list.length > 0) return list;
    return INITIAL_SUBJECTS;
  } catch (err) {
    return INITIAL_SUBJECTS;
  }
}

export async function getQuizzes(): Promise<Quiz[]> {
  try {
    const list = await db.quizzes.toArray();
    if (list.length > 0) return list;
    return INITIAL_QUIZZES;
  } catch (err) {
    return INITIAL_QUIZZES;
  }
}

export async function addQuiz(quiz: Quiz): Promise<void> {
  try {
    await db.quizzes.put(quiz);
  } catch (err) {
    console.warn('Failed to add quiz:', err);
  }
}

export async function getFlashcards(): Promise<Flashcard[]> {
  try {
    const list = await db.flashcards.toArray();
    if (list.length > 0) return list;
    return INITIAL_FLASHCARDS;
  } catch (err) {
    return INITIAL_FLASHCARDS;
  }
}

export async function updateFlashcardStatus(cardId: string, mastered: boolean): Promise<void> {
  try {
    await db.flashcards.update(cardId, { mastered });
  } catch (err) {
    console.warn('Failed to update flashcard:', err);
  }
}

export async function addFlashcard(card: Flashcard): Promise<void> {
  try {
    await db.flashcards.put(card);
  } catch (err) {
    console.warn('Failed to add flashcard:', err);
  }
}

export async function getKnowledgeGaps(): Promise<KnowledgeGap[]> {
  try {
    const list = await db.knowledgeGaps.toArray();
    if (list.length > 0) return list;
    return INITIAL_KNOWLEDGE_GAPS;
  } catch (err) {
    return INITIAL_KNOWLEDGE_GAPS;
  }
}

export async function addKnowledgeGap(gap: KnowledgeGap): Promise<void> {
  try {
    await db.knowledgeGaps.put(gap);
  } catch (err) {
    console.warn('Failed to add knowledge gap:', err);
  }
}
