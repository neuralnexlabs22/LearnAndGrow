import fs from "fs";
import path from "path";
import { CourseWeek, StudentWithSubscription, Subscription, SubscriptionStatus, UserProfile, UserRole } from "@/types";
import { generateCourseModulePdfBuffer } from "./pdf-generator";

interface StoredUser extends UserProfile {
  passwordHash: string;
}

interface StoreData {
  users: StoredUser[];
  subscriptions: Subscription[];
  weeks: CourseWeek[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "course_store.json");
const PRIVATE_UPLOADS_DIR = path.join(process.cwd(), "private_uploads", "course-materials");

// Initial 8 weeks data
const INITIAL_WEEKS: CourseWeek[] = [
  {
    id: "week-1",
    weekNumber: 1,
    title: "Core Architecture, Execution Context & Modern ES6+ Systems",
    description:
      "Understand JavaScript runtime engines, call stacks, event loops, memory lifecycle, and clean code patterns for scalable engineering.",
    learningObjectives: [
      "JavaScript Engine Internals (V8 & SpiderMonkey)",
      "Execution Context, Call Stack & Microtask Queue",
      "Memory Allocation, Garbage Collection & Leak Prevention",
      "Modern ES6+ Modules, Iterators & Immutable Data Patterns",
    ],
    pdfFilename: "Week-01-Architecture-Context.pdf",
    pdfStoragePath: "week-1/Week-01-Architecture-Context.pdf",
    pdfFilesizeBytes: 24800,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "week-2",
    weekNumber: 2,
    title: "Component Architecture, Reactive State & High-Performance UI",
    description:
      "Design composable component hierarchies, understand virtual DOM diffing, master custom state hooks, and optimize rendering pipelines.",
    learningObjectives: [
      "Atomic Design & Modular Component Hierarchies",
      "Reactivity Models & Virtual DOM Reconciliation",
      "Custom Hook Factories & Fine-Grained State Primitives",
      "Render Tree Profiling, Memoization & Layout Shifts",
    ],
    pdfFilename: "Week-02-Reactive-State.pdf",
    pdfStoragePath: "week-2/Week-02-Reactive-State.pdf",
    pdfFilesizeBytes: 26100,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "week-3",
    weekNumber: 3,
    title: "Backend Services, REST Protocols & Edge Middleware Architecture",
    description:
      "Build production-grade server endpoints, handle streaming requests, design robust API contracts, and leverage edge middleware.",
    learningObjectives: [
      "HTTP/2 & HTTP/3 Transport Mechanics",
      "RESTful API Design Standards & Idempotency",
      "Edge Middleware, Routing & Request Pipelines",
      "Error Handling Standards & Structured Logging",
    ],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "week-4",
    weekNumber: 4,
    title: "Relational Databases, PostgreSQL Modeling & ACID Transactions",
    description:
      "Master relational schema modeling, foreign key constraints, indexes, connection pooling, and multi-step ACID transactions.",
    learningObjectives: [
      "Normalized Relational Schema Design (3NF)",
      "Indexes: B-Tree, Hash, GIN & Query Planners",
      "ACID Guarantees, Isolation Levels & Concurrency",
      "Connection Pooling & Migration Workflows",
    ],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "week-5",
    weekNumber: 5,
    title: "Authentication, Role-Based Access Control & Web Security Hardening",
    description:
      "Implement defense-in-depth security: JWTs, secure HTTP-only cookie sessions, CSRF/XSS defenses, rate limiting, and RLS.",
    learningObjectives: [
      "Token Mechanics: Refresh & Access Token Lifecycles",
      "Secure Cookie Flags (HttpOnly, SameSite, Secure)",
      "Threat Mitigation: CSRF, XSS, SSRF & Injection",
      "Row Level Security (RLS) & Granular RBAC Gates",
    ],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "week-6",
    weekNumber: 6,
    title: "Real-Time Synchronization, WebSockets & Distributed Caching",
    description:
      "Implement duplex communication channels, handle optimistic UI updates, and design multi-tiered Redis caching strategies.",
    learningObjectives: [
      "WebSocket Protocol Handshakes & Heartbeats",
      "Pub/Sub Architectures & Presence Tracking",
      "Cache Invalidation Patterns (Stale-While-Revalidate)",
      "Optimistic UI State & Event Reconciliation",
    ],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "week-7",
    weekNumber: 7,
    title: "Automated Testing, CI/CD Pipelines & Containerized Environments",
    description:
      "Write unit, integration, and end-to-end tests; configure GitHub Actions CI/CD workflows, Docker containers, and artifact validation.",
    learningObjectives: [
      "Test-Driven Design: Unit, Integration & Contract Testing",
      "End-to-End Browser Automation with Playwright",
      "Containerization with Multi-Stage Dockerfiles",
      "Automated CI/CD Validation & Staging Deployments",
    ],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "week-8",
    weekNumber: 8,
    title: "Capstone Architecture, Production Observability & Performance Audits",
    description:
      "Bring everything together into a scalable capstone project. Perform Core Web Vitals audits, configure OpenTelemetry, and deploy.",
    learningObjectives: [
      "Full-Stack Production System Architecture",
      "Core Web Vitals (LCP, INP, CLS) Optimization",
      "APM Observability, Metrics & Telemetry Tracing",
      "Final Production Audit, Security Checklist & Launch",
    ],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed users
const INITIAL_USERS: StoredUser[] = [
  {
    id: "admin-001",
    name: "Course Administrator",
    email: "admin@course.edu",
    role: "admin",
    passwordHash: "AdminPass123!", // In real production hashed with bcrypt/argon2
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "student-001",
    name: "Alex Rivera",
    email: "active.student@example.com",
    role: "student",
    passwordHash: "StudentPass123!",
    createdAt: "2026-09-05T14:30:00.000Z",
  },
  {
    id: "student-002",
    name: "Samantha Chen",
    email: "pending.student@example.com",
    role: "student",
    passwordHash: "StudentPass123!",
    createdAt: "2026-09-12T09:15:00.000Z",
  },
  {
    id: "student-003",
    name: "Marcus Vance",
    email: "revoked.student@example.com",
    role: "student",
    passwordHash: "StudentPass123!",
    createdAt: "2026-09-02T11:20:00.000Z",
  },
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-001",
    studentId: "student-001",
    status: "active",
    approvedBy: "admin-001",
    approvedAt: "2026-09-06T10:00:00.000Z",
    notes: "Payment verified via WhatsApp and approved.",
    createdAt: "2026-09-05T14:30:00.000Z",
    updatedAt: "2026-09-06T10:00:00.000Z",
  },
  {
    id: "sub-002",
    studentId: "student-002",
    status: "pending",
    notes: "Enquiry received. Waiting for WhatsApp bank transfer confirmation.",
    createdAt: "2026-09-12T09:15:00.000Z",
    updatedAt: "2026-09-12T09:15:00.000Z",
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
];

function ensureStorageInitialized(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PRIVATE_UPLOADS_DIR)) {
    fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true });
  }

  // Seed initial sample PDFs for Week 1 & Week 2 if not present
  const week1Dir = path.join(PRIVATE_UPLOADS_DIR, "week-1");
  const week2Dir = path.join(PRIVATE_UPLOADS_DIR, "week-2");
  if (!fs.existsSync(week1Dir)) fs.mkdirSync(week1Dir, { recursive: true });
  if (!fs.existsSync(week2Dir)) fs.mkdirSync(week2Dir, { recursive: true });

  const week1PdfPath = path.join(week1Dir, "Week-01-Architecture-Context.pdf");
  if (!fs.existsSync(week1PdfPath)) {
    const pdfBuf = generateCourseModulePdfBuffer(
      1,
      INITIAL_WEEKS[0].title,
      INITIAL_WEEKS[0].description,
      INITIAL_WEEKS[0].learningObjectives
    );
    fs.writeFileSync(week1PdfPath, pdfBuf);
  }

  const week2PdfPath = path.join(week2Dir, "Week-02-Reactive-State.pdf");
  if (!fs.existsSync(week2PdfPath)) {
    const pdfBuf = generateCourseModulePdfBuffer(
      2,
      INITIAL_WEEKS[1].title,
      INITIAL_WEEKS[1].description,
      INITIAL_WEEKS[1].learningObjectives
    );
    fs.writeFileSync(week2PdfPath, pdfBuf);
  }

  if (!fs.existsSync(STORE_FILE)) {
    const initialData: StoreData = {
      users: INITIAL_USERS,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      weeks: INITIAL_WEEKS,
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const content = fs.readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed to parse store file, reinitializing", err);
    const initialData: StoreData = {
      users: INITIAL_USERS,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      weeks: INITIAL_WEEKS,
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
}

function writeStoreData(data: StoreData): void {
  ensureStorageInitialized();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function getCourseWeeks(): Promise<CourseWeek[]> {
  const store = ensureStorageInitialized();
  return store.weeks.sort((a, b) => a.weekNumber - b.weekNumber);
}

export async function getCourseWeek(weekNumber: number): Promise<CourseWeek | null> {
  const store = ensureStorageInitialized();
  const week = store.weeks.find((w) => w.weekNumber === weekNumber);
  return week || null;
}

export async function updateCourseWeek(
  weekNumber: number,
  updates: Partial<CourseWeek>
): Promise<CourseWeek> {
  const store = ensureStorageInitialized();
  const idx = store.weeks.findIndex((w) => w.weekNumber === weekNumber);
  if (idx === -1) {
    throw new Error(`Week ${weekNumber} not found.`);
  }

  const updated: CourseWeek = {
    ...store.weeks[idx],
    ...updates,
    weekNumber, // immutable
    updatedAt: new Date().toISOString(),
  };

  store.weeks[idx] = updated;
  writeStoreData(store);
  return updated;
}

export async function saveCourseWeekPdf(
  weekNumber: number,
  filename: string,
  buffer: Buffer
): Promise<CourseWeek> {
  const store = ensureStorageInitialized();
  const idx = store.weeks.findIndex((w) => w.weekNumber === weekNumber);
  if (idx === -1) {
    throw new Error(`Week ${weekNumber} not found.`);
  }

  const weekDir = path.join(PRIVATE_UPLOADS_DIR, `week-${weekNumber}`);
  if (!fs.existsSync(weekDir)) {
    fs.mkdirSync(weekDir, { recursive: true });
  }

  // Remove old PDF if any
  const existingPath = store.weeks[idx].pdfStoragePath;
  if (existingPath) {
    const oldFullPath = path.join(PRIVATE_UPLOADS_DIR, existingPath);
    if (fs.existsSync(oldFullPath)) {
      try {
        fs.unlinkSync(oldFullPath);
      } catch (e) {
        console.warn("Failed to delete previous PDF file:", e);
      }
    }
  }

  // Sanitize filename
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const relativePath = path.join(`week-${weekNumber}`, safeFilename).replace(/\\/g, "/");
  const fullPath = path.join(PRIVATE_UPLOADS_DIR, relativePath);

  fs.writeFileSync(fullPath, buffer);

  const updated: CourseWeek = {
    ...store.weeks[idx],
    pdfFilename: safeFilename,
    pdfStoragePath: relativePath,
    pdfFilesizeBytes: buffer.length,
    updatedAt: new Date().toISOString(),
  };

  store.weeks[idx] = updated;
  writeStoreData(store);
  return updated;
}

export async function deleteCourseWeekPdf(weekNumber: number): Promise<CourseWeek> {
  const store = ensureStorageInitialized();
  const idx = store.weeks.findIndex((w) => w.weekNumber === weekNumber);
  if (idx === -1) {
    throw new Error(`Week ${weekNumber} not found.`);
  }

  const relativePath = store.weeks[idx].pdfStoragePath;
  if (relativePath) {
    const fullPath = path.join(PRIVATE_UPLOADS_DIR, relativePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (e) {
        console.warn("Failed to delete PDF file:", e);
      }
    }
  }

  const updated: CourseWeek = {
    ...store.weeks[idx],
    pdfFilename: null,
    pdfStoragePath: null,
    pdfFilesizeBytes: null,
    updatedAt: new Date().toISOString(),
  };

  store.weeks[idx] = updated;
  writeStoreData(store);
  return updated;
}

export async function getCourseWeekPdfBuffer(
  weekNumber: number
): Promise<{ buffer: Buffer; filename: string } | null> {
  const store = ensureStorageInitialized();
  const week = store.weeks.find((w) => w.weekNumber === weekNumber);
  if (!week || !week.pdfStoragePath || !week.pdfFilename) {
    return null;
  }

  const fullPath = path.join(PRIVATE_UPLOADS_DIR, week.pdfStoragePath);
  if (!fs.existsSync(fullPath)) {
    // If file missing on disk, regenerate default if it's week 1 or 2
    const generated = generateCourseModulePdfBuffer(
      week.weekNumber,
      week.title,
      week.description,
      week.learningObjectives
    );
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, generated);
    return { buffer: generated, filename: week.pdfFilename };
  }

  const buffer = fs.readFileSync(fullPath);
  return { buffer, filename: week.pdfFilename };
}

export async function getStudentsWithSubscriptions(): Promise<StudentWithSubscription[]> {
  const store = ensureStorageInitialized();
  const students = store.users.filter((u) => u.role === "student");

  return students.map((s) => {
    const sub = store.subscriptions.find((sub) => sub.studentId === s.id);
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
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
  const store = ensureStorageInitialized();
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

  writeStoreData(store);
  return sub;
}

export async function getUserByEmail(
  email: string
): Promise<StoredUser | null> {
  const store = ensureStorageInitialized();
  const user = store.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );
  return user || null;
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const store = ensureStorageInitialized();
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
  const store = ensureStorageInitialized();
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
    createdAt: new Date().toISOString(),
  };

  store.users.push(newUser);

  // Automatically create a pending subscription for new students
  if (role === "student") {
    store.subscriptions.push({
      id: `sub-${Date.now()}`,
      studentId: newUser.id,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: "Newly registered student. Pending payment and WhatsApp verification.",
    });
  }

  writeStoreData(store);

  const { passwordHash: _, ...profile } = newUser;
  return profile;
}

export async function getStudentSubscription(
  studentId: string
): Promise<Subscription | null> {
  const store = ensureStorageInitialized();
  const sub = store.subscriptions.find((s) => s.studentId === studentId);
  return sub || null;
}

export async function getDashboardStats(): Promise<{
  totalStudents: number;
  activeSubscriptions: number;
  pendingSubscriptions: number;
  totalPdfs: number;
}> {
  const store = ensureStorageInitialized();
  const students = store.users.filter((u) => u.role === "student");
  const activeSubs = store.subscriptions.filter((s) => s.status === "active").length;
  const pendingSubs = store.subscriptions.filter((s) => s.status === "pending").length;
  const totalPdfs = store.weeks.filter((w) => !!w.pdfStoragePath).length;

  return {
    totalStudents: students.length,
    activeSubscriptions: activeSubs,
    pendingSubscriptions: pendingSubs,
    totalPdfs,
  };
}
