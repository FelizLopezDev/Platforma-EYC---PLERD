export type UserRole = 'aic' | 'undersecretary' | 'secretary_general';

export type ReportStatus = 
  | 'pending'
  | 'submitted_to_undersecretary'
  | 'forwarded_to_secretary_general'
  | 'reviewed';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  commission?: string;
  district?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  aicId: string;
  aicName: string;
  commission: string;
  district: string;
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  submissionDate?: string;
  forwardingDate?: string;
  reviewedDate?: string;
  reviewedByName?: string;
  undersecretaryId?: string;
  undersecretaryName?: string;
  status: ReportStatus;
  summary?: string;
  pageCount?: number;
  hashVerification?: string;
  updatedAt: string;
}

export const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pendiente de envío',
  submitted_to_undersecretary: 'Enviado a Subsecretaría',
  forwarded_to_secretary_general: 'Reenviado a Secretaría General',
  reviewed: 'Revisado',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  aic: 'Usuario EYC',
  undersecretary: 'Subsecretario de Evaluación y Control',
  secretary_general: 'Secretario General',
};
