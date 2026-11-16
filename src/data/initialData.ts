import { AppSettings, Participant, TrainingProduct, TrainingSession, TrainingPlan, TrainingRequest } from '../types';

export const INITIAL_PRODUCTS: TrainingProduct[] = [];

export const INITIAL_PARTICIPANTS: Participant[] = [];

export const INITIAL_PLANS: TrainingPlan[] = [
  {
    id: 'plan_1',
    title: 'Pelatihan Dasar Web Modern (React & Vite)',
    productId: 'prod_react_basic', // dummy or resolved dynamically
    type: 'Internal',
    startDate: '2026-08-10',
    endDate: '2026-08-14',
    trainer: 'Fakhri Syofwal, S.T. (Software & Platform Trainer)',
    targetAudience: 'Sales Software & Operation',
    quota: 15,
    registeredCount: 8,
    status: 'Direncanakan',
    description: 'Pelatihan dasar mengenai single-page application menggunakan React, Vite, dan Tailwind CSS untuk mempercepat demo platform ke klien.',
    createdAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'plan_2',
    title: 'Workshop IoT Smart Sensing and Gateways',
    productId: 'prod_iot_adv',
    type: 'Eksternal',
    startDate: '2026-08-18',
    endDate: '2026-08-20',
    trainer: 'Sandy Azizi, S.T. (IoT Product Trainer)',
    targetAudience: 'Technician & Sales Hardware',
    quota: 10,
    registeredCount: 5,
    status: 'Direncanakan',
    description: 'Pelatihan lapangan untuk penempatan gateway IoT di area outdoor, troubleshooting noise frekuensi, dan konfigurasi sensor.',
    createdAt: '2026-08-02T10:00:00Z',
  }
];

export const INITIAL_REQUESTS: TrainingRequest[] = [
  {
    id: 'req_1',
    participantId: 'part_dummy',
    productId: 'prod_iot_adv',
    type: 'Internal',
    requestedDate: '2026-08-15',
    reason: 'Membutuhkan pemahaman lebih mendalam mengenai protokol MQTT untuk integrasi perangkat hardware di lapangan.',
    status: 'Pending',
    createdAt: '2026-08-05T14:30:00Z',
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  companyName: 'PT Techno Solution Nusantara',
  trainingCenterName: 'Pusat Pelatihan Kompetensi Tech Academy',
  defaultKKM: 75,
  weights: {
    teoriWeight: 30,
    praktekWeight: 40,
    rolePlayWeight: 30,
  },
  trainers: [
    'Asesor Tita Haryanti, S.T., M.T. (Group Product Trainer)',
    'Sandy Azizi, S.T. (IoT Product Trainer)',
    'Faturahman, S.M. (IoT Product Trainer)',
    'Kristovel Lamrezeki Simanullang, S.T. (Hardware Technical Trainer)',
    'Fakhri Syofwal, S.T. (Software & Platform Trainer)',
  ],
  adminPin: 'VSI7789',
};

export const INITIAL_SESSIONS: TrainingSession[] = [];
