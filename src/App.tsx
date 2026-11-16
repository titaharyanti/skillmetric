import React, { useState, useEffect } from 'react';
import {
  AppSettings,
  Participant,
  TrainingProduct,
  TrainingSession,
  TrainingPlan,
  TrainingRequest,
} from './types';
import {
  INITIAL_PARTICIPANTS,
  INITIAL_PRODUCTS,
  INITIAL_SESSIONS,
  INITIAL_SETTINGS,
  INITIAL_PLANS,
  INITIAL_REQUESTS,
} from './data/initialData';
import { Header, NavTab } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { DashboardView } from './components/DashboardView';
import { ParticipantProgressView } from './components/ParticipantProgressView';
import { ParticipantListView } from './components/ParticipantListView';
import { ProductCatalogView } from './components/ProductCatalogView';
import { SettingsView } from './components/SettingsView';
import { NewAssessmentModal } from './components/NewAssessmentModal';
import { ReportModal } from './components/ReportModal';
import { ParticipantModal } from './components/ParticipantModal';
import { ProductModal } from './components/ProductModal';
import { AdminAuthModal } from './components/AdminAuthModal';

export default function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('calendar');

  // Admin Mode Access Control (Default: false = View Only for Participants)
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [adminAuthMessage, setAdminAuthMessage] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Application Data States initialized with LocalStorage or Initial Constants (Fresh Empty Slate)
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const isFresh = localStorage.getItem('skillmetric_fresh_slate_v6') === 'true';
      if (!isFresh) {
        localStorage.removeItem('sipenkom_participants_v4');
        localStorage.removeItem('sipenkom_products_v4');
        localStorage.removeItem('sipenkom_sessions_v4');
        localStorage.removeItem('sipenkom_participants_v2');
        localStorage.removeItem('sipenkom_products_v2');
        localStorage.removeItem('sipenkom_sessions_v2');
        localStorage.setItem('skillmetric_fresh_slate_v6', 'true');
        return INITIAL_PARTICIPANTS;
      }
      const saved = localStorage.getItem('sipenkom_participants_v4');
      return saved ? JSON.parse(saved) : INITIAL_PARTICIPANTS;
    } catch {
      return INITIAL_PARTICIPANTS;
    }
  });

  const [products, setProducts] = useState<TrainingProduct[]>(() => {
    try {
      const isFresh = localStorage.getItem('skillmetric_fresh_slate_v6') === 'true';
      if (!isFresh) {
        return INITIAL_PRODUCTS;
      }
      const saved = localStorage.getItem('sipenkom_products_v4');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [sessions, setSessions] = useState<TrainingSession[]>(() => {
    try {
      const isFresh = localStorage.getItem('skillmetric_fresh_slate_v6') === 'true';
      if (!isFresh) {
        return INITIAL_SESSIONS;
      }
      const saved = localStorage.getItem('sipenkom_sessions_v4');
      return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>(() => {
    try {
      const saved = localStorage.getItem('sipenkom_training_plans_v4');
      return saved ? JSON.parse(saved) : INITIAL_PLANS;
    } catch {
      return INITIAL_PLANS;
    }
  });

  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>(() => {
    try {
      const saved = localStorage.getItem('sipenkom_training_requests_v4');
      return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
    } catch {
      return INITIAL_REQUESTS;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('sipenkom_settings_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        const officialTrainers = INITIAL_SETTINGS.trainers;
        parsed.trainers = Array.from(new Set([...officialTrainers, ...(parsed.trainers || [])]));
        if (!parsed.adminPin || parsed.adminPin === '1234') {
          parsed.adminPin = 'VSI7789';
        }
        return parsed;
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Modal States
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [preSelectedParticipantId, setPreSelectedParticipantId] = useState<string | undefined>(undefined);

  const [selectedReportSession, setSelectedReportSession] = useState<TrainingSession | null>(null);

  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<TrainingProduct | null>(null);

  // Sync to LocalStorage on state change
  useEffect(() => {
    localStorage.setItem('sipenkom_participants_v4', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('sipenkom_products_v4', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sipenkom_sessions_v4', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('sipenkom_training_plans_v4', JSON.stringify(trainingPlans));
  }, [trainingPlans]);

  useEffect(() => {
    localStorage.setItem('sipenkom_training_requests_v4', JSON.stringify(trainingRequests));
  }, [trainingRequests]);

  useEffect(() => {
    localStorage.setItem('sipenkom_settings_v4', JSON.stringify(settings));
  }, [settings]);

  // Guard Dashboard Eksternal: menu dan tampilan hanya diperbolehkan untuk Mode Admin
  useEffect(() => {
    if (!isAdmin && activeTab === 'dashboardEksternal') {
      setActiveTab('dashboardInternal');
    }
  }, [isAdmin, activeTab]);

  // Global Metrics
  const totalParticipants = participants.length;
  const totalSessions = sessions.length;
  const competentSessionsCount = sessions.filter((s) => s.status === 'Kompeten').length;
  const passRate = totalSessions > 0 ? Math.round((competentSessionsCount / totalSessions) * 100) : 0;
  const avgFinalScore =
    totalSessions > 0
      ? Math.round((sessions.reduce((acc, s) => acc + s.finalScore, 0) / totalSessions) * 10) / 10
      : 0;

  // Handler to request Admin Authentication
  const handleRequireAdmin = (msg?: string, action?: () => void) => {
    setAdminAuthMessage(msg || 'Akses Admin diperlukan untuk melakukan tindakan ini.');
    setPendingAction(() => action || null);
    setIsAdminAuthModalOpen(true);
  };

  const handleAdminAuthSuccess = () => {
    setIsAdmin(true);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Handlers for Sessions
  const handleSaveNewSession = (newSession: TrainingSession) => {
    setSessions((prev) => [newSession, ...prev]);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan sesi training ini?')) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  const handleOpenNewSessionForParticipant = (participantId: string) => {
    if (!isAdmin) {
      handleRequireAdmin('Akses Admin diperlukan untuk mendaftarkan sesi training baru.', () => {
        setPreSelectedParticipantId(participantId);
        setIsNewAssessmentOpen(true);
      });
      return;
    }
    setPreSelectedParticipantId(participantId);
    setIsNewAssessmentOpen(true);
  };

  // Handlers for Participants
  const handleSaveParticipant = (participant: Participant) => {
    setParticipants((prev) => {
      const exists = prev.some((p) => p.id === participant.id);
      if (exists) {
        return prev.map((p) => (p.id === participant.id ? participant : p));
      }
      return [participant, ...prev];
    });
  };

  const handleImportParticipants = (newParticipants: Participant[]) => {
    setParticipants((prev) => {
      const existingMap = new Map(prev.map((p) => [p.nip.toLowerCase(), p]));
      newParticipants.forEach((p) => {
        existingMap.set(p.nip.toLowerCase(), p);
      });
      return Array.from(existingMap.values());
    });
  };

  const handleDeleteParticipant = (participantId: string) => {
    if (confirm('Hapus data peserta ini beserta seluruh riwayat training?')) {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      setSessions((prev) => prev.filter((s) => s.participantId !== participantId));
    }
  };

  // Handlers for Products
  const handleSaveProduct = (product: TrainingProduct) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
  };

  const handleImportProducts = (newProducts: TrainingProduct[]) => {
    setProducts((prev) => {
      const existingMap = new Map(prev.map((pr) => [pr.code.toLowerCase(), pr]));
      newProducts.forEach((pr) => {
        existingMap.set(pr.code.toLowerCase(), pr);
      });
      return Array.from(existingMap.values());
    });
  };

  const handleImportSessions = (newSessions: TrainingSession[]) => {
    setSessions((prev) => [...newSessions, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk training ini?')) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  // Handler to Clear All Data
  const handleClearAllData = () => {
    if (!isAdmin) {
      handleRequireAdmin('Akses Admin diperlukan untuk mengosongkan seluruh data.', () => {
        handleClearAllData();
      });
      return;
    }
    if (
      confirm(
        '⚠️ PERINGATAN: Apakah Anda yakin ingin MENGOSONGKAN SELURUH DATABASE?\n\nSemua data Peserta, Katalog Modul Produk, dan Hasil Assessment akan dihapus bersih sehingga platform menjadi wadah kosong yang fresh.'
      )
    ) {
      setParticipants([]);
      setProducts([]);
      setSessions([]);
      localStorage.setItem('sipenkom_participants_v4', JSON.stringify([]));
      localStorage.setItem('sipenkom_products_v4', JSON.stringify([]));
      localStorage.setItem('sipenkom_sessions_v4', JSON.stringify([]));
      localStorage.removeItem('sipenkom_participants_v2');
      localStorage.removeItem('sipenkom_products_v2');
      localStorage.removeItem('sipenkom_sessions_v2');
      localStorage.removeItem('sipenkom_settings_v3');
      alert('✅ Seluruh data berhasil dikosongkan! Platform SkillMetric siap digunakan untuk menginput data real.');
    }
  };

  // Handler for JSON Import Restore
  const handleImportJSON = (data: {
    participants: Participant[];
    products: TrainingProduct[];
    sessions: TrainingSession[];
    settings: AppSettings;
  }) => {
    if (!isAdmin) {
      handleRequireAdmin('Akses Admin diperlukan untuk memulihkan database JSON.');
      return;
    }
    if (data.participants) setParticipants(data.participants);
    if (data.products) setProducts(data.products);
    if (data.sessions) setSessions(data.sessions);
    if (data.settings) setSettings(data.settings);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased">
      {/* App Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => handleRequireAdmin('Masuk Mode Penguji / Admin untuk mengaktifkan akses CRUD.')}
        onLogoutAdmin={() => setIsAdmin(false)}
        onOpenNewAssessment={() => {
          if (!isAdmin) {
            handleRequireAdmin('Akses Admin diperlukan untuk menginput assessment baru.', () => {
              setPreSelectedParticipantId(undefined);
              setIsNewAssessmentOpen(true);
            });
          } else {
            setPreSelectedParticipantId(undefined);
            setIsNewAssessmentOpen(true);
          }
        }}
        totalParticipants={totalParticipants}
        totalSessions={totalSessions}
        passRate={passRate}
        avgFinalScore={avgFinalScore}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'calendar' && (
          <CalendarView
            participants={participants}
            products={products}
            sessions={sessions}
            setSessions={setSessions}
            trainingPlans={trainingPlans}
            setTrainingPlans={setTrainingPlans}
            trainingRequests={trainingRequests}
            setTrainingRequests={setTrainingRequests}
            isAdmin={isAdmin}
            handleRequireAdmin={handleRequireAdmin}
          />
        )}

        {(activeTab === 'dashboard' || activeTab === 'dashboardInternal') && (
          <DashboardView
            sessions={sessions}
            participants={participants}
            products={products}
            mode="Internal"
            isAdmin={isAdmin}
            onSwitchMode={(newMode) => {
              if (newMode === 'Eksternal' && !isAdmin) {
                handleRequireAdmin('Akses Mode Admin / Asesor diperlukan untuk membuka Dashboard Eksternal.');
                return;
              }
              setActiveTab(newMode === 'Internal' ? 'dashboardInternal' : 'dashboardEksternal');
            }}
            onOpenReport={(s) => setSelectedReportSession(s)}
            onNavigateToSessions={() => setActiveTab('participants')}
          />
        )}

        {activeTab === 'dashboardEksternal' && isAdmin && (
          <DashboardView
            sessions={sessions}
            participants={participants}
            products={products}
            mode="Eksternal"
            isAdmin={isAdmin}
            onSwitchMode={(newMode) =>
              setActiveTab(newMode === 'Internal' ? 'dashboardInternal' : 'dashboardEksternal')
            }
            onOpenReport={(s) => setSelectedReportSession(s)}
            onNavigateToSessions={() => setActiveTab('participants')}
          />
        )}

        {activeTab === 'participantProgress' && (
          <ParticipantProgressView
            participants={participants}
            products={products}
            sessions={sessions}
            settings={settings}
            onNavigateToSessions={() => setActiveTab('participants')}
            onOpenReportModal={(s) => setSelectedReportSession(s)}
          />
        )}

        {activeTab === 'participants' && (
          <ParticipantListView
            participants={participants}
            sessions={sessions}
            products={products}
            settings={settings}
            isAdmin={isAdmin}
            onRequireAdmin={handleRequireAdmin}
            onOpenReport={(s) => setSelectedReportSession(s)}
            onNewSessionForParticipant={handleOpenNewSessionForParticipant}
            onAddNewParticipant={() => {
              setEditingParticipant(null);
              setIsParticipantModalOpen(true);
            }}
            onEditParticipant={(p) => {
              setEditingParticipant(p);
              setIsParticipantModalOpen(true);
            }}
            onDeleteSession={handleDeleteSession}
            onDeleteParticipant={handleDeleteParticipant}
            onImportParticipants={handleImportParticipants}
            onImportProducts={handleImportProducts}
            onImportSessions={handleImportSessions}
          />
        )}

        {activeTab === 'products' && (
          <ProductCatalogView
            products={products}
            sessions={sessions}
            participants={participants}
            settings={settings}
            isAdmin={isAdmin}
            onRequireAdmin={handleRequireAdmin}
            onAddNewProduct={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onImportParticipants={handleImportParticipants}
            onImportProducts={handleImportProducts}
            onImportSessions={handleImportSessions}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            sessions={sessions}
            setSessions={setSessions}
            participants={participants}
            setParticipants={setParticipants}
            products={products}
            setProducts={setProducts}
            trainingPlans={trainingPlans}
            setTrainingPlans={setTrainingPlans}
            trainingRequests={trainingRequests}
            setTrainingRequests={setTrainingRequests}
            isAdmin={isAdmin}
            onRequireAdmin={handleRequireAdmin}
            onImportParticipants={handleImportParticipants}
            onImportProducts={handleImportProducts}
            onImportSessions={handleImportSessions}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 {settings.companyName} — {settings.trainingCenterName}</p>
          <div className="flex items-center gap-3">
            <p className="text-[11px] text-slate-500">
              Sistem Penilaian Kompetensi Assessment (Teori, Praktek & Role-Play)
            </p>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-mono text-slate-400">
              Status Akses: {isAdmin ? '🔓 Mode Admin' : '👁️ View Only (Peserta)'}
            </span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 0. Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => {
          setIsAdminAuthModalOpen(false);
          setPendingAction(null);
        }}
        currentPin={settings.adminPin || 'VSI7789'}
        onSuccess={handleAdminAuthSuccess}
        actionMessage={adminAuthMessage}
      />

      {/* 1. New Assessment Session Modal */}
      <NewAssessmentModal
        isOpen={isNewAssessmentOpen}
        onClose={() => setIsNewAssessmentOpen(false)}
        participants={participants}
        products={products}
        trainers={settings.trainers}
        weights={settings.weights}
        defaultKKM={settings.defaultKKM}
        initialParticipantId={preSelectedParticipantId}
        onSaveSession={handleSaveNewSession}
      />

      {/* 2. Printable Report & Certificate Modal */}
      <ReportModal
        session={selectedReportSession}
        onClose={() => setSelectedReportSession(null)}
        participants={participants}
        products={products}
        settings={settings}
      />

      {/* 3. Add/Edit Participant Modal */}
      <ParticipantModal
        isOpen={isParticipantModalOpen}
        onClose={() => setIsParticipantModalOpen(false)}
        participantToEdit={editingParticipant}
        onSaveParticipant={handleSaveParticipant}
      />

      {/* 4. Add/Edit Training Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={editingProduct}
        onSaveProduct={handleSaveProduct}
      />
    </div>
  );
}
