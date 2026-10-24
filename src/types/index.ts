export type UserRole = 'student' | 'admin';

export type SubscriptionStatus = 'pending' | 'active' | 'rejected' | 'revoked';

export type CompletionStatus = 'enrolled' | 'in_progress' | 'completed' | 'revoked';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string | null;
  completionStatus?: CompletionStatus;
  completedAt?: string | null;
  publicConsent?: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  studentId: string;
  status: SubscriptionStatus;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseWeek {
  id: string;
  weekNumber: number; // 1 to 8
  title: string;
  description: string;
  learningObjectives: string[];
  pdfFilename: string | null;
  pdfStoragePath: string | null;
  pdfFilesizeBytes: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentReview {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhotoUrl?: string | null;
  rating: number; // 1 to 5
  feedback: string;
  status: ReviewStatus;
  isFeatured: boolean;
  isCompletedStudent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentWithSubscription {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string | null;
  completionStatus: CompletionStatus;
  completedAt?: string | null;
  publicConsent: boolean;
  createdAt: string;
  subscriptionId: string;
  subscriptionStatus: SubscriptionStatus;
  approvedAt?: string;
  approvedBy?: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeSubscriptions: number;
  studentsInProgress: number;
  completedStudents: number;
  pendingReviews: number;
  approvedReviews: number;
  averageRating: number;
  totalPdfs: number;
}

export interface AuthSession {
  user: UserProfile;
  subscriptionStatus: SubscriptionStatus;
}

export type AssessmentLevel = "beginner" | "intermediate" | "advanced";

export interface AssessmentQuestion {
  id: string;
  orderIndex: number;
  level: AssessmentLevel;
  questionText: string;
  options: string[]; // exactly 4 options
  correctAnswer: string;
  explanation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSettings {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  instructions: string;
  totalQuestions: number;
  marksPerQuestion: number;
  beginnerMaxScore: number;
  intermediateMaxScore: number;
  beginnerHeading: string;
  beginnerMessage: string;
  intermediateHeading: string;
  intermediateMessage: string;
  advancedHeading: string;
  advancedMessage: string;
  ctaText: string;
  whatsAppTemplate: string;
  isActive: boolean;
  updatedAt: string;
}

export interface AssessmentSubmission {
  id: string;
  studentName?: string;
  studentEmail?: string;
  score: number;
  totalQuestions: number;
  accuracyPercentage: number;
  level: AssessmentLevel;
  levelTitle: string;
  answers: Record<string, string>;
  submittedAt: string;
}

export interface AssessmentStats {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  averageAccuracy: number;
  beginnerCount: number;
  intermediateCount: number;
  advancedCount: number;
}

export interface AssessmentEvaluationResult {
  submissionId: string;
  score: number;
  totalQuestions: number;
  accuracyPercentage: number;
  level: AssessmentLevel;
  levelTitle: string;
  feedbackHeading: string;
  feedbackMessage: string;
  recommendedCtaText: string;
  whatsAppUrl: string;
  breakdown: Array<{
    questionId: string;
    orderIndex: number;
    questionText: string;
    level: AssessmentLevel;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
}

