/**
 * data-store.ts — Hybrid Supabase & In-Memory Data Store
 *
 * Seamlessly connects to Supabase PostgreSQL & Storage when configured,
 * with resilient in-memory fallback.
 */

import {
  CourseWeek,
  StudentWithSubscription,
  Subscription,
  SubscriptionStatus,
  UserProfile,
  UserRole,
  StudentReview,
  CompletionStatus,
  ReviewStatus,
  DashboardStats,
  AssessmentLevel,
  AssessmentQuestion,
  AssessmentSettings,
  AssessmentSubmission,
  AssessmentStats,
  AssessmentEvaluationResult,
  CoursePricing,
} from "@/types";
import { generateCourseModulePdfBuffer } from "./pdf-generator";
import { getSupabaseAdminClient, getSupabaseAnonClient, isSupabaseConfigured } from "./supabase";
import { buildAssessmentWhatsAppUrl } from "./config";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface StoredUser extends UserProfile {
  passwordHash: string;
}

interface StoreData {
  users: StoredUser[];
  subscriptions: Subscription[];
  weeks: CourseWeek[];
  reviews: StudentReview[];
  photoBuffers: Record<string, { buffer: string; contentType: string }>; // base64 encoded
  pdfBuffers: Record<string, string>; // base64 encoded, keyed by weekNumber
  assessmentQuestions: AssessmentQuestion[];
  assessmentSettings: AssessmentSettings;
  assessmentSubmissions: AssessmentSubmission[];
  pricing: CoursePricing;
}

// =========================================================================
// SEED DATA: 8-Week English Learning Course
// =========================================================================

const SEED_WEEKS: CourseWeek[] = [
  {
    id: "week-1",
    weekNumber: 1,
    title: "English Foundations",
    description:
      "Learn sentence formation, basic vocabulary, and how to introduce yourself confidently.",
    learningObjectives: [
      "Subject-Verb-Object (SVO) Core Architecture",
      "Articles (A, An, The) & Demonstrative Pronouns",
      "Auxiliary Verbs (Be, Do, Have) in Present Simple",
      "Essential Everyday Greetings & Confident Self-Introductions",
    ],
    pdfFilename: "Week-01-English-Foundations.pdf",
    pdfStoragePath: "week-1/Week-01-English-Foundations.pdf",
    pdfFilesizeBytes: 24800,
    isPublished: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "week-2",
    weekNumber: 2,
    title: "Grammar and Tenses",
    description:
      "Understand essential grammar rules and learn to use present, past, and future tenses.",
    learningObjectives: [
      "Present Simple vs. Present Continuous in Real Contexts",
      "Past Simple vs. Present Perfect: Eliminating Common Errors",
      "Future Projections (Will vs. Going to vs. Present Continuous)",
      "Time Markers, Prepositions of Time (In, On, At) & Practice Drills",
    ],
    pdfFilename: "Week-02-Grammar-and-Tenses.pdf",
    pdfStoragePath: "week-2/Week-02-Grammar-and-Tenses.pdf",
    pdfFilesizeBytes: 26100,
    isPublished: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "week-3",
    weekNumber: 3,
    title: "Vocabulary and Daily English",
    description:
      "Improve your vocabulary and learn useful expressions for everyday situations.",
    learningObjectives: [
      "High-Frequency Phrasal Verbs for Everyday Life",
      "Collocations & Natural Word Pairings",
      "Expressing Opinions, Agreement, and Polite Disagreement",
      "Idiomatic Expressions for Modern Social Conversation",
    ],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    isPublished: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "week-4",
    weekNumber: 4,
    title: "Spoken English Practice",
    description:
      "Practise conversations, asking questions, answering confidently, and expressing your thoughts.",
    learningObjectives: [
      "Overcoming Hesitation & Fear of Making Mistakes",
      "Conversational Connectors & Fillers Used Naturally",
      "Asking Engaging Open-Ended Questions in Dialogue",
      "Mini-Storytelling: Structuring Short Personal Anecdotes",
    ],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    isPublished: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "week-5",
    weekNumber: 5,
    title: "Pronunciation and Listening",
    description:
      "Improve pronunciation, listening skills, clarity, and fluency.",
    learningObjectives: [
      "Vowel & Consonant Minimal Pairs Training",
      "Word Stress, Syllable Timing & Sentence Intonation",
      "Connected Speech (Linking, Elision & Weak Forms)",
      "Listening Strategies for Fast-Paced Native Audio",
    ],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    isPublished: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "week-6",
    weekNumber: 6,
    title: "Reading and Writing",
    description:
      "Learn to write clear messages, emails, and simple paragraphs in English.",
    learningObjectives: [
      "Skimming & Scanning Techniques for Articles & Books",
      "Professional Email Etiquette & Structural Formats",
      "Paragraph Cohesion, Transitions & Punctuation Precision",
      "Writing Descriptive & Persuasive Short Texts",
    ],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    isPublished: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "week-7",
    weekNumber: 7,
    title: "Interview and Workplace English",
    description:
      "Practise interview answers, professional conversations, meetings, and workplace communication.",
    learningObjectives: [
      "Interview Preparation & Self-Introduction Mastery",
      "Workplace Meetings, Summaries & Action Items",
      "Telephone & Video Call Communication Etiquette",
      "Travel, Dining, Emergencies & Social Etiquette",
    ],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    isPublished: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "week-8",
    weekNumber: 8,
    title: "Revision and Final Assessment",
    description:
      "Review what you have learned and assess your progress.",
    learningObjectives: [
      "Comprehensive Grammar & Phrasal Verb Synthesis",
      "Live Roleplay Simulation & Spoken Review",
      "Self-Assessment Portfolio & Ongoing Study Plan",
      "Final Spoken Evaluation & Course Completion Award",
    ],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    isPublished: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
];

const SEED_USERS: StoredUser[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Course Administrator",
    email: "learnandgrow050518@gmail.com",
    role: "admin",
    photoUrl: null,
    completionStatus: "completed",
    completedAt: undefined,
    publicConsent: false,
    passwordHash: "AdminPass123!",
    createdAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Course Administrator (Fallback)",
    email: "admin@course.edu",
    role: "admin",
    photoUrl: null,
    completionStatus: "completed",
    completedAt: undefined,
    publicConsent: false,
    passwordHash: "AdminPass123!",
    createdAt: "2026-08-01T10:00:00.000Z",
  },
];

const SEED_SUBSCRIPTIONS: Subscription[] = [];

const SEED_REVIEWS: StudentReview[] = [];

// =========================================================================
// SEED DATA: 20 Free English Grammar Assessment Questions
// =========================================================================

export const SEED_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q-01",
    orderIndex: 1,
    level: "beginner",
    questionText: "She _____ to school every day.",
    options: ["A) go", "B) goes", "C) going", "D) gone"],
    correctAnswer: "B) goes",
    explanation: 'Third-person singular "she" takes the singular verb form "goes" in present simple tense.',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-02",
    orderIndex: 2,
    level: "beginner",
    questionText: "I saw _____ elephant at the zoo.",
    options: ["A) a", "B) an", "C) the", "D) no article"],
    correctAnswer: "B) an",
    explanation: 'The word "elephant" begins with a vowel sound, so the indefinite article "an" is used.',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-03",
    orderIndex: 3,
    level: "beginner",
    questionText: "They _____ playing cricket now.",
    options: ["A) is", "B) am", "C) are", "D) was"],
    correctAnswer: "C) are",
    explanation: 'Plural subject "they" requires the plural auxiliary verb "are" in present continuous tense.',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-04",
    orderIndex: 4,
    level: "beginner",
    questionText: "This is Rani. _____ is my friend.",
    options: ["A) He", "B) It", "C) They", "D) She"],
    correctAnswer: "D) She",
    explanation: 'Rani is a female singular person, so the personal pronoun "She" is correct.',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-05",
    orderIndex: 5,
    level: "beginner",
    questionText: "We _____ dinner at 8 p.m. yesterday.",
    options: ["A) eat", "B) eaten", "C) ate", "D) eating"],
    correctAnswer: "C) ate",
    explanation: 'The past time marker "yesterday" requires the past simple form "ate".',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-06",
    orderIndex: 6,
    level: "beginner",
    questionText: "The book is _____ the table.",
    options: ["A) on", "B) at", "C) between", "D) from"],
    correctAnswer: "A) on",
    explanation: 'We use "on" for contact with a horizontal or vertical surface like a table.',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-07",
    orderIndex: 7,
    level: "beginner",
    questionText: "There _____ two apples in the basket.",
    options: ["A) is", "B) are", "C) was", "D) has"],
    correctAnswer: "B) are",
    explanation: '"Two apples" is plural, so the plural verb "are" is required in present tense.',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-08",
    orderIndex: 8,
    level: "intermediate",
    questionText: "I _____ here since 2022, and I still live here.",
    options: ["A) lived", "B) am living", "C) have lived", "D) had lived"],
    correctAnswer: "C) have lived",
    explanation: 'An action starting in the past and continuing into the present requires present perfect ("have lived").',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-09",
    orderIndex: 9,
    level: "intermediate",
    questionText: "If she _____ hard, she will pass the exam.",
    options: ["A) studied", "B) studies", "C) will study", "D) has studied"],
    correctAnswer: "B) studies",
    explanation: 'In first conditional clauses (If + present simple, will + base verb), use "studies".',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-10",
    orderIndex: 10,
    level: "intermediate",
    questionText: "She is interested _____ learning English.",
    options: ["A) on", "B) at", "C) for", "D) in"],
    correctAnswer: "D) in",
    explanation: 'The adjective "interested" takes the preposition "in".',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-11",
    orderIndex: 11,
    level: "intermediate",
    questionText: "By the time we arrived, the movie _____.",
    options: ["A) starts", "B) has started", "C) had started", "D) will start"],
    correctAnswer: "C) had started",
    explanation: 'Past perfect ("had started") indicates an action completed before another past event.',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-12",
    orderIndex: 12,
    level: "intermediate",
    questionText: "Neither Ravi nor his friends _____ ready.",
    options: ["A) is", "B) are", "C) was", "D) has"],
    correctAnswer: "B) are",
    explanation: 'In "neither... nor" constructions, the verb agrees with the closer subject ("his friends", plural).',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-13",
    orderIndex: 13,
    level: "intermediate",
    questionText: "This is the woman _____ helped me yesterday.",
    options: ["A) which", "B) whose", "C) who", "D) whom"],
    correctAnswer: "C) who",
    explanation: 'The relative pronoun "who" refers to people acting as the subject of the clause.',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-14",
    orderIndex: 14,
    level: "intermediate",
    questionText: "He was tired, _____ he continued working.",
    options: ["A) because", "B) although", "C) so", "D) but"],
    correctAnswer: "D) but",
    explanation: '"But" introduces a contrasting coordinating idea between two independent clauses.',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-15",
    orderIndex: 15,
    level: "advanced",
    questionText: "If I _____ about the traffic, I would have left earlier.",
    options: ["A) knew", "B) had known", "C) have known", "D) would know"],
    correctAnswer: "B) had known",
    explanation: 'Third conditional (unreal past) uses "had known" with "would have left".',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-16",
    orderIndex: 16,
    level: "advanced",
    questionText: 'The manager said, "I am busy." Choose the correct reported speech form.',
    options: [
      "A) The manager said that I am busy.",
      "B) The manager said that he was busy.",
      "C) The manager said that he is busy yesterday.",
      "D) The manager said that he were busy.",
    ],
    correctAnswer: "B) The manager said that he was busy.",
    explanation: 'In reported speech, present simple shifts back to past simple ("am" -> "was").',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-17",
    orderIndex: 17,
    level: "advanced",
    questionText: 'Choose the correct passive form: "They have completed the project."',
    options: [
      "A) The project has been completed.",
      "B) The project had completed.",
      "C) The project is completing.",
      "D) The project has being completed.",
    ],
    correctAnswer: "A) The project has been completed.",
    explanation: 'Present perfect passive structure: has/have + been + past participle ("has been completed").',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-18",
    orderIndex: 18,
    level: "advanced",
    questionText: "No sooner _____ the station than the train left.",
    options: [
      "A) we reached",
      "B) had we reached",
      "C) we had reached",
      "D) did we reached",
    ],
    correctAnswer: "B) had we reached",
    explanation: 'Negative inversion after "No sooner" requires auxiliary verb before subject: "had we reached".',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-19",
    orderIndex: 19,
    level: "advanced",
    questionText: "Choose the grammatically correct sentence.",
    options: [
      "A) Despite of the rain, we went out.",
      "B) Although the rain, we went out.",
      "C) In spite of the rain, we went out.",
      "D) Despite it was raining, we went out.",
    ],
    correctAnswer: "C) In spite of the rain, we went out.",
    explanation: '"In spite of" is followed by a noun phrase ("the rain"). "Despite" does not take "of".',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "q-20",
    orderIndex: 20,
    level: "advanced",
    questionText: "Choose the correct sentence using inversion for emphasis.",
    options: [
      "A) Rarely I have seen such a beautiful view.",
      "B) Rarely have I seen such a beautiful view.",
      "C) Rarely did I have seen such a beautiful view.",
      "D) Rarely I saw have such a beautiful view.",
    ],
    correctAnswer: "B) Rarely have I seen such a beautiful view.",
    explanation: 'When a sentence begins with a negative adverb like "Rarely", subject-auxiliary inversion is used ("have I seen").',
    isActive: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
];

export const SEED_ASSESSMENT_SETTINGS: AssessmentSettings = {
  id: "default",
  title: "Take a Free English Assessment",
  subtitle: "Learn and Grow – English Assessment",
  description:
    "Discover your current English grammar level with our free 20-question assessment. Find out where you stand and take the next step towards speaking English confidently.",
  instructions:
    "Choose the best option for each question. You can change your answers before final submission.",
  totalQuestions: 20,
  marksPerQuestion: 1,
  beginnerMaxScore: 7,
  intermediateMaxScore: 14,
  beginnerHeading: "Let's Build Your Foundation!",
  beginnerMessage:
    "Your English learning journey starts here. Strengthen your grammar and vocabulary with regular practice.",
  intermediateHeading: "Good Job!",
  intermediateMessage:
    "You have a good foundation in English. Keep practising to improve your fluency.",
  advancedHeading: "Excellent Work!",
  advancedMessage:
    "You demonstrated strong grammar knowledge. Continue practising to refine your communication skills.",
  ctaText: "Join Our Spoken English Class",
  whatsAppTemplate:
    "Hello Learn and Grow! I have completed the English Grammar Assessment.{{name}}\nMy Score: {{score}}/{{total}}\nAccuracy: {{accuracy}}\nMy Level: {{level}}\nI am interested in joining your 8-week Spoken English Course. Please share the syllabus, course fee, and enrollment details.",
  isActive: true,
  updatedAt: "2026-08-01T10:00:00.000Z",
};

export const DEFAULT_PRICING: CoursePricing = {
  originalPrice: 10500,
  sellingPrice: 3500,
  currency: "₹",
  discountPercent: 67,
  offerTag: "LIMITED TIME OFFER",
  isOfferActive: true,
  updatedAt: "2026-10-25T10:00:00.000Z",
};

const ASSESSMENT_STORE_PATH = path.join(process.cwd(), "data", "assessment_store.json");
const PRICING_STORE_PATH = path.join(process.cwd(), "data", "pricing_store.json");

function loadAssessmentStoreFromDisk(): {
  questions: AssessmentQuestion[];
  settings: AssessmentSettings;
  submissions: AssessmentSubmission[];
} | null {
  try {
    if (fs.existsSync(ASSESSMENT_STORE_PATH)) {
      const raw = fs.readFileSync(ASSESSMENT_STORE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read assessment_store.json from disk:", err);
  }
  return null;
}

function saveAssessmentStoreToDisk(data: {
  questions: AssessmentQuestion[];
  settings: AssessmentSettings;
  submissions: AssessmentSubmission[];
}) {
  try {
    const dir = path.dirname(ASSESSMENT_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ASSESSMENT_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write assessment_store.json to disk:", err);
  }
}

function loadPricingStoreFromDisk(): CoursePricing | null {
  try {
    if (fs.existsSync(PRICING_STORE_PATH)) {
      const raw = fs.readFileSync(PRICING_STORE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read pricing_store.json from disk:", err);
  }
  return null;
}

function savePricingStoreToDisk(pricing: CoursePricing) {
  try {
    const dir = path.dirname(PRICING_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRICING_STORE_PATH, JSON.stringify(pricing, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write pricing_store.json to disk:", err);
  }
}

// =========================================================================
// GLOBAL IN-MEMORY STORE (Fallback & dev cache)
// =========================================================================

function createInitialStore(): StoreData {
  const disk = loadAssessmentStoreFromDisk();
  const pricingDisk = loadPricingStoreFromDisk();
  return {
    users: JSON.parse(JSON.stringify(SEED_USERS)),
    subscriptions: JSON.parse(JSON.stringify(SEED_SUBSCRIPTIONS)),
    weeks: JSON.parse(JSON.stringify(SEED_WEEKS)),
    reviews: JSON.parse(JSON.stringify(SEED_REVIEWS)),
    photoBuffers: {},
    pdfBuffers: {},
    assessmentQuestions: disk?.questions || JSON.parse(JSON.stringify(SEED_ASSESSMENT_QUESTIONS)),
    assessmentSettings: disk?.settings || JSON.parse(JSON.stringify(SEED_ASSESSMENT_SETTINGS)),
    assessmentSubmissions: disk?.submissions || [],
    pricing: pricingDisk || { ...DEFAULT_PRICING },
  };
}

const g = globalThis as typeof globalThis & { __courseStore?: StoreData };
if (!g.__courseStore) {
  g.__courseStore = createInitialStore();
}

function getMemoryStore(): StoreData {
  if (!g.__courseStore) {
    g.__courseStore = createInitialStore();
  }
  if (!g.__courseStore.pricing || !g.__courseStore.pricing.originalPrice) {
    g.__courseStore.pricing = loadPricingStoreFromDisk() || { ...DEFAULT_PRICING };
  }
  return g.__courseStore;
}

// =========================================================================
// COURSE WEEKS
// =========================================================================

export async function getCourseWeeks(): Promise<CourseWeek[]> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("course_weeks")
        .select("*")
        .order("week_number", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          weekNumber: row.week_number,
          title: row.title,
          description: row.description,
          learningObjectives: Array.isArray(row.learning_objectives)
            ? row.learning_objectives
            : [],
          pdfFilename: row.pdf_filename,
          pdfStoragePath: row.pdf_storage_path,
          pdfFilesizeBytes: row.pdf_filesize_bytes,
          isPublished: row.is_published,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase getCourseWeeks fallback to memory:", err);
    }
  }

  const mem = getMemoryStore();
  return [...mem.weeks].sort((a, b) => a.weekNumber - b.weekNumber);
}

export async function getCourseWeek(weekNumber: number): Promise<CourseWeek | null> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("course_weeks")
        .select("*")
        .eq("week_number", weekNumber)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          weekNumber: data.week_number,
          title: data.title,
          description: data.description,
          learningObjectives: Array.isArray(data.learning_objectives)
            ? data.learning_objectives
            : [],
          pdfFilename: data.pdf_filename,
          pdfStoragePath: data.pdf_storage_path,
          pdfFilesizeBytes: data.pdf_filesize_bytes,
          isPublished: data.is_published,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase getCourseWeek fallback to memory:", err);
    }
  }

  const mem = getMemoryStore();
  return mem.weeks.find((w) => w.weekNumber === weekNumber) ?? null;
}

export async function updateCourseWeek(
  weekNumber: number,
  updates: Partial<CourseWeek>
): Promise<CourseWeek> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (typeof updates.title === "string") dbUpdates.title = updates.title;
      if (typeof updates.description === "string") dbUpdates.description = updates.description;
      if (Array.isArray(updates.learningObjectives)) {
        dbUpdates.learning_objectives = updates.learningObjectives;
      }
      if (typeof updates.isPublished === "boolean") {
        dbUpdates.is_published = updates.isPublished;
      }

      const { data, error } = await supabase
        .from("course_weeks")
        .update(dbUpdates)
        .eq("week_number", weekNumber)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          weekNumber: data.week_number,
          title: data.title,
          description: data.description,
          learningObjectives: data.learning_objectives,
          pdfFilename: data.pdf_filename,
          pdfStoragePath: data.pdf_storage_path,
          pdfFilesizeBytes: data.pdf_filesize_bytes,
          isPublished: data.is_published,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase updateCourseWeek fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const idx = mem.weeks.findIndex((w) => w.weekNumber === weekNumber);
  if (idx === -1) throw new Error(`Week ${weekNumber} not found.`);

  const updated: CourseWeek = {
    ...mem.weeks[idx],
    ...updates,
    weekNumber,
    updatedAt: new Date().toISOString(),
  };
  mem.weeks[idx] = updated;
  return updated;
}

export async function saveCourseWeekPdf(
  weekNumber: number,
  filename: string,
  buffer: Buffer
): Promise<CourseWeek> {
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storagePath = `week-${weekNumber}/${safeFilename}`;

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      // 1. Upload to Supabase Storage bucket 'course-pdfs'
      const { error: storageError } = await supabase.storage
        .from("course-pdfs")
        .upload(storagePath, buffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (storageError) {
        console.warn("Supabase storage upload error:", storageError.message);
      }

      // 2. Update course_weeks table in Supabase
      const { data, error: dbError } = await supabase
        .from("course_weeks")
        .update({
          pdf_filename: safeFilename,
          pdf_storage_path: storagePath,
          pdf_filesize_bytes: buffer.length,
          updated_at: new Date().toISOString(),
        })
        .eq("week_number", weekNumber)
        .select()
        .single();

      if (!dbError && data) {
        return {
          id: data.id,
          weekNumber: data.week_number,
          title: data.title,
          description: data.description,
          learningObjectives: data.learning_objectives,
          pdfFilename: data.pdf_filename,
          pdfStoragePath: data.pdf_storage_path,
          pdfFilesizeBytes: data.pdf_filesize_bytes,
          isPublished: data.is_published,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase saveCourseWeekPdf fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const idx = mem.weeks.findIndex((w) => w.weekNumber === weekNumber);
  if (idx === -1) throw new Error(`Week ${weekNumber} not found.`);

  mem.pdfBuffers[`week-${weekNumber}`] = buffer.toString("base64");

  const updated: CourseWeek = {
    ...mem.weeks[idx],
    pdfFilename: safeFilename,
    pdfStoragePath: storagePath,
    pdfFilesizeBytes: buffer.length,
    updatedAt: new Date().toISOString(),
  };
  mem.weeks[idx] = updated;
  return updated;
}

export async function deleteCourseWeekPdf(weekNumber: number): Promise<CourseWeek> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const current = await getCourseWeek(weekNumber);
      if (current?.pdfStoragePath) {
        await supabase.storage.from("course-pdfs").remove([current.pdfStoragePath]);
      }

      const { data, error } = await supabase
        .from("course_weeks")
        .update({
          pdf_filename: null,
          pdf_storage_path: null,
          pdf_filesize_bytes: null,
          updated_at: new Date().toISOString(),
        })
        .eq("week_number", weekNumber)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          weekNumber: data.week_number,
          title: data.title,
          description: data.description,
          learningObjectives: data.learning_objectives,
          pdfFilename: null,
          pdfStoragePath: null,
          pdfFilesizeBytes: null,
          isPublished: data.is_published,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase deleteCourseWeekPdf fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const idx = mem.weeks.findIndex((w) => w.weekNumber === weekNumber);
  if (idx === -1) throw new Error(`Week ${weekNumber} not found.`);

  delete mem.pdfBuffers[`week-${weekNumber}`];

  const updated: CourseWeek = {
    ...mem.weeks[idx],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    updatedAt: new Date().toISOString(),
  };
  mem.weeks[idx] = updated;
  return updated;
}

export async function getCourseWeekPdfBuffer(
  weekNumber: number
): Promise<{ buffer: Buffer; filename: string } | null> {
  const week = await getCourseWeek(weekNumber);
  if (!week || !week.pdfFilename) return null;

  const supabase = getSupabaseAdminClient();
  if (supabase && week.pdfStoragePath) {
    try {
      const { data, error } = await supabase.storage
        .from("course-pdfs")
        .download(week.pdfStoragePath);

      if (!error && data) {
        const arrayBuffer = await data.arrayBuffer();
        return {
          buffer: Buffer.from(arrayBuffer),
          filename: week.pdfFilename,
        };
      }
    } catch (err) {
      console.warn("Supabase storage download fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const pdfKey = `week-${weekNumber}`;
  if (mem.pdfBuffers[pdfKey]) {
    return {
      buffer: Buffer.from(mem.pdfBuffers[pdfKey], "base64"),
      filename: week.pdfFilename,
    };
  }

  // Fallback to auto-generated curriculum buffer for weeks 1 & 2
  if (week.pdfStoragePath) {
    const generated = generateCourseModulePdfBuffer(
      week.weekNumber,
      week.title,
      week.description,
      week.learningObjectives
    );
    return { buffer: generated, filename: week.pdfFilename };
  }

  return null;
}

// =========================================================================
// USERS & SUBSCRIPTIONS
// =========================================================================

export async function getStudentsWithSubscriptions(): Promise<StudentWithSubscription[]> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      const { data: subs, error: sError } = await supabase
        .from("subscriptions")
        .select("*");

      if (!pError && profiles && profiles.length > 0) {
        const subsMap = new Map((subs || []).map((s: any) => [s.student_id, s]));

        return profiles.map((p: any) => {
          const sub = subsMap.get(p.id) as any;
          return {
            id: p.id,
            name: p.name,
            email: p.email,
            role: p.role,
            photoUrl: p.photo_url || null,
            completionStatus: p.completion_status || "enrolled",
            completedAt: p.completed_at || null,
            publicConsent: p.public_consent ?? true,
            createdAt: p.created_at,
            subscriptionId: sub ? sub.id : `sub-${p.id}`,
            subscriptionStatus: sub ? sub.status : "pending",
            approvedAt: sub?.approved_at,
            approvedBy: sub?.approved_by,
          };
        });
      }
    } catch (err) {
      console.warn("Supabase getStudentsWithSubscriptions fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const students = mem.users.filter((u) => u.role === "student");

  return students.map((s) => {
    const sub = mem.subscriptions.find((sub) => sub.studentId === s.id);
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      photoUrl: s.photoUrl || null,
      completionStatus: s.completionStatus || "enrolled",
      completedAt: s.completedAt || null,
      publicConsent: s.publicConsent ?? true,
      createdAt: s.createdAt,
      subscriptionId: sub ? sub.id : `sub-${s.id}`,
      subscriptionStatus: sub ? sub.status : "pending",
      approvedAt: sub?.approvedAt,
      approvedBy: sub?.approvedBy,
    };
  });
}

export async function updateStudentSubscription(
  studentId: string,
  status: SubscriptionStatus,
  approvedBy?: string
): Promise<Subscription> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    try {
      const updatePayload: any = {
        status,
        updated_at: now,
      };
      if (status === "active") {
        updatePayload.approved_at = now;
        if (approvedBy) updatePayload.approved_by = approvedBy;
      } else if (status === "revoked" || status === "rejected") {
        updatePayload.approved_at = null;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .upsert(
          {
            student_id: studentId,
            ...updatePayload,
          },
          { onConflict: "student_id" }
        )
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          studentId: data.student_id,
          status: data.status,
          approvedBy: data.approved_by,
          approvedAt: data.approved_at,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase updateStudentSubscription fallback:", err);
    }
  }

  const mem = getMemoryStore();
  let sub = mem.subscriptions.find((s) => s.studentId === studentId);

  if (!sub) {
    sub = {
      id: `sub-${Date.now()}`,
      studentId,
      status,
      approvedBy: status === "active" ? approvedBy : undefined,
      approvedAt: status === "active" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };
    mem.subscriptions.push(sub);
  } else {
    sub.status = status;
    sub.updatedAt = now;
    if (status === "active") {
      sub.approvedBy = approvedBy || sub.approvedBy;
      sub.approvedAt = now;
    } else if (status === "revoked" || status === "rejected") {
      sub.approvedAt = undefined;
    }
  }

  return sub;
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.toLowerCase().trim();

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", normalized)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          passwordHash: data.password_hash || "AdminPass123!",
          photoUrl: data.photo_url,
          completionStatus: data.completion_status,
          completedAt: data.completed_at,
          publicConsent: data.public_consent,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn("Supabase getUserByEmail fallback:", err);
    }
  }

  const mem = getMemoryStore();
  if (
    normalized === "learnandgrow050518@gmail.com" ||
    normalized === "admin@course.edu" ||
    normalized === "admin@learnandgrow.edu"
  ) {
    const adminUser = mem.users.find(
      (u) => u.role === "admin" || u.email.toLowerCase() === normalized
    );
    if (adminUser) return adminUser;
  }

  return mem.users.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          photoUrl: data.photo_url,
          completionStatus: data.completion_status,
          completedAt: data.completed_at,
          publicConsent: data.public_consent,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn("Supabase getUserById fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const user = mem.users.find((u) => u.id === id);
  if (!user) return null;
  const { passwordHash: _, ...profile } = user;
  return profile;
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  role: UserRole = "student"
): Promise<UserProfile> {
  const normalizedEmail = email.toLowerCase().trim();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (existing) {
        throw new Error("A user with this email address already exists.");
      }

      const { data: profile, error: pError } = await supabase
        .from("profiles")
        .insert({
          name: name.trim(),
          email: normalizedEmail,
          role,
          password_hash: passwordHash,
          completion_status: "enrolled",
          public_consent: true,
        })
        .select()
        .single();

      if (pError) throw pError;

      if (role === "student" && profile) {
        await supabase.from("subscriptions").insert({
          student_id: profile.id,
          status: "pending",
          notes: "Newly registered student. Pending WhatsApp verification.",
        });
      }

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        photoUrl: profile.photo_url,
        completionStatus: profile.completion_status,
        completedAt: profile.completed_at,
        publicConsent: profile.public_consent,
        createdAt: profile.created_at,
      };
    } catch (err: any) {
      if (err.message?.includes("already exists")) throw err;
      console.warn("Supabase createUser fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const existing = mem.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error("A user with this email address already exists.");
  }

  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    role,
    passwordHash,
    photoUrl: null,
    completionStatus: "enrolled",
    completedAt: null,
    publicConsent: true,
    createdAt: new Date().toISOString(),
  };

  mem.users.push(newUser);

  if (role === "student") {
    mem.subscriptions.push({
      id: `sub-${Date.now()}`,
      studentId: newUser.id,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: "Newly registered student. Pending WhatsApp verification.",
    });
  }

  const { passwordHash: _, ...profile } = newUser;
  return profile;
}

export async function getStudentSubscription(studentId: string): Promise<Subscription | null> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("student_id", studentId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          studentId: data.student_id,
          status: data.status,
          approvedBy: data.approved_by,
          approvedAt: data.approved_at,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase getStudentSubscription fallback:", err);
    }
  }

  const mem = getMemoryStore();
  return mem.subscriptions.find((s) => s.studentId === studentId) ?? null;
}

// =========================================================================
// STUDENT PHOTOS & COMPLETION STATUS
// =========================================================================

export async function updateStudentCompletionStatus(
  studentId: string,
  status: CompletionStatus
): Promise<UserProfile> {
  const now = new Date().toISOString();
  const completedAt = status === "completed" ? now : null;

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          completion_status: status,
          completed_at: completedAt,
          updated_at: now,
        })
        .eq("id", studentId)
        .select()
        .single();

      if (!error && data) {
        // Update review completion status as well
        await supabase
          .from("reviews")
          .update({
            is_completed_student: status === "completed",
            updated_at: now,
          })
          .eq("student_id", studentId);

        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          photoUrl: data.photo_url,
          completionStatus: data.completion_status,
          completedAt: data.completed_at,
          publicConsent: data.public_consent,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn("Supabase updateStudentCompletionStatus fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const user = mem.users.find((u) => u.id === studentId);
  if (!user) throw new Error("Student not found.");

  user.completionStatus = status;
  user.completedAt = completedAt;

  mem.reviews.forEach((r) => {
    if (r.studentId === studentId) {
      r.isCompletedStudent = status === "completed";
      r.updatedAt = now;
    }
  });

  const { passwordHash: _, ...profile } = user;
  return profile;
}

export async function updateStudentProfile(
  studentId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    try {
      const dbUpdates: any = { updated_at: now };
      if (typeof updates.name === "string" && updates.name.trim()) {
        dbUpdates.name = updates.name.trim();
      }
      if (typeof updates.publicConsent === "boolean") {
        dbUpdates.public_consent = updates.publicConsent;
      }
      if (typeof updates.photoUrl !== "undefined") {
        dbUpdates.photo_url = updates.photoUrl;
      }
      if (typeof updates.completionStatus === "string") {
        dbUpdates.completion_status = updates.completionStatus;
        if (updates.completionStatus === "completed") {
          dbUpdates.completed_at = now;
        }
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", studentId)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          photoUrl: data.photo_url,
          completionStatus: data.completion_status,
          completedAt: data.completed_at,
          publicConsent: data.public_consent,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn("Supabase updateStudentProfile fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const user = mem.users.find((u) => u.id === studentId);
  if (!user) throw new Error("Student not found.");

  if (typeof updates.name === "string" && updates.name.trim()) {
    user.name = updates.name.trim();
  }
  if (typeof updates.publicConsent === "boolean") {
    user.publicConsent = updates.publicConsent;
  }
  if (typeof updates.photoUrl !== "undefined") {
    user.photoUrl = updates.photoUrl;
  }
  if (typeof updates.completionStatus === "string") {
    user.completionStatus = updates.completionStatus;
    if (updates.completionStatus === "completed" && !user.completedAt) {
      user.completedAt = now;
    }
  }

  const { passwordHash: _, ...profile } = user;
  return profile;
}

export async function saveStudentPhoto(
  studentId: string,
  filename: string,
  buffer: Buffer
): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const contentType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const storagePath = `${studentId}/avatar.${ext}`;
  const photoUrl = `/api/students/${studentId}/photo`;

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      await supabase.storage
        .from("student-photos")
        .upload(storagePath, buffer, { contentType, upsert: true });

      await supabase
        .from("profiles")
        .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
        .eq("id", studentId);

      await supabase
        .from("reviews")
        .update({ student_photo_url: photoUrl, updated_at: new Date().toISOString() })
        .eq("student_id", studentId);
    } catch (err) {
      console.warn("Supabase saveStudentPhoto storage upload fallback:", err);
    }
  }

  const mem = getMemoryStore();
  mem.photoBuffers[studentId] = {
    buffer: buffer.toString("base64"),
    contentType,
  };

  const user = mem.users.find((u) => u.id === studentId);
  if (user) user.photoUrl = photoUrl;

  mem.reviews.forEach((r) => {
    if (r.studentId === studentId) {
      r.studentPhotoUrl = photoUrl;
      r.updatedAt = new Date().toISOString();
    }
  });

  return photoUrl;
}

export async function removeStudentPhoto(studentId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data: files } = await supabase.storage
        .from("student-photos")
        .list(studentId);

      if (files && files.length > 0) {
        const paths = files.map((f: any) => `${studentId}/${f.name}`);
        await supabase.storage.from("student-photos").remove(paths);
      }

      await supabase
        .from("profiles")
        .update({ photo_url: null, updated_at: new Date().toISOString() })
        .eq("id", studentId);

      await supabase
        .from("reviews")
        .update({ student_photo_url: null, updated_at: new Date().toISOString() })
        .eq("student_id", studentId);
    } catch (err) {
      console.warn("Supabase removeStudentPhoto fallback:", err);
    }
  }

  const mem = getMemoryStore();
  delete mem.photoBuffers[studentId];

  const user = mem.users.find((u) => u.id === studentId);
  if (user) user.photoUrl = null;

  mem.reviews.forEach((r) => {
    if (r.studentId === studentId) {
      r.studentPhotoUrl = null;
      r.updatedAt = new Date().toISOString();
    }
  });
}

export async function getStudentPhotoBuffer(
  studentId: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data: files } = await supabase.storage
        .from("student-photos")
        .list(studentId);

      if (files && files.length > 0) {
        const filePath = `${studentId}/${files[0].name}`;
        const { data, error } = await supabase.storage
          .from("student-photos")
          .download(filePath);

        if (!error && data) {
          const ab = await data.arrayBuffer();
          const ext = files[0].name.split(".").pop()?.toLowerCase();
          const contentType =
            ext === "png"
              ? "image/png"
              : ext === "webp"
              ? "image/webp"
              : "image/jpeg";
          return { buffer: Buffer.from(ab), contentType };
        }
      }
    } catch (err) {
      console.warn("Supabase getStudentPhotoBuffer fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const entry = mem.photoBuffers[studentId];
  if (!entry) return null;
  return {
    buffer: Buffer.from(entry.buffer, "base64"),
    contentType: entry.contentType,
  };
}

// =========================================================================
// REVIEWS & MODERATION
// =========================================================================

export async function getApprovedReviews(featuredOnly = false): Promise<StudentReview[]> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      let query = supabase
        .from("reviews")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (featuredOnly) {
        query = query.eq("is_featured", true);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          studentId: r.student_id,
          studentName: r.student_name,
          studentEmail: r.student_email,
          studentPhotoUrl: r.student_photo_url,
          rating: r.rating,
          feedback: r.feedback,
          status: r.status,
          isFeatured: r.is_featured,
          isCompletedStudent: r.is_completed_student,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase getApprovedReviews fallback:", err);
    }
  }

  const mem = getMemoryStore();
  let reviews = mem.reviews.filter((r) => r.status === "approved");
  if (featuredOnly) {
    reviews = reviews.filter((r) => r.isFeatured);
  }
  return reviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getAllReviews(): Promise<StudentReview[]> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          studentId: r.student_id,
          studentName: r.student_name,
          studentEmail: r.student_email,
          studentPhotoUrl: r.student_photo_url,
          rating: r.rating,
          feedback: r.feedback,
          status: r.status,
          isFeatured: r.is_featured,
          isCompletedStudent: r.is_completed_student,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase getAllReviews fallback:", err);
    }
  }

  const mem = getMemoryStore();
  return [...mem.reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getStudentReview(studentId: string): Promise<StudentReview | null> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("student_id", studentId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          studentId: data.student_id,
          studentName: data.student_name,
          studentEmail: data.student_email,
          studentPhotoUrl: data.student_photo_url,
          rating: data.rating,
          feedback: data.feedback,
          status: data.status,
          isFeatured: data.is_featured,
          isCompletedStudent: data.is_completed_student,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase getStudentReview fallback:", err);
    }
  }

  const mem = getMemoryStore();
  return mem.reviews.find((r) => r.studentId === studentId) ?? null;
}

export async function createOrUpdateStudentReview(
  studentId: string,
  studentName: string,
  studentEmail: string,
  rating: number,
  feedback: string,
  photoUrl?: string | null
): Promise<StudentReview> {
  const user = await getUserById(studentId);
  const isCompleted = user?.completionStatus === "completed";
  const cleanRating = Math.max(1, Math.min(5, Math.round(rating)));
  const cleanFeedback = feedback.trim();
  const now = new Date().toISOString();

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .upsert(
          {
            student_id: studentId,
            student_name: studentName,
            student_email: studentEmail,
            student_photo_url: photoUrl ?? user?.photoUrl ?? null,
            rating: cleanRating,
            feedback: cleanFeedback,
            status: "pending",
            is_completed_student: isCompleted,
            updated_at: now,
          },
          { onConflict: "student_id" }
        )
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          studentId: data.student_id,
          studentName: data.student_name,
          studentEmail: data.student_email,
          studentPhotoUrl: data.student_photo_url,
          rating: data.rating,
          feedback: data.feedback,
          status: data.status,
          isFeatured: data.is_featured,
          isCompletedStudent: data.is_completed_student,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase createOrUpdateStudentReview fallback:", err);
    }
  }

  const mem = getMemoryStore();
  let existing = mem.reviews.find((r) => r.studentId === studentId);

  if (existing) {
    existing.rating = cleanRating;
    existing.feedback = cleanFeedback;
    existing.studentName = studentName;
    existing.studentEmail = studentEmail;
    existing.studentPhotoUrl = photoUrl ?? user?.photoUrl ?? null;
    existing.isCompletedStudent = isCompleted;
    existing.status = "pending";
    existing.updatedAt = now;
    return existing;
  }

  const newReview: StudentReview = {
    id: `rev-${Date.now()}`,
    studentId,
    studentName,
    studentEmail,
    studentPhotoUrl: photoUrl ?? user?.photoUrl ?? null,
    rating: cleanRating,
    feedback: cleanFeedback,
    status: "pending",
    isFeatured: false,
    isCompletedStudent: isCompleted,
    createdAt: now,
    updatedAt: now,
  };

  mem.reviews.push(newReview);
  return newReview;
}

export async function updateReviewModeration(
  reviewId: string,
  status: ReviewStatus,
  isFeatured?: boolean
): Promise<StudentReview> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    try {
      const updates: any = { status, updated_at: now };
      if (typeof isFeatured === "boolean") {
        updates.is_featured = isFeatured;
      }

      const { data, error } = await supabase
        .from("reviews")
        .update(updates)
        .eq("id", reviewId)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          studentId: data.student_id,
          studentName: data.student_name,
          studentEmail: data.student_email,
          studentPhotoUrl: data.student_photo_url,
          rating: data.rating,
          feedback: data.feedback,
          status: data.status,
          isFeatured: data.is_featured,
          isCompletedStudent: data.is_completed_student,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase updateReviewModeration fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const review = mem.reviews.find((r) => r.id === reviewId);
  if (!review) throw new Error("Review not found.");

  review.status = status;
  if (typeof isFeatured === "boolean") {
    review.isFeatured = isFeatured;
  }
  review.updatedAt = now;
  return review;
}

export async function deleteStudentReview(reviewId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      await supabase.from("reviews").delete().eq("id", reviewId);
      return;
    } catch (err) {
      console.warn("Supabase deleteStudentReview fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const idx = mem.reviews.findIndex((r) => r.id === reviewId);
  if (idx === -1) throw new Error("Review not found.");
  mem.reviews.splice(idx, 1);
}

// =========================================================================
// DASHBOARD & LIVE METRICS
// =========================================================================

export async function getCompletedStudentsCount(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student")
        .eq("completion_status", "completed");

      if (!error && typeof count === "number") {
        return count;
      }
    } catch (err) {
      console.warn("Supabase getCompletedStudentsCount fallback:", err);
    }
  }

  const mem = getMemoryStore();
  return mem.users.filter(
    (u) => u.role === "student" && u.completionStatus === "completed"
  ).length;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const [studentsRes, activeSubsRes, inProgRes, compRes, pdfsRes, reviewsRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "student"),
          supabase
            .from("subscriptions")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "student")
            .eq("completion_status", "in_progress"),
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "student")
            .eq("completion_status", "completed"),
          supabase
            .from("course_weeks")
            .select("*", { count: "exact", head: true })
            .not("pdf_storage_path", "is", null),
          supabase.from("reviews").select("rating, status"),
        ]);

      if (
        !studentsRes.error &&
        typeof studentsRes.count === "number" &&
        studentsRes.count > 0
      ) {
        const reviews = reviewsRes.data || [];
        const pendingReviews = reviews.filter((r: any) => r.status === "pending").length;
        const approvedReviews = reviews.filter((r: any) => r.status === "approved");

        let averageRating = 0;
        if (approvedReviews.length > 0) {
          const totalScore = approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
          averageRating = Math.round((totalScore / approvedReviews.length) * 10) / 10;
        }

        return {
          totalStudents: studentsRes.count ?? 0,
          activeSubscriptions: activeSubsRes.count ?? 0,
          studentsInProgress: inProgRes.count ?? 0,
          completedStudents: compRes.count ?? 0,
          pendingReviews,
          approvedReviews: approvedReviews.length,
          averageRating,
          totalPdfs: pdfsRes.count ?? 0,
        };
      }
    } catch (err) {
      console.warn("Supabase getDashboardStats fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const students = mem.users.filter((u) => u.role === "student");
  const activeSubs = mem.subscriptions.filter((s) => s.status === "active").length;
  const inProgress = students.filter((s) => s.completionStatus === "in_progress").length;
  const completed = students.filter((s) => s.completionStatus === "completed").length;
  const totalPdfs = mem.weeks.filter((w) => !!w.pdfStoragePath).length;

  const pendingReviews = mem.reviews.filter((r) => r.status === "pending").length;
  const approvedReviews = mem.reviews.filter((r) => r.status === "approved");

  let averageRating = 0;
  if (approvedReviews.length > 0) {
    const totalScore = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
    averageRating = Math.round((totalScore / approvedReviews.length) * 10) / 10;
  }

  return {
    totalStudents: students.length,
    activeSubscriptions: activeSubs,
    studentsInProgress: inProgress,
    completedStudents: completed,
    pendingReviews,
    approvedReviews: approvedReviews.length,
    averageRating,
    totalPdfs,
  };
}

// =========================================================================
// FREE ENGLISH GRAMMAR ASSESSMENT: LOGIC & DATA OPERATIONS
// =========================================================================

export function normalizeAnswer(ans: string): string {
  if (!ans) return "";
  return ans.trim().toLowerCase();
}

export function checkIsAnswerCorrect(userAns: string, correctAns: string): boolean {
  if (!userAns || !correctAns) return false;
  const normUser = normalizeAnswer(userAns);
  const normCorrect = normalizeAnswer(correctAns);

  if (normUser === normCorrect) return true;

  // Stripping option letter prefixes like "A) ", "b) ", "a. ", "A - "
  const stripPrefix = (str: string) => str.replace(/^[a-d][\).\s\-]+/i, "").trim();
  const strippedUser = stripPrefix(normUser);
  const strippedCorrect = stripPrefix(normCorrect);

  if (strippedUser && strippedCorrect && strippedUser === strippedCorrect) return true;

  // Check matching by leading letter prefix e.g. "B" vs "B) goes"
  const userLetter = normUser.match(/^[a-d]/i)?.[0];
  const correctLetter = normCorrect.match(/^[a-d]/i)?.[0];
  if (userLetter && correctLetter && userLetter === correctLetter) return true;

  return false;
}

/**
 * Retrieves all assessment questions from Supabase or resilient fallback store
 */
export async function getAssessmentQuestions(
  includeInactive = false
): Promise<AssessmentQuestion[]> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      let query = supabase
        .from("assessment_questions")
        .select("*")
        .order("order_index", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          orderIndex: row.order_index,
          level: row.level as AssessmentLevel,
          questionText: row.question_text,
          options: Array.isArray(row.options) ? row.options : [],
          correctAnswer: row.correct_answer,
          explanation: row.explanation || undefined,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase getAssessmentQuestions fallback:", err);
    }
  }

  const mem = getMemoryStore();
  let questions = [...mem.assessmentQuestions];
  if (!includeInactive) {
    questions = questions.filter((q) => q.isActive);
  }
  return questions.sort((a, b) => a.orderIndex - b.orderIndex);
}

/**
 * Public questions for students — strictly omits correct answers and answers key
 */
export async function getAssessmentQuestionsForStudent(): Promise<
  Omit<AssessmentQuestion, "correctAnswer">[]
> {
  const fullQuestions = await getAssessmentQuestions(false);
  return fullQuestions.map((q) => ({
    id: q.id,
    orderIndex: q.orderIndex,
    level: q.level,
    questionText: q.questionText,
    options: q.options,
    explanation: undefined, // Hidden until after submission
    isActive: q.isActive,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  }));
}

/**
 * Retrieves a single assessment question by ID
 */
export async function getAssessmentQuestionById(
  id: string
): Promise<AssessmentQuestion | null> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("assessment_questions")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          orderIndex: data.order_index,
          level: data.level as AssessmentLevel,
          questionText: data.question_text,
          options: Array.isArray(data.options) ? data.options : [],
          correctAnswer: data.correct_answer,
          explanation: data.explanation || undefined,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase getAssessmentQuestionById fallback:", err);
    }
  }

  const mem = getMemoryStore();
  return mem.assessmentQuestions.find((q) => q.id === id) || null;
}

/**
 * Creates or updates an assessment question with full validation
 */
export async function saveAssessmentQuestion(
  questionData: Partial<AssessmentQuestion> & { id?: string }
): Promise<AssessmentQuestion> {
  if (!questionData.questionText || !questionData.questionText.trim()) {
    throw new Error("Question text is required.");
  }

  if (
    !Array.isArray(questionData.options) ||
    questionData.options.length !== 4 ||
    questionData.options.some((opt) => !opt || !opt.trim())
  ) {
    throw new Error("Every question must have exactly four non-empty answer options.");
  }

  if (!questionData.correctAnswer || !questionData.correctAnswer.trim()) {
    throw new Error("A valid correct answer must be selected.");
  }

  const validLevels: AssessmentLevel[] = ["beginner", "intermediate", "advanced"];
  const level: AssessmentLevel = validLevels.includes(questionData.level as AssessmentLevel)
    ? (questionData.level as AssessmentLevel)
    : "beginner";

  const now = new Date().toISOString();
  const mem = getMemoryStore();

  let targetId = questionData.id;
  let orderIndex = questionData.orderIndex;

  if (!targetId) {
    targetId = `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    if (orderIndex === undefined) {
      const maxOrder = mem.assessmentQuestions.reduce(
        (max, q) => Math.max(max, q.orderIndex),
        0
      );
      orderIndex = maxOrder + 1;
    }
  } else if (orderIndex === undefined) {
    const existing = mem.assessmentQuestions.find((q) => q.id === targetId);
    orderIndex = existing ? existing.orderIndex : mem.assessmentQuestions.length + 1;
  }

  const savedQuestion: AssessmentQuestion = {
    id: targetId,
    orderIndex,
    level,
    questionText: questionData.questionText.trim(),
    options: questionData.options.map((opt) => opt.trim()),
    correctAnswer: questionData.correctAnswer.trim(),
    explanation: questionData.explanation?.trim() || undefined,
    isActive: questionData.isActive !== undefined ? questionData.isActive : true,
    createdAt: questionData.createdAt || now,
    updatedAt: now,
  };

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      await supabase.from("assessment_questions").upsert({
        id: savedQuestion.id,
        order_index: savedQuestion.orderIndex,
        level: savedQuestion.level,
        question_text: savedQuestion.questionText,
        options: savedQuestion.options,
        correct_answer: savedQuestion.correctAnswer,
        explanation: savedQuestion.explanation || null,
        is_active: savedQuestion.isActive,
        created_at: savedQuestion.createdAt,
        updated_at: savedQuestion.updatedAt,
      });
    } catch (err) {
      console.warn("Supabase saveAssessmentQuestion fallback:", err);
    }
  }

  const existingIdx = mem.assessmentQuestions.findIndex((q) => q.id === targetId);
  if (existingIdx >= 0) {
    mem.assessmentQuestions[existingIdx] = savedQuestion;
  } else {
    mem.assessmentQuestions.push(savedQuestion);
  }
  mem.assessmentQuestions.sort((a, b) => a.orderIndex - b.orderIndex);

  saveAssessmentStoreToDisk({
    questions: mem.assessmentQuestions,
    settings: mem.assessmentSettings,
    submissions: mem.assessmentSubmissions,
  });

  return savedQuestion;
}

/**
 * Deletes an assessment question by ID
 */
export async function deleteAssessmentQuestion(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      await supabase.from("assessment_questions").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase deleteAssessmentQuestion fallback:", err);
    }
  }

  const mem = getMemoryStore();
  const initialLen = mem.assessmentQuestions.length;
  mem.assessmentQuestions = mem.assessmentQuestions.filter((q) => q.id !== id);

  saveAssessmentStoreToDisk({
    questions: mem.assessmentQuestions,
    settings: mem.assessmentSettings,
    submissions: mem.assessmentSubmissions,
  });

  return mem.assessmentQuestions.length < initialLen;
}

/**
 * Reorders assessment questions according to an ordered list of IDs
 */
export async function reorderAssessmentQuestions(orderedIds: string[]): Promise<boolean> {
  const mem = getMemoryStore();
  const updatedQuestions: AssessmentQuestion[] = [];

  orderedIds.forEach((id, index) => {
    const q = mem.assessmentQuestions.find((item) => item.id === id);
    if (q) {
      q.orderIndex = index + 1;
      q.updatedAt = new Date().toISOString();
      updatedQuestions.push(q);
    }
  });

  const supabase = getSupabaseAdminClient();
  if (supabase && updatedQuestions.length > 0) {
    try {
      for (const q of updatedQuestions) {
        await supabase
          .from("assessment_questions")
          .update({ order_index: q.orderIndex, updated_at: q.updatedAt })
          .eq("id", q.id);
      }
    } catch (err) {
      console.warn("Supabase reorderAssessmentQuestions fallback:", err);
    }
  }

  mem.assessmentQuestions.sort((a, b) => a.orderIndex - b.orderIndex);

  saveAssessmentStoreToDisk({
    questions: mem.assessmentQuestions,
    settings: mem.assessmentSettings,
    submissions: mem.assessmentSubmissions,
  });

  return true;
}

/**
 * Retrieves assessment settings
 */
export async function getAssessmentSettings(): Promise<AssessmentSettings> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("assessment_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          instructions: data.instructions,
          totalQuestions: data.total_questions,
          marksPerQuestion: data.marks_per_question,
          beginnerMaxScore: data.beginner_max_score,
          intermediateMaxScore: data.intermediate_max_score,
          beginnerHeading: data.beginner_heading,
          beginnerMessage: data.beginner_message,
          intermediateHeading: data.intermediate_heading,
          intermediateMessage: data.intermediate_message,
          advancedHeading: data.advanced_heading,
          advancedMessage: data.advanced_message,
          ctaText: data.cta_text,
          whatsAppTemplate: data.whatsapp_template,
          isActive: data.is_active,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase getAssessmentSettings fallback:", err);
    }
  }

  const mem = getMemoryStore();
  return mem.assessmentSettings;
}

/**
 * Updates assessment settings
 */
export async function updateAssessmentSettings(
  settingsData: Partial<AssessmentSettings>
): Promise<AssessmentSettings> {
  const mem = getMemoryStore();
  const now = new Date().toISOString();

  const updated: AssessmentSettings = {
    ...mem.assessmentSettings,
    ...settingsData,
    id: "default",
    updatedAt: now,
  };

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      await supabase.from("assessment_settings").upsert({
        id: "default",
        title: updated.title,
        subtitle: updated.subtitle,
        description: updated.description,
        instructions: updated.instructions,
        total_questions: updated.totalQuestions,
        marks_per_question: updated.marksPerQuestion,
        beginner_max_score: updated.beginnerMaxScore,
        intermediate_max_score: updated.intermediateMaxScore,
        beginner_heading: updated.beginnerHeading,
        beginner_message: updated.beginnerMessage,
        intermediate_heading: updated.intermediateHeading,
        intermediate_message: updated.intermediateMessage,
        advanced_heading: updated.advancedHeading,
        advanced_message: updated.advancedMessage,
        cta_text: updated.ctaText,
        whatsapp_template: updated.whatsAppTemplate,
        is_active: updated.isActive,
        updated_at: updated.updatedAt,
      });
    } catch (err) {
      console.warn("Supabase updateAssessmentSettings fallback:", err);
    }
  }

  mem.assessmentSettings = updated;

  saveAssessmentStoreToDisk({
    questions: mem.assessmentQuestions,
    settings: mem.assessmentSettings,
    submissions: mem.assessmentSubmissions,
  });

  return updated;
}

/**
 * Trusted server-side assessment evaluation and score calculation
 * Scores answers against authoritative answer keys, records attempt, and builds WhatsApp CTA
 */
export async function submitAssessmentAttempt(params: {
  answers: Record<string, string>;
  studentName?: string;
  studentEmail?: string;
}): Promise<AssessmentEvaluationResult> {
  const settings = await getAssessmentSettings();
  const activeQuestions = await getAssessmentQuestions(false);

  if (activeQuestions.length === 0) {
    throw new Error("Assessment is currently unavailable or has no active questions.");
  }

  let correctCount = 0;
  const breakdown: AssessmentEvaluationResult["breakdown"] = [];

  for (const q of activeQuestions) {
    const userAns = params.answers[q.id] || "";
    const isCorrect = checkIsAnswerCorrect(userAns, q.correctAnswer);
    if (isCorrect) {
      correctCount += settings.marksPerQuestion || 1;
    }

    breakdown.push({
      questionId: q.id,
      orderIndex: q.orderIndex,
      questionText: q.questionText,
      level: q.level,
      selectedAnswer: userAns,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    });
  }

  const totalQuestions = activeQuestions.length;
  const score = correctCount;
  const accuracyPercentage = Math.round((score / totalQuestions) * 100);

  // Proficiency classification based on configurable score thresholds
  let level: AssessmentLevel = "advanced";
  let levelTitle = "Advanced Level";
  let feedbackHeading = settings.advancedHeading;
  let feedbackMessage = settings.advancedMessage;

  if (score <= settings.beginnerMaxScore) {
    level = "beginner";
    levelTitle = "Beginner Level";
    feedbackHeading = settings.beginnerHeading;
    feedbackMessage = settings.beginnerMessage;
  } else if (score <= settings.intermediateMaxScore) {
    level = "intermediate";
    levelTitle = "Intermediate Level";
    feedbackHeading = settings.intermediateHeading;
    feedbackMessage = settings.intermediateMessage;
  }

  const whatsAppUrl = buildAssessmentWhatsAppUrl({
    score,
    totalQuestions,
    accuracyPercentage,
    levelTitle,
    studentName: params.studentName,
    customTemplate: settings.whatsAppTemplate,
  });

  const submissionId = randomUUID();
  const now = new Date().toISOString();

  const submissionRecord: AssessmentSubmission = {
    id: submissionId,
    studentName: params.studentName?.trim() || undefined,
    studentEmail: params.studentEmail?.trim() || undefined,
    score,
    totalQuestions,
    accuracyPercentage,
    level,
    levelTitle,
    answers: params.answers,
    submittedAt: now,
  };

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      await supabase.from("assessment_submissions").insert({
        id: submissionRecord.id,
        student_name: submissionRecord.studentName || null,
        student_email: submissionRecord.studentEmail || null,
        score: submissionRecord.score,
        total_questions: submissionRecord.totalQuestions,
        accuracy_percentage: submissionRecord.accuracyPercentage,
        level: submissionRecord.level,
        level_title: submissionRecord.levelTitle,
        answers: submissionRecord.answers,
        submitted_at: submissionRecord.submittedAt,
      });
    } catch (err) {
      console.warn("Supabase submitAssessmentAttempt fallback:", err);
    }
  }

  const mem = getMemoryStore();
  mem.assessmentSubmissions.unshift(submissionRecord);

  saveAssessmentStoreToDisk({
    questions: mem.assessmentQuestions,
    settings: mem.assessmentSettings,
    submissions: mem.assessmentSubmissions,
  });

  return {
    submissionId,
    score,
    totalQuestions,
    accuracyPercentage,
    level,
    levelTitle,
    feedbackHeading,
    feedbackMessage,
    recommendedCtaText: settings.ctaText || "Join Our Spoken English Class",
    whatsAppUrl,
    breakdown,
  };
}

/**
 * Retrieves assessment submissions list (admin only)
 */
export async function getAssessmentSubmissions(): Promise<AssessmentSubmission[]> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("assessment_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          studentName: row.student_name || undefined,
          studentEmail: row.student_email || undefined,
          score: row.score,
          totalQuestions: row.total_questions,
          accuracyPercentage: row.accuracy_percentage,
          level: row.level as AssessmentLevel,
          levelTitle: row.level_title,
          answers: row.answers || {},
          submittedAt: row.submitted_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase getAssessmentSubmissions fallback:", err);
    }
  }

  const mem = getMemoryStore();
  return [...mem.assessmentSubmissions].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

/**
 * Computes live assessment statistics from real submission records
 */
export async function getAssessmentStats(): Promise<AssessmentStats> {
  const submissions = await getAssessmentSubmissions();

  const totalAttempts = submissions.length;
  const completedAttempts = submissions.length;

  let averageScore = 0;
  let averageAccuracy = 0;
  let beginnerCount = 0;
  let intermediateCount = 0;
  let advancedCount = 0;

  if (totalAttempts > 0) {
    const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
    const totalAccuracy = submissions.reduce((sum, s) => sum + s.accuracyPercentage, 0);

    averageScore = Math.round((totalScore / totalAttempts) * 10) / 10;
    averageAccuracy = Math.round(totalAccuracy / totalAttempts);

    beginnerCount = submissions.filter((s) => s.level === "beginner").length;
    intermediateCount = submissions.filter((s) => s.level === "intermediate").length;
    advancedCount = submissions.filter((s) => s.level === "advanced").length;
  }

  return {
    totalAttempts,
    completedAttempts,
    averageScore,
    averageAccuracy,
    beginnerCount,
    intermediateCount,
    advancedCount,
  };
}

// =========================================================================
// COURSE PRICING & FEE BREAKDOWN METHODS
// =========================================================================

/**
 * Retrieves the current course pricing breakdown.
 * Queries Supabase `course_pricing` table first if connected, falling back to disk/memory.
 */
export async function getCoursePricing(): Promise<CoursePricing> {
  if (isSupabaseConfigured()) {
    try {
      // Use admin client if available (bypasses RLS), otherwise fall back to anon (public read is allowed)
      const supabase = getSupabaseAdminClient() || getSupabaseAnonClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("course_pricing")
          .select("*")
          .eq("id", "default")
          .maybeSingle();

        if (error) {
          console.warn("Supabase getCoursePricing error:", error.message);
        } else if (data) {
          const orig = Number(data.original_price);
          const sell = Number(data.selling_price);
          const discount =
            data.discount_percent != null
              ? Number(data.discount_percent)
              : (orig > 0 ? Math.max(0, Math.round(((orig - sell) / orig) * 100)) : 0);

          return {
            originalPrice: orig,
            sellingPrice: sell,
            currency: data.currency || "₹",
            discountPercent: discount,
            offerTag: data.offer_tag || "LIMITED TIME OFFER",
            isOfferActive: data.is_offer_active ?? true,
            updatedAt: data.updated_at,
          };
        }
      }
    } catch (err) {
      console.warn("Supabase getCoursePricing exception:", err);
    }
  }

  const mem = getMemoryStore();
  return { ...mem.pricing };
}

/**
 * Updates course pricing and fee breakdown.
 * Persists to Supabase `course_pricing` and local disk cache.
 */
export async function updateCoursePricing(
  updates: Partial<CoursePricing>
): Promise<CoursePricing> {
  const mem = getMemoryStore();

  const originalPrice =
    updates.originalPrice !== undefined
      ? Number(updates.originalPrice)
      : mem.pricing.originalPrice;

  const sellingPrice =
    updates.sellingPrice !== undefined
      ? Number(updates.sellingPrice)
      : mem.pricing.sellingPrice;

  const calculatedDiscount =
    originalPrice > 0
      ? Math.max(0, Math.round(((originalPrice - sellingPrice) / originalPrice) * 100))
      : 0;

  const newPricing: CoursePricing = {
    originalPrice,
    sellingPrice,
    currency: updates.currency || mem.pricing.currency || "₹",
    discountPercent:
      updates.discountPercent !== undefined
        ? Number(updates.discountPercent)
        : calculatedDiscount,
    offerTag:
      updates.offerTag !== undefined ? updates.offerTag : mem.pricing.offerTag,
    isOfferActive:
      updates.isOfferActive !== undefined
        ? Boolean(updates.isOfferActive)
        : mem.pricing.isOfferActive,
    updatedAt: new Date().toISOString(),
  };

  mem.pricing = newPricing;
  savePricingStoreToDisk(newPricing);

  if (isSupabaseConfigured()) {
    try {
      // Use admin client (service role) — bypasses RLS for upsert. Fallback to anon if not configured.
      const supabase = getSupabaseAdminClient() || getSupabaseAnonClient();
      if (supabase) {
        const { error } = await supabase.from("course_pricing").upsert(
          {
            id: "default",
            original_price: newPricing.originalPrice,
            selling_price: newPricing.sellingPrice,
            currency: newPricing.currency,
            discount_percent: newPricing.discountPercent,
            offer_tag: newPricing.offerTag,
            is_offer_active: newPricing.isOfferActive,
            updated_at: newPricing.updatedAt,
          },
          { onConflict: "id" }
        );

        if (error) {
          console.error("Supabase updateCoursePricing upsert error:", error.message, error.details);
        } else {
          console.log("Supabase course_pricing updated successfully:", newPricing.sellingPrice);
        }
      } else {
        console.warn("No Supabase client available for updateCoursePricing — memory/disk only.");
      }
    } catch (err) {
      console.error("Supabase updateCoursePricing exception:", err);
    }
  }

  return newPricing;
}


