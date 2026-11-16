import React, { useState } from 'react';
import {
  AppSettings,
  Participant,
  TrainingProduct,
  TrainingSession,
  TrainingPlan,
  TrainingRequest,
  DEPARTMENT_OPTIONS,
} from '../types';
import { ExportReportModal } from './ExportReportModal';
import { ImportExcelModal, ImportType } from './ImportExcelModal';
import {
  Settings,
  Sliders,
  Award,
  Users,
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Building,
  Lock,
  Eye,
  FileSpreadsheet,
  Upload,
  Boxes,
  Calendar,
  Inbox,
  Search,
  PlusCircle,
  Check,
  X,
  ChevronRight,
  Clock,
  Briefcase,
  Edit2,
  Info,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  sessions: TrainingSession[];
  setSessions: React.Dispatch<React.SetStateAction<TrainingSession[]>>;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  products: TrainingProduct[];
  setProducts: React.Dispatch<React.SetStateAction<TrainingProduct[]>>;
  trainingPlans: TrainingPlan[];
  setTrainingPlans: React.Dispatch<React.SetStateAction<TrainingPlan[]>>;
  trainingRequests: TrainingRequest[];
  setTrainingRequests: React.Dispatch<React.SetStateAction<TrainingRequest[]>>;
  isAdmin: boolean;
  onRequireAdmin: (msg?: string, pendingAction?: () => void) => void;
  onImportParticipants: (newParticipants: Participant[]) => void;
  onImportProducts: (newProducts: TrainingProduct[]) => void;
  onImportSessions: (newSessions: TrainingSession[]) => void;
  onClearAllData?: () => void;
}

type AdminTab = 'general' | 'participants' | 'products' | 'sessions' | 'plans' | 'requests';

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  sessions,
  setSessions,
  participants,
  setParticipants,
  products,
  setProducts,
  trainingPlans,
  setTrainingPlans,
  trainingRequests,
  setTrainingRequests,
  isAdmin,
  onRequireAdmin,
  onImportParticipants,
  onImportProducts,
  onImportSessions,
  onClearAllData,
}) => {
  // Navigation Tabs
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('general');

  // Search queries for database tables
  const [searchParticipant, setSearchParticipant] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [searchSession, setSearchSession] = useState('');
  const [searchPlan, setSearchPlan] = useState('');
  const [searchRequest, setSearchRequest] = useState('');

  // General Settings Form States
  const [teoriWeight, setTeoriWeight] = useState(settings.weights.teoriWeight);
  const [praktekWeight, setPraktekWeight] = useState(settings.weights.praktekWeight);
  const [rolePlayWeight, setRolePlayWeight] = useState(settings.weights.rolePlayWeight);
  const [defaultKKM, setDefaultKKM] = useState(settings.defaultKKM);
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [trainingCenterName, setTrainingCenterName] = useState(settings.trainingCenterName);
  const [adminPin, setAdminPin] = useState(settings.adminPin || 'VSI7789');
  const [trainers, setTrainers] = useState<string[]>(settings.trainers);
  const [newTrainer, setNewTrainer] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modal / Inline Edit States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportExcelOpen, setIsImportExcelOpen] = useState(false);
  const [importExcelType, setImportExcelType] = useState<ImportType>('participants');

  // Form Modals for Entities inside Control Panel
  const [participantFormOpen, setParticipantFormOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<TrainingProduct | null>(null);

  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);

  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);

  // Request Approval Admin notes
  const [editingRequest, setEditingRequest] = useState<TrainingRequest | null>(null);
  const [requestAdminNotes, setRequestAdminNotes] = useState('');

  // -------------------------------------------------------------
  // ENTITY FORM BINDINGS
  // -------------------------------------------------------------
  
  // Participant Form States
  const [pId, setPId] = useState('');
  const [pNip, setPNip] = useState('');
  const [pName, setPName] = useState('');
  const [pDepartment, setPDepartment] = useState<string>(DEPARTMENT_OPTIONS[0]);
  const [pRole, setPRole] = useState('Specialist');
  const [pEmail, setPEmail] = useState('');
  const [pPhone, setPPhone] = useState('');

  // Product Form States
  const [prodId, setProdId] = useState('');
  const [prodCode, setProdCode] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<'Software' | 'Hardware'>('Software');
  const [prodType, setProdType] = useState<'Internal' | 'Eksternal'>('Internal');
  const [prodAudience, setProdAudience] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodRequirements, setProdRequirements] = useState('');
  const [prodKKM, setProdKKM] = useState(75);

  // Session Form States
  const [sessId, setSessId] = useState('');
  const [sessParticipantId, setSessParticipantId] = useState('');
  const [sessProductId, setSessProductId] = useState('');
  const [sessType, setSessType] = useState<'Internal' | 'Eksternal'>('Internal');
  const [sessCompanyName, setSessCompanyName] = useState('');
  const [sessTitle, setSessTitle] = useState('');
  const [sessGuestEmails, setSessGuestEmails] = useState('');
  const [sessDate, setSessDate] = useState('');
  const [sessStartTime, setSessStartTime] = useState('09:00');
  const [sessEndTime, setSessEndTime] = useState('11:00');
  const [sessTrainer, setSessTrainer] = useState('');
  const [sessPreTest, setSessPreTest] = useState(0);
  const [sessPostTest, setSessPostTest] = useState(0);
  const [sessTeori, setSessTeori] = useState(0);
  const [sessPraktek, setSessPraktek] = useState(0);
  const [sessRolePlay, setSessRolePlay] = useState(0);
  const [sessTeoriNotes, setSessTeoriNotes] = useState('');
  const [sessPraktekNotes, setSessPraktekNotes] = useState('');
  const [sessRolePlayNotes, setSessRolePlayNotes] = useState('');
  const [sessFeedback, setSessFeedback] = useState('');

  // Plan Form States
  const [planId, setPlanId] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [planProductId, setPlanProductId] = useState('');
  const [planType, setPlanType] = useState<'Internal' | 'Eksternal'>('Internal');
  const [planStartDate, setPlanStartDate] = useState('');
  const [planEndDate, setPlanEndDate] = useState('');
  const [planTrainer, setPlanTrainer] = useState('');
  const [planAudience, setPlanAudience] = useState('');
  const [planQuota, setPlanQuota] = useState(10);
  const [planRegistered, setPlanRegistered] = useState(0);
  const [planStatus, setPlanStatus] = useState<'Direncanakan' | 'Berjalan' | 'Selesai' | 'Dibatalkan'>('Direncanakan');
  const [planDesc, setPlanDesc] = useState('');

  // -------------------------------------------------------------
  // OPEN ENTITY CREATION HANDLERS
  // -------------------------------------------------------------
  const handleOpenParticipantForm = (item: Participant | null = null) => {
    if (!isAdmin) {
      onRequireAdmin('Akses Admin diperlukan untuk menambah atau mengedit peserta.', () => handleOpenParticipantForm(item));
      return;
    }
    setEditingParticipant(item);
    if (item) {
      setPId(item.id);
      setPNip(item.nip);
      setPName(item.name);
      setPDepartment(item.department);
      setPRole(item.role);
      setPEmail(item.email);
      setPPhone(item.phone);
    } else {
      setPId(`part-${Date.now()}`);
      setPNip(`TRN-2026-00${Math.floor(Math.random() * 90 + 10)}`);
      setPName('');
      setPDepartment(DEPARTMENT_OPTIONS[0]);
      setPRole('Sales Specialist');
      setPEmail('');
      setPPhone('');
    }
    setParticipantFormOpen(true);
  };

  const handleOpenProductForm = (item: TrainingProduct | null = null) => {
    if (!isAdmin) {
      onRequireAdmin('Akses Admin diperlukan untuk mengelola produk.', () => handleOpenProductForm(item));
      return;
    }
    setEditingProduct(item);
    if (item) {
      setProdId(item.id);
      setProdCode(item.code);
      setProdName(item.name);
      setProdCategory(item.category);
      setProdType(item.trainingType || 'Internal');
      setProdAudience(item.targetAudience || '');
      setProdDescription(item.description);
      setProdRequirements(item.competencyRequirements.join(', '));
      setProdKKM(item.defaultKKM || settings.defaultKKM);
    } else {
      setProdId(`prod-${Date.now()}`);
      setProdCode(`PROD-${Math.floor(Math.random() * 900 + 100)}`);
      setProdName('');
      setProdCategory('Software');
      setProdType('Internal');
      setProdAudience('');
      setProdDescription('');
      setProdRequirements('Sertifikasi dasar, Pemahaman produk');
      setProdKKM(settings.defaultKKM);
    }
    setProductFormOpen(true);
  };

  const handleOpenSessionForm = (item: TrainingSession | null = null) => {
    if (!isAdmin) {
      onRequireAdmin('Akses Admin diperlukan untuk mengelola hasil assessment.', () => handleOpenSessionForm(item));
      return;
    }
    setEditingSession(item);
    if (item) {
      setSessId(item.id);
      setSessParticipantId(item.participantId);
      setSessProductId(item.productId);
      setSessType(item.trainingType || 'Internal');
      setSessCompanyName(item.companyName || '');
      setSessTitle(item.trainingTitle || '');
      setSessGuestEmails(item.guestEmails || '');
      setSessDate(item.date);
      setSessStartTime(item.startTime);
      setSessEndTime(item.endTime);
      setSessTrainer(item.trainerName);
      setSessPreTest(item.preTestScore);
      setSessPostTest(item.postTestScore);
      setSessTeori(item.teoriScore);
      setSessPraktek(item.praktekScore);
      setSessRolePlay(item.rolePlayScore);
      setSessTeoriNotes(item.teoriNotes || '');
      setSessPraktekNotes(item.praktekNotes || '');
      setSessRolePlayNotes(item.rolePlayNotes || '');
      setSessFeedback(item.evaluatorFeedback || '');
    } else {
      setSessId(`sess-${Date.now()}`);
      setSessParticipantId(participants[0]?.id || '');
      setSessProductId(products[0]?.id || '');
      setSessType('Internal');
      setSessCompanyName('');
      setSessTitle('');
      setSessGuestEmails('');
      setSessDate(new Date().toISOString().slice(0, 10));
      setSessStartTime('09:00');
      setSessEndTime('11:00');
      setSessTrainer(trainers[0] || 'Asesor Utama');
      setSessPreTest(0);
      setSessPostTest(0);
      setSessTeori(0);
      setSessPraktek(0);
      setSessRolePlay(0);
      setSessTeoriNotes('');
      setSessPraktekNotes('');
      setSessRolePlayNotes('');
      setSessFeedback('');
    }
    setSessionFormOpen(true);
  };

  const handleOpenPlanForm = (item: TrainingPlan | null = null) => {
    if (!isAdmin) {
      onRequireAdmin('Akses Admin diperlukan untuk mengelola rencana training.', () => handleOpenPlanForm(item));
      return;
    }
    setEditingPlan(item);
    if (item) {
      setPlanId(item.id);
      setPlanTitle(item.title);
      setPlanProductId(item.productId);
      setPlanType(item.type);
      setPlanStartDate(item.startDate);
      setPlanEndDate(item.endDate);
      setPlanTrainer(item.trainer);
      setPlanAudience(item.targetAudience);
      setPlanQuota(item.quota);
      setPlanRegistered(item.registeredCount);
      setPlanStatus(item.status);
      setPlanDesc(item.description);
    } else {
      setPlanId(`plan-${Date.now()}`);
      setPlanTitle('');
      setPlanProductId(products[0]?.id || '');
      setPlanType('Internal');
      setPlanStartDate(new Date().toISOString().slice(0, 10));
      setPlanEndDate(new Date().toISOString().slice(0, 10));
      setPlanTrainer(trainers[0] || 'Asesor Utama');
      setPlanAudience('All Sales & Tech Teams');
      setPlanQuota(15);
      setPlanRegistered(0);
      setPlanStatus('Direncanakan');
      setPlanDesc('');
    }
    setPlanFormOpen(true);
  };

  // -------------------------------------------------------------
  // SAVE / DELETE EVENT SUBMISSIONS
  // -------------------------------------------------------------
  const handleSaveParticipantForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pNip.trim() || !pName.trim()) {
      alert('NIP dan Nama Lengkap wajib diisi.');
      return;
    }
    const saved: Participant = {
      id: pId,
      nip: pNip,
      name: pName,
      department: pDepartment,
      role: pRole,
      email: pEmail || `${pName.toLowerCase().replace(/\s+/g, '.')}@company.id`,
      phone: pPhone || '0812-0000-0000',
    };
    setParticipants((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
      return [saved, ...prev];
    });
    setParticipantFormOpen(false);
  };

  const handleDeleteParticipant = (id: string) => {
    if (!isAdmin) {
      onRequireAdmin('Akses Admin diperlukan untuk menghapus peserta.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus peserta ini? Semua riwayat assessment terkait juga akan dihapus.')) {
      setParticipants((prev) => prev.filter((p) => p.id !== id));
      setSessions((prev) => prev.filter((s) => s.participantId !== id));
    }
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodCode.trim() || !prodName.trim()) {
      alert('Kode dan Nama Produk wajib diisi.');
      return;
    }
    const saved: TrainingProduct = {
      id: prodId,
      code: prodCode,
      name: prodName,
      category: prodCategory,
      trainingType: prodType,
      targetAudience: prodAudience,
      description: prodDescription,
      competencyRequirements: prodRequirements.split(',').map((r) => r.trim()).filter(Boolean),
      defaultKKM: Number(prodKKM),
    };
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
      return [saved, ...prev];
    });
    setProductFormOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (!isAdmin) {
      onRequireAdmin('Akses Admin diperlukan untuk menghapus produk.');
      return;
    }
    if (confirm('Hapus produk training ini?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const calculateMetrics = (
    teori: number,
    praktek: number,
    roleplay: number,
    pre: number,
    post: number,
    kkm: number
  ) => {
    const finalScore = Math.round(
      (teori * settings.weights.teoriWeight +
        praktek * settings.weights.praktekWeight +
        roleplay * settings.weights.rolePlayWeight) /
        100
    );

    // N-Gain
    let nGainScore = 0;
    if (100 - pre > 0) {
      nGainScore = (post - pre) / (100 - pre);
    }
    nGainScore = Math.max(0, Math.min(1, Math.round(nGainScore * 100) / 100));

    let nGainCategory: 'Tinggi' | 'Sedang' | 'Rendah' = 'Rendah';
    if (nGainScore >= 0.7) nGainCategory = 'Tinggi';
    else if (nGainScore >= 0.3) nGainCategory = 'Sedang';

    const status: 'Kompeten' | 'Belum Kompeten' = finalScore >= kkm ? 'Kompeten' : 'Belum Kompeten';

    let qualitativeGrade: 'A (Sangat Baik)' | 'B (Baik)' | 'C (Cukup)' | 'D (Perlu Remedial)' = 'D (Perlu Remedial)';
    if (finalScore >= 90) qualitativeGrade = 'A (Sangat Baik)';
    else if (finalScore >= 80) qualitativeGrade = 'B (Baik)';
    else if (finalScore >= kkm) qualitativeGrade = 'C (Cukup)';

    return { finalScore, nGainScore, nGainCategory, status, qualitativeGrade };
  };

  const handleSaveSessionForm = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === sessProductId);
    if (!product) {
      alert('Pilih produk / modul training yang valid.');
      return;
    }

    if (sessType === 'Internal' && !sessParticipantId) {
      alert('Pilih peserta training internal.');
      return;
    }

    const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dObj = new Date(sessDate);
    const dayName = isNaN(dObj.getTime()) ? 'Senin' : indonesianDays[dObj.getDay()];

    const kkmVal = product.defaultKKM || settings.defaultKKM;
    const computed = calculateMetrics(
      Number(sessTeori),
      Number(sessPraktek),
      Number(sessRolePlay),
      Number(sessPreTest),
      Number(sessPostTest),
      kkmVal
    );

    const saved: TrainingSession = {
      id: sessId,
      participantId: sessType === 'Internal' ? sessParticipantId : '',
      productId: sessProductId,
      productCategory: product.category,
      trainingType: sessType,
      companyName: sessType === 'Eksternal' ? sessCompanyName : undefined,
      trainingTitle: sessTitle.trim() || `Training ${product.name}`,
      guestEmails: sessGuestEmails.trim() || undefined,
      targetAudience: product.targetAudience || 'Sales Specialist',
      date: sessDate,
      day: dayName,
      startTime: sessStartTime,
      endTime: sessEndTime,
      trainerName: sessTrainer || 'Asesor Utama',
      preTestScore: Number(sessPreTest),
      postTestScore: Number(sessPostTest),
      teoriScore: Number(sessTeori),
      praktekScore: Number(sessPraktek),
      rolePlayScore: Number(sessRolePlay),
      appliedWeights: {
        teoriWeight: settings.weights.teoriWeight,
        praktekWeight: settings.weights.praktekWeight,
        rolePlayWeight: settings.weights.rolePlayWeight,
      },
      finalScore: computed.finalScore,
      nGainScore: computed.nGainScore,
      nGainCategory: computed.nGainCategory,
      kkmThreshold: kkmVal,
      status: computed.status,
      qualitativeGrade: computed.qualitativeGrade,
      teoriNotes: sessTeoriNotes || undefined,
      praktekNotes: sessPraktekNotes || undefined,
      rolePlayNotes: sessRolePlayNotes || undefined,
      evaluatorFeedback: sessFeedback || undefined,
      createdAt: editingSession ? editingSession.createdAt : new Date().toISOString(),
    };

    setSessions((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      if (exists) return prev.map((s) => (s.id === saved.id ? saved : s));
      return [saved, ...prev];
    });
    setSessionFormOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    if (!isAdmin) {
      onRequireAdmin('Akses Admin diperlukan untuk menghapus sesi assessment.');
      return;
    }
    if (confirm('Hapus hasil assessment ini?')) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSavePlanForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) {
      alert('Judul program wajib diisi.');
      return;
    }
    const saved: TrainingPlan = {
      id: planId,
      title: planTitle,
      productId: planProductId,
      type: planType,
      startDate: planStartDate,
      endDate: planEndDate,
      trainer: planTrainer,
      targetAudience: planAudience,
      quota: Number(planQuota),
      registeredCount: Number(planRegistered),
      status: planStatus,
      description: planDesc,
      createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString(),
    };
    setTrainingPlans((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
      return [saved, ...prev];
    });
    setPlanFormOpen(false);
  };

  const handleDeletePlan = (id: string) => {
    if (!isAdmin) {
      onRequireAdmin('Akses Admin diperlukan untuk menghapus rencana training.');
      return;
    }
    if (confirm('Hapus rencana program pelatihan ini?')) {
      setTrainingPlans((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Approve / Decline Training Requests
  const handleProcessRequest = (req: TrainingRequest, newStatus: 'Disetujui' | 'Ditolak') => {
    if (!isAdmin) {
      onRequireAdmin('Akses Admin diperlukan untuk merespon permintaan training.');
      return;
    }
    setEditingRequest(req);
    setRequestAdminNotes(req.adminNotes || '');
  };

  const handleSaveRequestReview = (e: React.FormEvent, finalStatus: 'Disetujui' | 'Ditolak') => {
    e.preventDefault();
    if (!editingRequest) return;
    setTrainingRequests((prev) =>
      prev.map((r) =>
        r.id === editingRequest.id
          ? { ...r, status: finalStatus, adminNotes: requestAdminNotes.trim() || undefined }
          : r
      )
    );
    setEditingRequest(null);
    setRequestAdminNotes('');
  };

  // -------------------------------------------------------------
  // GENERAL SETTINGS SUBMISSIONS
  // -------------------------------------------------------------
  const totalWeight = Number(teoriWeight) + Number(praktekWeight) + Number(rolePlayWeight);
  const isWeightValid = totalWeight === 100;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onRequireAdmin('Akses Admin diperlukan untuk menyimpan perubahan pengaturan.');
      return;
    }

    if (!isWeightValid) {
      alert('Total bobot penilaian harus tepat 100%. Saat ini: ' + totalWeight + '%');
      return;
    }

    const updated: AppSettings = {
      companyName,
      trainingCenterName,
      defaultKKM: Number(defaultKKM),
      weights: {
        teoriWeight: Number(teoriWeight),
        praktekWeight: Number(praktekWeight),
        rolePlayWeight: Number(rolePlayWeight),
      },
      trainers,
      adminPin: adminPin.trim() || 'VSI7789',
    };

    onUpdateSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddTrainer = () => {
    if (!isAdmin) {
      onRequireAdmin('Akses Admin diperlukan untuk menambah trainer baru.');
      return;
    }
    if (!newTrainer.trim()) return;
    setTrainers([...trainers, newTrainer.trim()]);
    setNewTrainer('');
  };

  const handleRemoveTrainer = (idx: number) => {
    if (!isAdmin) {
      onRequireAdmin('Akses Admin diperlukan untuk menghapus trainer.');
      return;
    }
    setTrainers(trainers.filter((_, i) => i !== idx));
  };

  const handleExportJSON = () => {
    const backupData = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      participants,
      products,
      sessions,
      trainingPlans,
      trainingRequests,
      settings,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SkillMetric_Central_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // -------------------------------------------------------------
  // FILTERS FOR THE TABLES
  // -------------------------------------------------------------
  const filteredParticipants = participants.filter((p) => {
    const q = searchParticipant.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.nip.toLowerCase().includes(q) || p.department.toLowerCase().includes(q);
  });

  const filteredProducts = products.filter((p) => {
    const q = searchProduct.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  const filteredSessions = sessions.filter((s) => {
    const q = searchSession.toLowerCase();
    const participantName = participants.find((p) => p.id === s.participantId)?.name || 'Eksternal/Tamu';
    const productName = products.find((p) => p.id === s.productId)?.name || 'Produk dihapus';
    return (
      participantName.toLowerCase().includes(q) ||
      productName.toLowerCase().includes(q) ||
      (s.trainingTitle || '').toLowerCase().includes(q) ||
      s.trainerName.toLowerCase().includes(q)
    );
  });

  const filteredPlans = trainingPlans.filter((p) => {
    const q = searchPlan.toLowerCase();
    const productName = products.find((pr) => pr.id === p.productId)?.name || 'Produk dihapus';
    return p.title.toLowerCase().includes(q) || productName.toLowerCase().includes(q) || p.trainer.toLowerCase().includes(q);
  });

  const filteredRequests = trainingRequests.filter((r) => {
    const q = searchRequest.toLowerCase();
    const participantName = participants.find((p) => p.id === r.participantId)?.name || 'Peserta dihapus';
    const productName = products.find((p) => p.id === r.productId)?.name || 'Produk dihapus';
    return participantName.toLowerCase().includes(q) || productName.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Pusat Kontrol &amp; Manajemen Admin</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola bobot KKM, parameter sistem, backup database, serta seluruh tabel relasi data SkillMetric secara dinamis dan terpusat.
          </p>
        </div>
        
        {savedSuccess && (
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold flex items-center gap-1.5 self-start">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Sistem Ter-sinkronisasi!</span>
          </div>
        )}
      </div>

      {/* Admin Mode Visual Banner */}
      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <Lock className="w-4 h-4 shrink-0" />
            </div>
            <div>
              <p className="font-bold text-amber-900">Akses Terbatas — Mode View-Only</p>
              <p className="text-slate-500 mt-0.5">Untuk mengedit, menghapus, atau mendaftarkan database baru, silakan aktifkan mode admin.</p>
            </div>
          </div>
          <button
            onClick={() => onRequireAdmin('Masuk Mode Admin untuk mengaktifkan seluruh panel kontrol database.')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>🔓 Login Admin / Asesor</span>
          </button>
        </div>
      )}

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* SIDE BAR NAVIGATION */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-2">
            Kelola Menu &amp; Database
          </p>
          
          <button
            onClick={() => setActiveAdminTab('general')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeAdminTab === 'general'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 shrink-0" />
              <span>⚙️ Konfigurasi &amp; Bobot</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </button>

          <button
            onClick={() => setActiveAdminTab('participants')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeAdminTab === 'participants'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 shrink-0" />
              <span>👥 Database Karyawan</span>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
              {participants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('products')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeAdminTab === 'products'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Boxes className="w-4 h-4 shrink-0" />
              <span>📦 Katalog Produk</span>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('sessions')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeAdminTab === 'sessions'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 shrink-0" />
              <span>📊 Sesi Assessment</span>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
              {sessions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('plans')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeAdminTab === 'plans'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>📅 Rencana Training</span>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
              {trainingPlans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('requests')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeAdminTab === 'requests'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 shrink-0" />
              <span>📥 Permintaan Training</span>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
              {trainingRequests.length}
            </span>
          </button>
        </div>

        {/* MAIN DISPLAY VIEW */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 1. CONFIGURATION VIEW */}
          {activeAdminTab === 'general' && (
            <div className="space-y-6">
              
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Weights Block */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      1. Konfigurasi Bobot Penilaian Assessment (Total 100%)
                    </h3>
                  </div>

                  {!isWeightValid && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        Peringatan: Total bobot saat ini adalah <strong>{totalWeight}%</strong>. Total harus tepat 100%.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>📖 Ujian Teori</span>
                        <span className="text-blue-600 text-sm font-black">{teoriWeight}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={teoriWeight}
                        onChange={(e) => setTeoriWeight(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>🛠️ Tugas Praktek</span>
                        <span className="text-blue-600 text-sm font-black">{praktekWeight}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={praktekWeight}
                        onChange={(e) => setPraktekWeight(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>🎭 Role-Play</span>
                        <span className="text-blue-600 text-sm font-black">{rolePlayWeight}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={rolePlayWeight}
                        onChange={(e) => setRolePlayWeight(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Identity and KKM */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Building className="w-4 h-4 text-blue-600" />
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      2. KKM Standar &amp; Identitas Instansi
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        KKM / Passing Grade Default
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={defaultKKM}
                        onChange={(e) => setDefaultKKM(Number(e.target.value))}
                        className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Perusahaan / Instansi</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Training Center / Akademi</label>
                      <input
                        type="text"
                        value={trainingCenterName}
                        onChange={(e) => setTrainingCenterName(e.target.value)}
                        className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>

                    {isAdmin && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Kode PIN Admin / Asesor</label>
                        <input
                          type="text"
                          value={adminPin}
                          onChange={(e) => setAdminPin(e.target.value)}
                          placeholder="Contoh: VSI7789"
                          className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Trainers */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h3 className="font-extrabold text-slate-900 text-sm">3. Daftar Trainer &amp; Instruktur Penguji</h3>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Tambah nama trainer baru..."
                        value={newTrainer}
                        onChange={(e) => setNewTrainer(e.target.value)}
                        className="flex-1 py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddTrainer}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pt-1">
                    {trainers.map((tr, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                        <span className="font-semibold text-slate-700">{tr}</span>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTrainer(idx)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit button bar */}
                {isAdmin && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!isWeightValid}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Seluruh Pengaturan Sistem</span>
                    </button>
                  </div>
                )}
              </form>

              {/* Excel / JSON operations */}
              {isAdmin && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">
                    4. Utilitas Data Backup &amp; Masal Impor
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          <span>Ekspor Laporan Excel</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Unduh spreadsheet rekap nilai.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsExportModalOpen(true)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Buka Menu Ekspor
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                          <Download className="w-4 h-4 text-blue-600" />
                          <span>JSON Backup</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Ekspor seluruh data ke file JSON.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportJSON}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Unduh JSON Backup
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                          <Upload className="w-4 h-4 text-indigo-600" />
                          <span>Impor Masal Excel</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Upload excel peserta / produk.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImportExcelType('participants');
                          setIsImportExcelOpen(true);
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Unggah Excel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              {isAdmin && (
                <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-red-800 text-sm border-b border-red-100 pb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>5. Zona Bahaya (Danger Zone)</span>
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-xs text-slate-800">Kosongkan Seluruh Database</p>
                      <p className="text-[11px] text-slate-500">Menghapus semua data Peserta, Katalog Produk, dan Sesi Assessment untuk memulai dari nol.</p>
                    </div>
                    <button
                      type="button"
                      onClick={onClearAllData}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Kosongkan Database
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. PARTICIPANTS VIEW */}
          {activeAdminTab === 'participants' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Manajemen Database Karyawan / Peserta</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenParticipantForm(null)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tambah Karyawan</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative text-xs">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari karyawan berdasarkan Nama, NIP, atau Divisi..."
                  value={searchParticipant}
                  onChange={(e) => setSearchParticipant(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">NIP / ID</th>
                      <th className="p-3">Nama</th>
                      <th className="p-3">Divisi / Departemen</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                          Tidak ditemukan data karyawan.
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-800">{p.nip}</td>
                          <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                          <td className="p-3 text-slate-600">{p.department}</td>
                          <td className="p-3 text-slate-500">{p.email}</td>
                          <td className="p-3 flex items-center gap-2">
                            <button
                              onClick={() => handleOpenParticipantForm(p)}
                              className="p-1.5 bg-slate-100 text-slate-700 rounded hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(p.id)}
                              className="p-1.5 bg-slate-100 text-slate-400 rounded hover:bg-red-100 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. PRODUCTS VIEW */}
          {activeAdminTab === 'products' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Manajemen Database Katalog Modul Pelatihan</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenProductForm(null)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tambah Modul</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative text-xs">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari modul berdasarkan Nama, Kode, atau Kategori..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Kode</th>
                      <th className="p-3">Nama Modul</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Tipe Training</th>
                      <th className="p-3">KKM</th>
                      <th className="p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                          Tidak ditemukan data modul training.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-800">{p.code}</td>
                          <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                          <td className="p-3 text-slate-600">{p.category}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              (p.trainingType || 'Internal') === 'Internal'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {p.trainingType || 'Internal'}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-blue-600">{p.defaultKKM || settings.defaultKKM}</td>
                          <td className="p-3 flex items-center gap-2">
                            <button
                              onClick={() => handleOpenProductForm(p)}
                              className="p-1.5 bg-slate-100 text-slate-700 rounded hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 bg-slate-100 text-slate-400 rounded hover:bg-red-100 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. SESSIONS VIEW */}
          {activeAdminTab === 'sessions' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Manajemen Database Hasil Sesi Assessment</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenSessionForm(null)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Input Hasil Baru</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative text-xs">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari hasil assessment berdasarkan judul, karyawan, atau trainer..."
                  value={searchSession}
                  onChange={(e) => setSearchSession(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Karyawan / Peserta</th>
                      <th className="p-3">Judul Training</th>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Nilai Akhir</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                          Tidak ditemukan riwayat sesi assessment.
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((s) => {
                        const participant = participants.find((p) => p.id === s.participantId);
                        const product = products.find((pr) => pr.id === s.productId);
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{participant?.name || 'Eksternal / Tamu'}</p>
                              {participant && <p className="text-[10px] text-slate-500">{participant.nip} • {participant.department}</p>}
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-slate-800">{s.trainingTitle || product?.name || 'Produk dihapus'}</p>
                              <p className="text-[10px] text-slate-400">Trainer: {s.trainerName}</p>
                            </td>
                            <td className="p-3 whitespace-nowrap text-slate-600">{s.date}</td>
                            <td className="p-3 font-black text-sm text-blue-700">{s.finalScore}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                s.status === 'Kompeten'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="p-3 flex items-center gap-2">
                              <button
                                onClick={() => handleOpenSessionForm(s)}
                                className="p-1.5 bg-slate-100 text-slate-700 rounded hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSession(s.id)}
                                className="p-1.5 bg-slate-100 text-slate-400 rounded hover:bg-red-100 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. TRAINING PLANS VIEW */}
          {activeAdminTab === 'plans' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Manajemen Database Rencana Program Pelatihan</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenPlanForm(null)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Buat Rencana Pelatihan</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative text-xs">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari program training yang direncanakan..."
                  value={searchPlan}
                  onChange={(e) => setSearchPlan(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Program / Judul</th>
                      <th className="p-3">Modul</th>
                      <th className="p-3">Tipe</th>
                      <th className="p-3">Periode</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Quota</th>
                      <th className="p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPlans.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                          Tidak ditemukan rencana pelatihan.
                        </td>
                      </tr>
                    ) : (
                      filteredPlans.map((p) => {
                        const product = products.find((pr) => pr.id === p.productId);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{p.title}</td>
                            <td className="p-3 text-slate-700">{product?.name || 'Produk dihapus'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                p.type === 'Internal' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {p.type}
                              </span>
                            </td>
                            <td className="p-3 whitespace-nowrap text-slate-500 font-medium">
                              {p.startDate} s/d {p.endDate}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                p.status === 'Berjalan'
                                  ? 'bg-amber-100 text-amber-800'
                                  : p.status === 'Selesai'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'Dibatalkan'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-600">{p.registeredCount} / {p.quota}</td>
                            <td className="p-3 flex items-center gap-2">
                              <button
                                onClick={() => handleOpenPlanForm(p)}
                                className="p-1.5 bg-slate-100 text-slate-700 rounded hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePlan(p.id)}
                                className="p-1.5 bg-slate-100 text-slate-400 rounded hover:bg-red-100 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. TRAINING REQUESTS VIEW */}
          {activeAdminTab === 'requests' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Persetujuan Permintaan Pelatihan Mandiri</h3>
              </div>

              {/* Search Bar */}
              <div className="relative text-xs">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari request berdasarkan karyawan atau produk..."
                  value={searchRequest}
                  onChange={(e) => setSearchRequest(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Karyawan / Pemohon</th>
                      <th className="p-3">Produk / Modul</th>
                      <th className="p-3">Tanggal Pengajuan</th>
                      <th className="p-3">Alasan</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                          Tidak ditemukan pengajuan permintaan training.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((r) => {
                        const participant = participants.find((p) => p.id === r.participantId);
                        const product = products.find((pr) => pr.id === r.productId);
                        return (
                          <tr key={r.id} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{participant?.name || 'Peserta dihapus'}</p>
                              {participant && <p className="text-[10px] text-slate-500">{participant.nip} • {participant.department}</p>}
                            </td>
                            <td className="p-3 font-semibold text-slate-800">{product?.name || 'Produk dihapus'}</td>
                            <td className="p-3 whitespace-nowrap text-slate-500">{r.requestedDate}</td>
                            <td className="p-3 text-slate-600 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                r.status === 'Disetujui'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.status === 'Ditolak'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {r.status}
                              </span>
                              {r.adminNotes && <p className="text-[10px] text-slate-400 italic mt-0.5">Catatan: {r.adminNotes}</p>}
                            </td>
                            <td className="p-3 text-right">
                              {r.status === 'Pending' ? (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleProcessRequest(r, 'Disetujui')}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    Setujui
                                  </button>
                                  <button
                                    onClick={() => handleProcessRequest(r, 'Ditolak')}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    Tolak
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleProcessRequest(r, r.status)}
                                  className="text-[10px] text-blue-600 hover:underline font-bold"
                                >
                                  Edit Catatan
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* -------------------------------------------------------------
          MODALS / INLINE PANEL FORM OVERLAYS FOR CENTRAL CONTROL
          ------------------------------------------------------------- */}

      {/* A. PARTICIPANT MODAL */}
      {participantFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden my-auto">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-xs flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{editingParticipant ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}</span>
              </h3>
              <button onClick={() => setParticipantFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveParticipantForm} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIP Karyawan *</label>
                  <input
                    type="text"
                    value={pNip}
                    onChange={(e) => setPNip(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Divisi / Departemen</label>
                  <select
                    value={pDepartment}
                    onChange={(e) => setPDepartment(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    <optgroup label="Divisi Internal">
                      {DEPARTMENT_OPTIONS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Segmen Eksternal">
                      <option value="Calon Customer (Pitching)">Calon Customer (Pitching)</option>
                      <option value="Calon Customer (Demonstration)">Calon Customer (Demonstration)</option>
                      <option value="Customer (Training)">Customer (Training)</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan / Peran</label>
                  <input
                    type="text"
                    value={pRole}
                    onChange={(e) => setPRole(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={pEmail}
                    onChange={(e) => setPEmail(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                    placeholder="nama@company.com"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                    placeholder="0812xxxx"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setParticipantFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold cursor-pointer hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-black hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. PRODUCT MODAL */}
      {productFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden my-auto">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-xs flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-blue-400" />
                <span>{editingProduct ? 'Edit Katalog Modul' : 'Tambah Modul Training Baru'}</span>
              </h3>
              <button onClick={() => setProductFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveProductForm} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Modul *</label>
                  <input
                    type="text"
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Modul Pelatihan *</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Produk</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as 'Software' | 'Hardware')}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Sasaran</label>
                  <select
                    value={prodType}
                    onChange={(e) => setProdType(e.target.value as 'Internal' | 'Eksternal')}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="Internal">Internal (Karyawan)</option>
                    <option value="Eksternal">Eksternal (Pitching/Client)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Audiens</label>
                  <input
                    type="text"
                    value={prodAudience}
                    onChange={(e) => setProdAudience(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                    placeholder="Contoh: Sales Specialist, Teknisi"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passing Grade (KKM)</label>
                  <input
                    type="number"
                    value={prodKKM}
                    onChange={(e) => setProdKKM(Number(e.target.value))}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Syarat Kompetensi <span className="text-slate-400 font-normal">(Pisahkan dengan koma)</span></label>
                <input
                  type="text"
                  value={prodRequirements}
                  onChange={(e) => setProdRequirements(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                  placeholder="Contoh: Basic Networking, Pemahaman CRM"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat Modul</label>
                <textarea
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  rows={2}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold cursor-pointer hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-black hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Simpan Modul
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. ASSESSMENT SESSION MODAL */}
      {sessionFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl border border-slate-200 overflow-hidden my-auto">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-xs flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-400" />
                <span>{editingSession ? 'Edit Sesi Assessment' : 'Input Hasil Assessment Baru'}</span>
              </h3>
              <button onClick={() => setSessionFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveSessionForm} className="p-4 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Sesi</label>
                  <select
                    value={sessType}
                    onChange={(e) => setSessType(e.target.value as 'Internal' | 'Eksternal')}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none font-bold"
                  >
                    <option value="Internal">Internal (Karyawan)</option>
                    <option value="Eksternal">Eksternal (Pitching / Client)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama / Judul Pelatihan</label>
                  <input
                    type="text"
                    value={sessTitle}
                    onChange={(e) => setSessTitle(e.target.value)}
                    placeholder="Contoh: Training Sertifikasi Kompetensi"
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {sessType === 'Internal' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pilih Karyawan / Peserta *</label>
                    <select
                      value={sessParticipantId}
                      onChange={(e) => setSessParticipantId(e.target.value)}
                      className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                      required
                    >
                      <option value="">-- Pilih Karyawan --</option>
                      {participants.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.nip})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Perusahaan / Klien *</label>
                    <input
                      type="text"
                      value={sessCompanyName}
                      onChange={(e) => setSessCompanyName(e.target.value)}
                      placeholder="Contoh: PT ABC Indonesia"
                      className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                      required={sessType === 'Eksternal'}
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Modul Pelatihan *</label>
                  <select
                    value={sessProductId}
                    onChange={(e) => setSessProductId(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none font-semibold"
                    required
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Tamu (Optional)</label>
                  <input
                    type="text"
                    value={sessGuestEmails}
                    onChange={(e) => setSessGuestEmails(e.target.value)}
                    placeholder="budi@gmail.com, rani@partner.com"
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trainer Penguji *</label>
                  <select
                    value={sessTrainer}
                    onChange={(e) => setSessTrainer(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    {trainers.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={sessDate}
                    onChange={(e) => setSessDate(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mulai *</label>
                  <input
                    type="time"
                    value={sessStartTime}
                    onChange={(e) => setSessStartTime(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selesai *</label>
                  <input
                    type="time"
                    value={sessEndTime}
                    onChange={(e) => setSessEndTime(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block font-bold text-blue-900 mb-1">Pre-Test (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={sessPreTest}
                    onChange={(e) => setSessPreTest(Number(e.target.value))}
                    className="w-full py-1.5 px-2 bg-white border border-blue-200 rounded outline-none font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blue-900 mb-1">Post-Test (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={sessPostTest}
                    onChange={(e) => setSessPostTest(Number(e.target.value))}
                    className="w-full py-1.5 px-2 bg-white border border-blue-200 rounded outline-none font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blue-900 mb-1">Ujian Teori</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={sessTeori}
                    onChange={(e) => setSessTeori(Number(e.target.value))}
                    className="w-full py-1.5 px-2 bg-white border border-blue-200 rounded outline-none font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blue-900 mb-1">Tugas Praktek</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={sessPraktek}
                    onChange={(e) => setSessPraktek(Number(e.target.value))}
                    className="w-full py-1.5 px-2 bg-white border border-blue-200 rounded outline-none font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blue-900 mb-1">Role-Play</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={sessRolePlay}
                    onChange={(e) => setSessRolePlay(Number(e.target.value))}
                    className="w-full py-1.5 px-2 bg-white border border-blue-200 rounded outline-none font-bold text-center col-span-2 md:col-span-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catatan Ujian Teori</label>
                  <input
                    type="text"
                    value={sessTeoriNotes}
                    onChange={(e) => setSessTeoriNotes(e.target.value)}
                    placeholder="Contoh: Pemahaman modul baik"
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catatan Tugas Praktek</label>
                  <input
                    type="text"
                    value={sessPraktekNotes}
                    onChange={(e) => setSessPraktekNotes(e.target.value)}
                    placeholder="Contoh: Sangat cekatan & presisi"
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catatan Role-Play</label>
                  <input
                    type="text"
                    value={sessRolePlayNotes}
                    onChange={(e) => setSessRolePlayNotes(e.target.value)}
                    placeholder="Contoh: Komunikasi meyakinkan"
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Umpan Balik / Evaluasi Evaluator Utama</label>
                <textarea
                  value={sessFeedback}
                  onChange={(e) => setSessFeedback(e.target.value)}
                  rows={2}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none resize-none"
                  placeholder="Rekomendasi pengembangan kompetensi lanjutan..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSessionFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold cursor-pointer hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-black hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Simpan Sesi Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. TRAINING PLAN MODAL */}
      {planFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden my-auto">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-xs flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>{editingPlan ? 'Edit Rencana Training' : 'Buat Program Training Baru'}</span>
              </h3>
              <button onClick={() => setPlanFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSavePlanForm} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama / Judul Program *</label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="Contoh: Boot camp Sales Hardware Expert"
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none font-bold text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modul Terkait *</label>
                  <select
                    value={planProductId}
                    onChange={(e) => setPlanProductId(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                    required
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Sasaran</label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value as 'Internal' | 'Eksternal')}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none font-bold"
                  >
                    <option value="Internal">Internal (Karyawan)</option>
                    <option value="Eksternal">Eksternal (Klien / Umum)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    value={planStartDate}
                    onChange={(e) => setPlanStartDate(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Selesai *</label>
                  <input
                    type="date"
                    value={planEndDate}
                    onChange={(e) => setPlanEndDate(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trainer Utama</label>
                  <select
                    value={planTrainer}
                    onChange={(e) => setPlanTrainer(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    {trainers.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Peserta</label>
                  <input
                    type="text"
                    value={planAudience}
                    onChange={(e) => setPlanAudience(e.target.value)}
                    placeholder="Contoh: Sales Hardware"
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kuota Maksimal</label>
                  <input
                    type="number"
                    value={planQuota}
                    onChange={(e) => setPlanQuota(Number(e.target.value))}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Terdaftar (Registered)</label>
                  <input
                    type="number"
                    value={planRegistered}
                    onChange={(e) => setPlanRegistered(Number(e.target.value))}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Rencana</label>
                  <select
                    value={planStatus}
                    onChange={(e) => setPlanStatus(e.target.value as any)}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none font-bold"
                  >
                    <option value="Direncanakan">Direncanakan</option>
                    <option value="Berjalan">Berjalan</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi &amp; Silabus Program</label>
                <textarea
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  rows={2}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPlanFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold cursor-pointer hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-black hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Simpan Rencana Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* E. REQUEST APPROVAL CATATAN MODAL */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden my-auto">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-xs">Tinjau Permintaan Training</h3>
              <button onClick={() => setEditingRequest(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={(e) => handleSaveRequestReview(e, editingRequest.status)} className="p-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                <p><strong>Pemohon:</strong> {participants.find(p => p.id === editingRequest.participantId)?.name}</p>
                <p className="mt-1"><strong>Modul:</strong> {products.find(p => p.id === editingRequest.productId)?.name}</p>
                <p className="mt-1"><strong>Alasan:</strong> &ldquo;{editingRequest.reason}&rdquo;</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Keterangan Admin</label>
                <textarea
                  value={requestAdminNotes}
                  onChange={(e) => setRequestAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg outline-none resize-none"
                  placeholder="Contoh: Disetujui untuk gelombang kedua / Kuota penuh."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold cursor-pointer hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  onClick={(e) => handleSaveRequestReview(e, 'Disetujui')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold cursor-pointer hover:bg-emerald-700"
                >
                  Simpan &amp; Setujui
                </button>
                <button
                  type="submit"
                  onClick={(e) => handleSaveRequestReview(e, 'Ditolak')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold cursor-pointer hover:bg-red-700"
                >
                  Simpan &amp; Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export & Import Modals */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        sessions={sessions}
        participants={participants}
        products={products}
        trainers={settings.trainers}
      />

      <ImportExcelModal
        isOpen={isImportExcelOpen}
        onClose={() => setIsImportExcelOpen(false)}
        defaultType={importExcelType}
        participants={participants}
        products={products}
        sessions={sessions}
        settings={settings}
        onImportParticipants={onImportParticipants}
        onImportProducts={onImportProducts}
        onImportSessions={onImportSessions}
      />

    </div>
  );
};
