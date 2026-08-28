import { SubjectData, Flashcard, Quiz, MarketItem, RewardAchievement } from '../types';

export const INITIAL_SUBJECTS: SubjectData[] = [
  {
    id: 'jss-math',
    subject_id: 'jss1-mathematics',
    subject_name: 'Mathematics',
    class: 'JSS 1',
    category: 'Mathematics',
    icon: 'Calculator',
    accentColor: '#10B981',
    modules: [
      {
        id: 'mod-math-01',
        subject_id: 'jss1-mathematics',
        title: 'Number Base Systems',
        order: 1,
        status: 'completed',
        total_steps: 4,
        current_step: 4,
        steps: [
          {
            id: 'step-m1-1',
            title: 'Base 10: Our Everyday Currency',
            summary: 'Understand place values using stacks of 10-naira and 100-naira notes.',
            everydayAnalogy: 'Think of bundling 10 rubber bands together into a big pack. In Base 10, once you reach 10 ones, it turns into 1 ten!',
            conceptMarkdown: '### Base 10 Place Values\nBase 10 uses ten digits: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9.\n- Units ($10^0$)\n- Tens ($10^1$)\n- Hundreds ($10^2$)\n\nEvery time you reach ten, you bundle and carry over to the next left column.',
            quickCheckQuestion: {
              question: 'In Base 10, what is the value of 4 in the number 425?',
              options: ['4 units (4)', '4 tens (40)', '4 hundreds (400)', '4 thousands (4000)'],
              correctAnswer: 2,
              explanation: 'The 4 is in the hundreds position: 4 × 100 = 400.'
            }
          },
          {
            id: 'step-m1-2',
            title: 'Binary (Base 2): The Torchlight Switch',
            summary: 'Counting in Base 2 where you only have two states: OFF (0) or ON (1).',
            everydayAnalogy: 'A single torchlight bulb can only be either turned OFF (0) or turned ON (1). It cannot be half-on.',
            conceptMarkdown: '### The Binary System\nBinary uses only two digits: **0 and 1**.\nInstead of powers of 10, binary values double every column to the left:\n- Ones (1)\n- Twos (2)\n- Fours (4)\n- Eights (8)\n\nSo $101_2$ = $(1 \\times 4) + (0 \\times 2) + (1 \\times 1) = 5_{10}$.',
            quickCheckQuestion: {
              question: 'What is the Base 10 value of binary 110₂?',
              options: ['3', '5', '6', '12'],
              correctAnswer: 2,
              explanation: '(1 × 4) + (1 × 2) + (0 × 1) = 4 + 2 + 0 = 6.'
            }
          }
        ]
      },
      {
        id: 'mod-math-02',
        subject_id: 'jss1-mathematics',
        title: 'Fractions and Market Measuring',
        order: 2,
        status: 'in_progress',
        total_steps: 4,
        current_step: 2,
        steps: [
          {
            id: 'step-m2-1',
            title: 'Dividing into Equal Portions',
            summary: 'Understanding numerators and denominators using a loaf of bread or a mudu of garri.',
            everydayAnalogy: 'If you share 1 loaf of Agege bread equally among 4 children, each child gets 1/4. The bottom number (4) tells total equal slices, top number (1) is your slice.',
            conceptMarkdown: '### Fraction Basics\n- **Numerator (Top):** How many parts you have.\n- **Denominator (Bottom):** Total equal parts that make up 1 whole item.',
            quickCheckQuestion: {
              question: 'If a tuber of yam is sliced into 5 equal pieces and you roast 2 pieces, what fraction did you roast?',
              options: ['2/5', '5/2', '3/5', '1/5'],
              correctAnswer: 0,
              explanation: 'You took 2 pieces out of 5 total equal slices, which equals 2/5.'
            }
          },
          {
            id: 'step-m2-2',
            title: 'Adding Fractions with Different Denominators',
            summary: 'Finding the Least Common Multiple (LCM) to make slices the same size before adding.',
            everydayAnalogy: 'You cannot add 1 half of a watermelon directly to 1 fourth of an orange until you cut both into equal small cups!',
            conceptMarkdown: '### Adding Unlike Fractions\nTo add 1/2 + 1/4:\n1. Find LCM of denominators (2 and 4), which is 4.\n2. Convert 1/2 into 2/4.\n3. Add numerators: 2/4 + 1/4 = 3/4.',
            quickCheckQuestion: {
              question: 'What is 1/3 + 1/6?',
              options: ['2/9', '3/6 (or 1/2)', '1/9', '2/6'],
              correctAnswer: 1,
              explanation: 'LCM of 3 and 6 is 6. 1/3 = 2/6. Then 2/6 + 1/6 = 3/6, which simplifies to 1/2.'
            }
          }
        ]
      },
      {
        id: 'mod-math-03',
        subject_id: 'jss1-mathematics',
        title: 'Linear Equations & Balance Scales',
        order: 3,
        status: 'unlocked',
        total_steps: 3,
        current_step: 0,
        steps: [
          {
            id: 'step-m3-1',
            title: 'Balancing Both Sides',
            summary: 'Solving for the unknown variable x like keeping a market hanging scale level.',
            everydayAnalogy: 'If an old-school two-pan scale has a mystery bag plus a 2kg iron weight on the left, and 7kg of stones on the right, removing 2kg from both sides keeps it level and reveals the bag is 5kg!',
            conceptMarkdown: '### The Balance Rule\nWhatever mathematical operation you do to the left side of the equals sign (=), you MUST do the exact same to the right side.\n\n$x + 3 = 10$\nSubtract 3 from both sides:\n$x + 3 - 3 = 10 - 3$\n$x = 7$',
            quickCheckQuestion: {
              question: 'If 2x = 14, what is x?',
              options: ['12', '7', '28', '16'],
              correctAnswer: 1,
              explanation: 'Divide both sides by 2: 14 ÷ 2 = 7.'
            }
          }
        ]
      },
      {
        id: 'mod-math-04',
        subject_id: 'jss1-mathematics',
        title: 'Perimeter & Farm Boundaries',
        order: 4,
        status: 'locked',
        total_steps: 3,
        current_step: 0,
        steps: []
      },
      {
        id: 'mod-math-05',
        subject_id: 'jss1-mathematics',
        title: 'Percentages & Market Discounts',
        order: 5,
        status: 'locked',
        total_steps: 4,
        current_step: 0,
        steps: []
      }
    ],
    sideQuests: [
      {
        id: 'sq-math-01',
        subject_id: 'jss1-mathematics',
        title: 'Side Quest: Mastering Unlike Denominators',
        reason: 'Detected from Quiz Diagnostic: Difficulty finding common denominator during addition',
        gapTopic: 'Fractions: Least Common Denominator',
        sparksReward: 40,
        status: 'available',
        challengeType: 'mini-quiz',
        analogyStory: 'Mama Chinyere is packing rice cups for the boarding school. One student brings a 1/2 cup measure and another brings a 1/4 cup measure. To make them match, Mama Chinyere pours 2 small cups into the big one!',
        questions: [
          {
            id: 'sq-q1',
            question: 'To add 2/5 + 1/10, what is the best common denominator to use?',
            options: ['50', '10', '15', '5'],
            correctIndex: 1,
            explanation: '10 is the lowest common multiple of 5 and 10, because 5 divides evenly into 10.',
            everydayAnalogy: '10 is the smallest clean container that holds both measures without spilling.',
            gapTopic: 'Fractions: Least Common Denominator'
          },
          {
            id: 'sq-q2',
            question: 'Convert 2/5 into an equivalent fraction with denominator 10:',
            options: ['2/10', '4/10', '5/10', '8/10'],
            correctIndex: 1,
            explanation: 'Multiply both top and bottom by 2: (2 × 2) / (5 × 2) = 4/10.',
            everydayAnalogy: 'If you double the number of slices in the yam, you also get double the number of pieces to keep the same amount.',
            gapTopic: 'Fractions: Equivalent Fractions'
          }
        ]
      }
    ]
  },
  {
    id: 'jss-science',
    subject_id: 'jss1-basic-science',
    subject_name: 'Basic Science',
    class: 'JSS 1',
    category: 'Sciences',
    icon: 'FlaskConical',
    accentColor: '#0EA5E9',
    modules: [
      {
        id: 'mod-sci-01',
        subject_id: 'jss1-basic-science',
        title: 'Living and Non-Living Things',
        order: 1,
        status: 'completed',
        total_steps: 3,
        current_step: 3,
        steps: [
          {
            id: 'step-s1-1',
            title: 'MR NIGER D (Characteristics of Life)',
            summary: 'Movement, Respiration, Nutrition, Irritability, Growth, Excretion, Reproduction, Death.',
            everydayAnalogy: 'A goat moves, feeds on grass, grows, and bleats when you touch it. A brick stone stays the same size forever!',
            conceptMarkdown: '### Characteristics of Living Organisms\nLiving organisms carry out all seven vital biological processes.',
            quickCheckQuestion: {
              question: 'Which of the following is a non-living thing?',
              options: ['Pawpaw tree', 'Jerrycan container', 'Earthworm', 'Yeast'],
              correctAnswer: 1,
              explanation: 'A plastic jerrycan does not grow, breathe, or reproduce.'
            }
          }
        ]
      },
      {
        id: 'mod-sci-02',
        subject_id: 'jss1-basic-science',
        title: 'Work, Energy and Borehole Pumps',
        order: 2,
        status: 'unlocked',
        total_steps: 4,
        current_step: 1,
        steps: [
          {
            id: 'step-s2-1',
            title: 'What is Work Done?',
            summary: 'Work = Force × Distance moved in the direction of the force.',
            everydayAnalogy: 'Pushing against a concrete wall for 2 hours makes you tired, but in physics Work = 0 because the wall did not move an inch!',
            conceptMarkdown: '### Scientific Definition of Work\nWork is only done when a force causes an object to displace.\n$$\\text{Work} = \\text{Force} \\times \\text{Distance}$$',
            quickCheckQuestion: {
              question: 'If you push a 10N crate across the classroom floor for 3 meters, how much work was done?',
              options: ['13 Joules', '30 Joules', '3.3 Joules', '0 Joules'],
              correctAnswer: 1,
              explanation: 'Work = 10 N × 3 m = 30 Joules.'
            }
          }
        ]
      },
      {
        id: 'mod-sci-03',
        subject_id: 'jss1-basic-science',
        title: 'Simple Machines & Levers',
        order: 3,
        status: 'locked',
        total_steps: 3,
        current_step: 0,
        steps: []
      }
    ],
    sideQuests: []
  },
  {
    id: 'jss-english',
    subject_id: 'jss1-english',
    subject_name: 'English Studies',
    class: 'JSS 1',
    category: 'Languages',
    icon: 'BookOpen',
    accentColor: '#8B5CF6',
    modules: [
      {
        id: 'mod-eng-01',
        subject_id: 'jss1-english',
        title: 'Nouns and Pronoun Concord',
        order: 1,
        status: 'unlocked',
        total_steps: 3,
        current_step: 1,
        steps: [
          {
            id: 'step-e1-1',
            title: 'Subject-Verb Agreement',
            summary: 'Singular subjects take singular verbs; plural subjects take plural verbs.',
            everydayAnalogy: 'One student (he/she) carries one school bag; many students (they) carry many bags together.',
            conceptMarkdown: '### The S-Rule\n- Singular noun + verb with -s: "The trader **sells** ripe bananas."\n- Plural noun + base verb: "The traders **sell** ripe bananas."',
            quickCheckQuestion: {
              question: 'Choose the correct sentence:',
              options: [
                'The dog bark at night.',
                'The dog barks at night.',
                'The dogs barks at night.',
                'The dog barking at night.'
              ],
              correctAnswer: 1,
              explanation: 'Singular subject "The dog" takes singular verb "barks".'
            }
          }
        ]
      }
    ],
    sideQuests: []
  },
  {
    id: 'jss-agric',
    subject_id: 'jss1-agric',
    subject_name: 'Agricultural Science',
    class: 'JSS 1',
    category: 'Vocational',
    icon: 'Sprout',
    accentColor: '#16A34A',
    modules: [
      {
        id: 'mod-agr-01',
        subject_id: 'jss1-agric',
        title: 'Classification of Farm Crops',
        order: 1,
        status: 'unlocked',
        total_steps: 3,
        current_step: 0,
        steps: []
      }
    ],
    sideQuests: []
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-01',
    subjectId: 'jss1-mathematics',
    front: 'What is a Prime Number?',
    back: 'A whole number greater than 1 that has only two factors: 1 and itself (e.g., 2, 3, 5, 7, 11).',
    analogy: 'Like an indivisible dried kola nut that cannot be split evenly into equal piles without breaking.',
    mastered: true,
    reviewCount: 3
  },
  {
    id: 'fc-02',
    subjectId: 'jss1-mathematics',
    front: 'How do you find the perimeter of a rectangle?',
    back: 'Perimeter = 2 × (Length + Width) or add all 4 outer border sides together.',
    analogy: 'The total length of fence wire needed to walk all the way around your school compound wall once.',
    mastered: false,
    reviewCount: 1
  },
  {
    id: 'fc-03',
    subjectId: 'jss1-mathematics',
    front: 'What is the reciprocal of a fraction?',
    back: 'Flip the fraction upside down: numerator becomes denominator and denominator becomes numerator (reciprocal of 3/4 is 4/3).',
    analogy: 'Turning a bucket upside down so the bottom faces up.',
    mastered: false,
    reviewCount: 0
  },
  {
    id: 'fc-04',
    subjectId: 'jss1-basic-science',
    front: 'What is Kinetic Energy?',
    back: 'The energy an object possesses due to its motion (KE = 1/2 mv²).',
    analogy: 'A speeding bicycle or a falling mango heading towards the ground.',
    mastered: true,
    reviewCount: 4
  },
  {
    id: 'fc-05',
    subjectId: 'jss1-basic-science',
    front: 'What is Osmosis?',
    back: 'Movement of water molecules from a region of higher water concentration to lower water concentration across a semi-permeable membrane.',
    analogy: 'Dried bitterleaf or dried fish swelling up when soaked in a basin of fresh tap water overnight.',
    mastered: false,
    reviewCount: 2
  },
  {
    id: 'fc-06',
    subjectId: 'jss1-english',
    front: 'What is an Adjective?',
    back: 'A describing word that modifies or gives more information about a noun or pronoun.',
    analogy: 'Saying "the **sweet, yellow** mango" instead of just "the mango".',
    mastered: true,
    reviewCount: 2
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-math-01',
    subjectId: 'jss1-mathematics',
    title: 'Fractions, Decimals & Market Math',
    difficulty: 'Medium',
    xpReward: 60,
    sparksReward: 25,
    questions: [
      {
        id: 'qm-1',
        question: 'Solve for x: 3x + 4 = 19',
        options: ['x = 3', 'x = 5', 'x = 7', 'x = 15'],
        correctIndex: 1,
        explanation: 'Subtract 4 from both sides: 3x = 15. Then divide by 3: x = 5.',
        everydayAnalogy: 'Take 4 naira off both pans of the market scale, then divide the 15 naira into 3 equal heaps.',
        gapTopic: 'Algebra: Two-Step Linear Equations'
      },
      {
        id: 'qm-2',
        question: 'Simplify: 3/4 - 1/2',
        options: ['2/2', '1/4', '2/4', '1/2'],
        correctIndex: 1,
        explanation: 'Convert 1/2 to 2/4. Then 3/4 - 2/4 = 1/4.',
        everydayAnalogy: 'If you have 3 quarters of a yam and give away 2 quarters (which is half), you are left with 1 quarter.',
        gapTopic: 'Fractions: Subtraction with Unlike Denominators'
      },
      {
        id: 'qm-3',
        question: 'Express 0.25 as a simplified fraction:',
        options: ['25/10', '1/4', '1/5', '2/5'],
        correctIndex: 1,
        explanation: '0.25 is 25/100. Dividing top and bottom by 25 gives 1/4.',
        everydayAnalogy: '25 kobo out of 100 kobo (1 Naira) is one-quarter of a Naira.',
        gapTopic: 'Fractions: Decimals to Fractions'
      },
      {
        id: 'qm-4',
        question: 'What is the Least Common Multiple (LCM) of 6 and 8?',
        options: ['14', '24', '48', '16'],
        correctIndex: 1,
        explanation: 'Multiples of 6: 6, 12, 18, 24... Multiples of 8: 8, 16, 24... The smallest match is 24.',
        everydayAnalogy: 'The first bus stop where two different commercial Danfo buses arrive at the exact same minute.',
        gapTopic: 'Number Theory: LCM & GCD'
      }
    ]
  },
  {
    id: 'quiz-sci-01',
    subjectId: 'jss1-basic-science',
    title: 'Energy, Work & Forces in Nature',
    difficulty: 'Easy',
    xpReward: 50,
    sparksReward: 20,
    questions: [
      {
        id: 'qs-1',
        question: 'Which of the following is the standard metric unit of Work and Energy?',
        options: ['Newton (N)', 'Joule (J)', 'Watt (W)', 'Kilogram (kg)'],
        correctIndex: 1,
        explanation: 'Work and energy are measured in Joules (J). Force is measured in Newtons.',
        everydayAnalogy: 'Joules count the food calories spent pushing a heavy wheelbarrow up the street.',
        gapTopic: 'Physics: Units of Measurement'
      },
      {
        id: 'qs-2',
        question: 'What energy transformation takes place in a solar panel powering a study lantern?',
        options: [
          'Chemical energy to Sound energy',
          'Solar (Light) energy to Electrical energy',
          'Mechanical energy to Heat energy',
          'Sound energy to Light energy'
        ],
        correctIndex: 1,
        explanation: 'Photovoltaic solar cells capture photons from sunlight and convert them directly into electrical flow.',
        everydayAnalogy: 'Catching bright sunlight on a shiny roof and storing it inside a small rechargeable battery.',
        gapTopic: 'Energy: Energy Transformations'
      },
      {
        id: 'qs-3',
        question: 'Why does an iron nail sink in a bucket of water while a large calabash floats?',
        options: [
          'The nail is darker in color',
          'The iron nail has higher density than water',
          'The calabash absorbs all the water',
          'Water repels iron'
        ],
        correctIndex: 1,
        explanation: 'Objects denser than water sink; objects less dense than water float.',
        everydayAnalogy: 'A heavy metal bolt sinks to the riverbed, but a hollow dry wooden canoe glides on top.',
        gapTopic: 'Physics: Density and Buoyancy'
      }
    ]
  }
];

export const INITIAL_MARKET_ITEMS: MarketItem[] = [
  {
    id: 'item-01',
    title: 'Offline WAEC/BECE Revision Pack',
    description: '300 offline questions with step-by-step everyday analogies saved directly to your phone memory.',
    costSparks: 60,
    category: 'offline-pack',
    icon: 'PackageCheck',
    purchased: false,
    unlockedPayload: 'OFFLINE_PACK_UNLOCKED'
  },
  {
    id: 'item-02',
    title: 'Ankara Scholar Cap Avatar',
    description: 'Equip your dashboard avatar with a handcrafted festive scholar cap.',
    costSparks: 40,
    category: 'avatar',
    icon: 'GraduationCap',
    purchased: true
  },
  {
    id: 'item-03',
    title: 'Kerosene Lantern Night Glow',
    description: 'A cozy warm amber theme badge representing late-night focused study.',
    costSparks: 30,
    category: 'badge',
    icon: 'Flame',
    purchased: false
  },
  {
    id: 'item-04',
    title: 'Streak Freeze Shield',
    description: 'Protects your streak for 24 hours if you cannot access power or internet.',
    costSparks: 50,
    category: 'powerup',
    icon: 'Shield',
    purchased: false
  },
  {
    id: 'item-05',
    title: '3G Data Saver Champion Badge',
    description: 'Awarded for completing 5 modules in low-data mode saving over 20MB.',
    costSparks: 25,
    category: 'badge',
    icon: 'SignalHigh',
    purchased: false
  }
];

export const INITIAL_ACHIEVEMENTS: RewardAchievement[] = [
  {
    id: 'ach-1',
    title: 'The Spark Ignited',
    description: 'Earn your first 50 Sparks through active learning.',
    icon: 'Sparkles',
    rewardSparks: 15,
    unlocked: true,
    unlockedAt: '2026-08-25'
  },
  {
    id: 'ach-2',
    title: '3-Day Unbroken Fire',
    description: 'Maintain your study streak for 3 consecutive days.',
    icon: 'Flame',
    rewardSparks: 25,
    unlocked: true,
    unlockedAt: '2026-08-27'
  },
  {
    id: 'ach-3',
    title: 'Everyday Analogy Master',
    description: 'Solve a quiz question using an everyday market or household analogy.',
    icon: 'Lightbulb',
    rewardSparks: 20,
    unlocked: false
  },
  {
    id: 'ach-4',
    title: 'Socratic Thinker',
    description: 'Work through 3 guided Socratic prompts with Amoye without asking for direct answers.',
    icon: 'Compass',
    rewardSparks: 30,
    unlocked: false
  },
  {
    id: 'ach-5',
    title: 'Zero-Gap Scholar',
    description: 'Complete a Diagnostic Side Quest and clear a knowledge gap.',
    icon: 'Target',
    rewardSparks: 40,
    unlocked: false
  }
];
