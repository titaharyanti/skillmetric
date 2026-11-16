export const DEPARTMENT_OPTIONS = [
  'Sales Hardware',
  'Sales Software',
  'Sales Maritime',
  'Telesales',
  'Operation',
  'Technician',
  'Customer Success',
  'Business Development',
] as const;

export type Department = typeof DEPARTMENT_OPTIONS[number];

export type ProductCategory = 'Software' | 'Hardware';

export type TrainingType = 'Internal' | 'Eksternal';

export type AssessmentCategory = 'Teori' | 'Praktek' | 'Role-play';

export interface TrainingProduct {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  trainingType?: TrainingType; // 'Internal' (Karyawan) vs 'Eksternal' (Pitching/Demo/Customer)
  targetAudience?: string; // e.g. "Sales Hardware, Teknisi" or "Calon Customer, Pitching"
  description: string;
  competencyRequirements: string[];
  defaultKKM: number;
}

export interface Participant {
  id: string;
  nip: string;
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
}

export interface AssessmentWeights {
  teoriWeight: number; // e.g. 30
  praktekWeight: number; // e.g. 40
  rolePlayWeight: number; // e.g. 30
}

export interface TrainingSession {
  id: string;
  participantId: string;
  productId: string;
  productCategory: ProductCategory;
  trainingType?: TrainingType; // 'Internal' | 'Eksternal'
  companyName?: string;
  trainingTitle?: string;
  guestEmails?: string;
  targetAudience?: string;
  
  // Schedule information
  date: string; // YYYY-MM-DD
  day: string; // e.g., "Senin"
  startTime: string; // e.g., "08:30"
  endTime: string; // e.g., "15:00"
  trainerName: string;

  // Pre-test & Post-test scores for N-Gain calculation
  preTestScore: number;
  postTestScore: number;

  // Assessment Component Scores (0 - 100)
  teoriScore: number;
  praktekScore: number;
  rolePlayScore: number;

  // Applied weights at time of session
  appliedWeights: AssessmentWeights;

  // Calculated metrics
  finalScore: number;
  nGainScore: number;
  nGainCategory: 'Tinggi' | 'Sedang' | 'Rendah';
  kkmThreshold: number;
  status: 'Kompeten' | 'Belum Kompeten';
  qualitativeGrade: 'A (Sangat Baik)' | 'B (Baik)' | 'C (Cukup)' | 'D (Perlu Remedial)';

  // Detailed Feedback / Aspect Notes
  teoriNotes?: string;
  praktekNotes?: string;
  rolePlayNotes?: string;
  evaluatorFeedback?: string;
  createdAt: string;
  googleEventId?: string;
}

export interface TrainingPlan {
  id: string;
  title: string;
  productId: string;
  type: 'Internal' | 'Eksternal';
  startDate: string;
  endDate: string;
  trainer: string;
  targetAudience: string;
  quota: number;
  registeredCount: number;
  status: 'Direncanakan' | 'Berjalan' | 'Selesai' | 'Dibatalkan';
  description: string;
  createdAt: string;
}

export interface TrainingRequest {
  id: string;
  participantId: string;
  productId: string;
  type: 'Internal' | 'Eksternal';
  requestedDate: string;
  reason: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  createdAt: string;
  adminNotes?: string;
}

export interface AppSettings {
  companyName: string;
  trainingCenterName: string;
  defaultKKM: number;
  weights: AssessmentWeights;
  trainers: string[];
  adminPin?: string;
}
