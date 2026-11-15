export type EmergencyType = 'Medical' | 'Fire' | 'Security' | 'Hazard';

export type ReportStatus = 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface EmergencyReport {
  id: string;
  type: EmergencyType;
  location: string;
  description: string;
  photoUrl?: string;
  status: ReportStatus;
  urgency?: UrgencyLevel;
  submittedBy: string;
  submittedByEmail?: string;
  submittedByName?: string;
  adminNotes?: string;
  createdAt: any; // Timestamp or serialized string
  updatedAt?: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'admin';
  phone?: string;
  studentId?: string;
  createdAt?: string;
}

export interface ReportStats {
  total: number;
  newCount: number;
  acknowledgedCount: number;
  resolvedCount: number;
  criticalCount: number;
}

export interface EmailDispatchRecord {
  id: string;
  reportId: string;
  recipient: string;
  timestamp: string;
  subject: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  preview: string;
}
