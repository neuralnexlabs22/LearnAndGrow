export type UserRole = 'student' | 'admin';

export type SubscriptionStatus = 'pending' | 'active' | 'rejected' | 'revoked';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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

export interface StudentWithSubscription {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  subscriptionId: string;
  subscriptionStatus: SubscriptionStatus;
  approvedAt?: string;
  approvedBy?: string;
}

export interface AuthSession {
  user: UserProfile;
  subscriptionStatus: SubscriptionStatus;
}
