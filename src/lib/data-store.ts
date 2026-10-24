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
} from "@/types";
import { generateCourseModulePdfBuffer } from "./pdf-generator";
import { getSupabaseAdminClient, isSupabaseConfigured } from "./supabase";

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
    id: "00000000-0000-0000-0000-000000000001",
    name: "Course Administrator",
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
// GLOBAL IN-MEMORY STORE (Fallback & dev cache)
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

const g = globalThis as typeof globalThis & { __courseStore?: StoreData };
if (!g.__courseStore) {
  g.__courseStore = createInitialStore();
}

function getMemoryStore(): StoreData {
  if (!g.__courseStore) {
    g.__courseStore = createInitialStore();
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
  if (normalized === "admin@course.edu" || normalized === "admin@learnandgrow.edu") {
    const adminUser = mem.users.find(
      (u) => u.role === "admin" || u.id === "00000000-0000-0000-0000-000000000001"
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
