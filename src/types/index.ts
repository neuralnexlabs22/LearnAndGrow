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
