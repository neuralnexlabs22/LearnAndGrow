/**
 * data-store.ts — In-Memory Data Store (Vercel-Compatible)
 *
 * This module uses a global in-memory store seeded with initial data.
 * Data persists across hot-reloads in development but resets on serverless
 * cold-starts in production (Vercel). For persistent production data,
 * migrate to Supabase using the schema in /supabase/schema.sql.
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
} from "@/types";
import { generateCourseModulePdfBuffer } from "./pdf-generator";

interface StoredUser extends UserProfile {
  passwordHash: string;
}

interface StoreData {
  users: StoredUser[];
  subscriptions: Subscription[];
  weeks: CourseWeek[];
  reviews: StudentReview[];
  photoBuffers: Record<string, { buffer: string; contentType: string }>; // base64 encoded
  pdfBuffers: Record<string, string>; // base64 encoded, keyed by weekNumber
}

// =========================================================================
// SEED DATA: 8-Week English Learning Course
// =========================================================================

const SEED_WEEKS: CourseWeek[] = [
  {
    id: "week-1",
    weekNumber: 1,
    title: "English Foundations and Basic Sentence Formation",
    description:
      "Master essential sentence structures (SVO), subject-verb agreement, common auxiliary verbs, and foundational conversational patterns with zero confusion.",
    learningObjectives: [
      "Subject-Verb-Object (SVO) Core Architecture",
      "Articles (A, An, The) & Demonstrative Pronouns",
      "Auxiliary Verbs (Be, Do, Have) in Present Simple",
      "Essential Everyday Greetings & Self-Introductions",
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
    title: "Grammar and Tenses Mastery",
    description:
      "Gain complete control over past, present, and future tenses. Learn how native speakers convey timelines, continuous actions, and completed experiences naturally.",
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
    title: "Vocabulary and Everyday Expressions",
    description:
      "Expand beyond basic vocabulary with 250+ high-frequency collocations, phrasal verbs, idioms, and natural transitions used in daily interactions.",
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
    title: "Spoken English and Conversation Practice",
    description:
      "Develop spoken fluency, overcome hesitation, and practice real-time conversational turn-taking, active listening cues, and storytelling techniques.",
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
    title: "Pronunciation, Accent Clarity and Listening Skills",
    description:
      "Sharpen your acoustic comprehension and speech clarity. Master vowel distinctions, syllable stress, connected speech, and native intonation rhythms.",
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
    title: "Reading Comprehension and Writing Precision",
    description:
      "Analyze diverse texts, build analytical comprehension, and draft clear, cohesive emails, professional letters, and personal essays.",
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
    title: "Communication Skills and Real-Life Situations",
    description:
      "Apply your English in workplace environments, job interviews, customer service, telephone calls, travel scenarios, and negotiations.",
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
    title: "Revision, Practical Exercises, and Final Assessment",
    description:
      "Consolidate your 8-week knowledge with practical roleplays, comprehensive grammar & vocabulary review, and your final spoken English evaluation.",
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
    id: "admin-001",
    name: "Course Administrator",
    email: "admin@learnandgrow.edu",
    role: "admin",
    photoUrl: null,
    completionStatus: undefined,
    completedAt: undefined,
    publicConsent: false,
    passwordHash: "AdminPass123!",
    createdAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "student-001",
    name: "Alex Rivera",
    email: "active.student@example.com",
    role: "student",
    photoUrl: null,
    completionStatus: "completed",
    completedAt: "2026-10-15T12:00:00.000Z",
    publicConsent: true,
    passwordHash: "StudentPass123!",
    createdAt: "2026-08-15T14:30:00.000Z",
  },
  {
    id: "student-002",
    name: "Samantha Chen",
    email: "pending.student@example.com",
    role: "student",
    photoUrl: null,
    completionStatus: "in_progress",
    completedAt: null,
    publicConsent: true,
    passwordHash: "StudentPass123!",
    createdAt: "2026-09-12T09:15:00.000Z",
  },
  {
    id: "student-003",
    name: "Marcus Vance",
    email: "revoked.student@example.com",
    role: "student",
    photoUrl: null,
    completionStatus: "revoked",
    completedAt: null,
    publicConsent: false,
    passwordHash: "StudentPass123!",
    createdAt: "2026-09-02T11:20:00.000Z",
  },
  {
    id: "student-004",
    name: "David Miller",
    email: "david.miller@college.edu",
    role: "student",
    photoUrl: null,
    completionStatus: "completed",
    completedAt: "2026-10-20T16:00:00.000Z",
    publicConsent: true,
    passwordHash: "Password123!",
    createdAt: "2026-08-20T12:00:00.000Z",
  },
];

const SEED_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-001",
    studentId: "student-001",
    status: "active",
    approvedBy: "admin-001",
    approvedAt: "2026-08-16T10:00:00.000Z",
    notes: "Payment verified via WhatsApp and approved.",
    createdAt: "2026-08-15T14:30:00.000Z",
    updatedAt: "2026-08-16T10:00:00.000Z",
  },
  {
    id: "sub-002",
    studentId: "student-002",
    status: "active",
    approvedBy: "admin-001",
    approvedAt: "2026-09-13T11:00:00.000Z",
    notes: "Approved after WhatsApp bank confirmation.",
    createdAt: "2026-09-12T09:15:00.000Z",
    updatedAt: "2026-09-13T11:00:00.000Z",
  },
  {
    id: "sub-003",
    studentId: "student-003",
    status: "revoked",
    approvedBy: "admin-001",
    notes: "Access revoked due to policy violation.",
    createdAt: "2026-09-02T11:20:00.000Z",
    updatedAt: "2026-09-10T16:00:00.000Z",
  },
  {
    id: "sub-004",
    studentId: "student-004",
    status: "active",
    approvedBy: "admin-001",
    approvedAt: "2026-08-21T09:00:00.000Z",
    notes: "Approved and fully completed the 8 weeks.",
    createdAt: "2026-08-20T12:00:00.000Z",
    updatedAt: "2026-08-21T09:00:00.000Z",
  },
];

const SEED_REVIEWS: StudentReview[] = [
  {
    id: "rev-001",
    studentId: "student-001",
    studentName: "Alex Rivera",
    studentEmail: "active.student@example.com",
    studentPhotoUrl: null,
    rating: 5,
    feedback:
      "The 8-week structured progression gave me the confidence I was always missing. Breaking down grammar tenses and everyday conversational dialogues helped me speak fluently during my workplace team meetings.",
    status: "approved",
    isFeatured: true,
    isCompletedStudent: true,
    createdAt: "2026-10-16T14:00:00.000Z",
    updatedAt: "2026-10-16T14:00:00.000Z",
  },
  {
    id: "rev-002",
    studentId: "student-004",
    studentName: "David Miller",
    studentEmail: "david.miller@college.edu",
    studentPhotoUrl: null,
    rating: 5,
    feedback:
      "I used to hesitate and translate every word in my head. The pronunciation drills in Week 5 and the real-life communication scenarios completely transformed my speaking rhythm. Highly recommended!",
    status: "approved",
    isFeatured: true,
    isCompletedStudent: true,
    createdAt: "2026-10-21T10:30:00.000Z",
    updatedAt: "2026-10-21T10:30:00.000Z",
  },
  {
    id: "rev-003",
    studentId: "student-002",
    studentName: "Samantha Chen",
    studentEmail: "pending.student@example.com",
    studentPhotoUrl: null,
    rating: 5,
    feedback:
      "The weekly PDF workbooks are clear, practical, and filled with exercises that you can actually use every day. Having direct WhatsApp feedback from the instructor kept me motivated throughout.",
    status: "approved",
    isFeatured: true,
    isCompletedStudent: false,
    createdAt: "2026-10-18T09:00:00.000Z",
    updatedAt: "2026-10-18T09:00:00.000Z",
  },
];

// =========================================================================
// GLOBAL IN-MEMORY STORE (Survives hot-reloads via globalThis)
// =========================================================================

function createInitialStore(): StoreData {
  return {
    users: JSON.parse(JSON.stringify(SEED_USERS)),
    subscriptions: JSON.parse(JSON.stringify(SEED_SUBSCRIPTIONS)),
    weeks: JSON.parse(JSON.stringify(SEED_WEEKS)),
    reviews: JSON.parse(JSON.stringify(SEED_REVIEWS)),
    photoBuffers: {},
    pdfBuffers: {},
  };
}

// Use globalThis to persist the store across Next.js hot-reloads in dev
const g = globalThis as typeof globalThis & { __courseStore?: StoreData };
if (!g.__courseStore) {
  g.__courseStore = createInitialStore();
}

function getStore(): StoreData {
  if (!g.__courseStore) {
    g.__courseStore = createInitialStore();
  }
  return g.__courseStore;
}

/* ------------------- COURSE WEEKS ------------------- */

export async function getCourseWeeks(): Promise<CourseWeek[]> {
  const store = getStore();
  return [...store.weeks].sort((a, b) => a.weekNumber - b.weekNumber);
}

export async function getCourseWeek(weekNumber: number): Promise<CourseWeek | null> {
  const store = getStore();
  return store.weeks.find((w) => w.weekNumber === weekNumber) ?? null;
}

export async function updateCourseWeek(
  weekNumber: number,
  updates: Partial<CourseWeek>
): Promise<CourseWeek> {
  const store = getStore();
  const idx = store.weeks.findIndex((w) => w.weekNumber === weekNumber);
  if (idx === -1) throw new Error(`Week ${weekNumber} not found.`);

  const updated: CourseWeek = {
    ...store.weeks[idx],
    ...updates,
    weekNumber,
    updatedAt: new Date().toISOString(),
  };
  store.weeks[idx] = updated;
  return updated;
}

export async function saveCourseWeekPdf(
  weekNumber: number,
  filename: string,
  buffer: Buffer
): Promise<CourseWeek> {
  const store = getStore();
  const idx = store.weeks.findIndex((w) => w.weekNumber === weekNumber);
  if (idx === -1) throw new Error(`Week ${weekNumber} not found.`);

  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const relativePath = `week-${weekNumber}/${safeFilename}`;

  // Store PDF in-memory as base64
  store.pdfBuffers[`week-${weekNumber}`] = buffer.toString("base64");

  const updated: CourseWeek = {
    ...store.weeks[idx],
    pdfFilename: safeFilename,
    pdfStoragePath: relativePath,
    pdfFilesizeBytes: buffer.length,
    updatedAt: new Date().toISOString(),
  };
  store.weeks[idx] = updated;
  return updated;
}

export async function deleteCourseWeekPdf(weekNumber: number): Promise<CourseWeek> {
  const store = getStore();
  const idx = store.weeks.findIndex((w) => w.weekNumber === weekNumber);
  if (idx === -1) throw new Error(`Week ${weekNumber} not found.`);

  // Remove from in-memory PDF store
  delete store.pdfBuffers[`week-${weekNumber}`];

  const updated: CourseWeek = {
    ...store.weeks[idx],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    updatedAt: new Date().toISOString(),
  };
  store.weeks[idx] = updated;
  return updated;
}

export async function getCourseWeekPdfBuffer(
  weekNumber: number
): Promise<{ buffer: Buffer; filename: string } | null> {
  const store = getStore();
  const week = store.weeks.find((w) => w.weekNumber === weekNumber);
  if (!week || !week.pdfFilename) return null;

  // Check in-memory uploaded PDF first
  const pdfKey = `week-${weekNumber}`;
  if (store.pdfBuffers[pdfKey]) {
    return {
      buffer: Buffer.from(store.pdfBuffers[pdfKey], "base64"),
      filename: week.pdfFilename,
    };
  }

  // For weeks 1 & 2 that have default PDFs, generate on-the-fly
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

/* ------------------- USERS & SUBSCRIPTIONS ------------------- */

export async function getStudentsWithSubscriptions(): Promise<StudentWithSubscription[]> {
  const store = getStore();
  const students = store.users.filter((u) => u.role === "student");

  return students.map((s) => {
    const sub = store.subscriptions.find((sub) => sub.studentId === s.id);
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
  const store = getStore();
  let sub = store.subscriptions.find((s) => s.studentId === studentId);

  const now = new Date().toISOString();

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
    store.subscriptions.push(sub);
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
  const store = getStore();
  return (
    store.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    ) ?? null
  );
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const store = getStore();
  const user = store.users.find((u) => u.id === id);
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
  const store = getStore();
  const existing = store.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );
  if (existing) {
    throw new Error("A user with this email address already exists.");
  }

  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role,
    passwordHash,
    photoUrl: null,
    completionStatus: "enrolled",
    completedAt: null,
    publicConsent: true,
    createdAt: new Date().toISOString(),
  };

  store.users.push(newUser);

  if (role === "student") {
    store.subscriptions.push({
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
  const store = getStore();
  return store.subscriptions.find((s) => s.studentId === studentId) ?? null;
}

/* ------------------- STUDENT PHOTOS & COMPLETION STATUS ------------------- */

export async function updateStudentCompletionStatus(
  studentId: string,
  status: CompletionStatus
): Promise<UserProfile> {
  const store = getStore();
  const user = store.users.find((u) => u.id === studentId);
  if (!user) throw new Error("Student not found.");

  user.completionStatus = status;
  if (status === "completed") {
    user.completedAt = new Date().toISOString();
  } else {
    user.completedAt = null;
  }

  store.reviews.forEach((r) => {
    if (r.studentId === studentId) {
      r.isCompletedStudent = status === "completed";
      r.updatedAt = new Date().toISOString();
    }
  });

  const { passwordHash: _, ...profile } = user;
  return profile;
}

export async function updateStudentProfile(
  studentId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const store = getStore();
  const user = store.users.find((u) => u.id === studentId);
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
      user.completedAt = new Date().toISOString();
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
  const store = getStore();
  const user = store.users.find((u) => u.id === studentId);
  if (!user) throw new Error("Student not found.");

  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const contentType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  // Store photo in-memory as base64
  store.photoBuffers[studentId] = {
    buffer: buffer.toString("base64"),
    contentType,
  };

  const photoUrl = `/api/students/${studentId}/photo`;
  user.photoUrl = photoUrl;

  store.reviews.forEach((r) => {
    if (r.studentId === studentId) {
      r.studentPhotoUrl = photoUrl;
      r.updatedAt = new Date().toISOString();
    }
  });

  return photoUrl;
}

export async function removeStudentPhoto(studentId: string): Promise<void> {
  const store = getStore();
  const user = store.users.find((u) => u.id === studentId);
  if (!user) throw new Error("Student not found.");

  delete store.photoBuffers[studentId];
  user.photoUrl = null;

  store.reviews.forEach((r) => {
    if (r.studentId === studentId) {
      r.studentPhotoUrl = null;
      r.updatedAt = new Date().toISOString();
    }
  });
}

export async function getStudentPhotoBuffer(
  studentId: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const store = getStore();
  const entry = store.photoBuffers[studentId];
  if (!entry) return null;
  return {
    buffer: Buffer.from(entry.buffer, "base64"),
    contentType: entry.contentType,
  };
}

/* ------------------- STUDENT REVIEWS & RATINGS ------------------- */

export async function getApprovedReviews(featuredOnly = false): Promise<StudentReview[]> {
  const store = getStore();
  let reviews = store.reviews.filter((r) => r.status === "approved");
  if (featuredOnly) {
    reviews = reviews.filter((r) => r.isFeatured);
  }
  return reviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getAllReviews(): Promise<StudentReview[]> {
  const store = getStore();
  return [...store.reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getStudentReview(studentId: string): Promise<StudentReview | null> {
  const store = getStore();
  return store.reviews.find((r) => r.studentId === studentId) ?? null;
}

export async function createOrUpdateStudentReview(
  studentId: string,
  studentName: string,
  studentEmail: string,
  rating: number,
  feedback: string,
  photoUrl?: string | null
): Promise<StudentReview> {
  const store = getStore();
  const user = store.users.find((u) => u.id === studentId);
  const isCompleted = user?.completionStatus === "completed";

  const cleanRating = Math.max(1, Math.min(5, Math.round(rating)));
  const cleanFeedback = feedback.trim();

  let existing = store.reviews.find((r) => r.studentId === studentId);
  const now = new Date().toISOString();

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

  store.reviews.push(newReview);
  return newReview;
}

export async function updateReviewModeration(
  reviewId: string,
  status: ReviewStatus,
  isFeatured?: boolean
): Promise<StudentReview> {
  const store = getStore();
  const review = store.reviews.find((r) => r.id === reviewId);
  if (!review) throw new Error("Review not found.");

  review.status = status;
  if (typeof isFeatured === "boolean") {
    review.isFeatured = isFeatured;
  }
  review.updatedAt = new Date().toISOString();
  return review;
}

export async function deleteStudentReview(reviewId: string): Promise<void> {
  const store = getStore();
  const idx = store.reviews.findIndex((r) => r.id === reviewId);
  if (idx === -1) throw new Error("Review not found.");
  store.reviews.splice(idx, 1);
}

/* ------------------- DASHBOARD & LIVE COMPLETION METRICS ------------------- */

export async function getCompletedStudentsCount(): Promise<number> {
  const store = getStore();
  return store.users.filter(
    (u) => u.role === "student" && u.completionStatus === "completed"
  ).length;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const store = getStore();
  const students = store.users.filter((u) => u.role === "student");
  const activeSubs = store.subscriptions.filter((s) => s.status === "active").length;
  const inProgress = students.filter((s) => s.completionStatus === "in_progress").length;
  const completed = students.filter((s) => s.completionStatus === "completed").length;
  const totalPdfs = store.weeks.filter((w) => !!w.pdfStoragePath).length;

  const pendingReviews = store.reviews.filter((r) => r.status === "pending").length;
  const approvedReviews = store.reviews.filter((r) => r.status === "approved");

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
