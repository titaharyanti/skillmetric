import React, { useState, useMemo } from 'react';
import {
  Participant,
  TrainingProduct,
  TrainingSession,
  AppSettings,
  DEPARTMENT_OPTIONS,
} from '../types';
import {
  User,
  Users,
  Search,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Building2,
  Briefcase,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  Zap,
  Check,
  X,
  UserCheck,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface ParticipantProgressViewProps {
  participants: Participant[];
  products: TrainingProduct[];
  sessions: TrainingSession[];
  settings: AppSettings;
  onNavigateToSessions?: (participantId?: string) => void;
  onOpenReportModal?: (session: TrainingSession) => void;
}

export const ParticipantProgressView: React.FC<ParticipantProgressViewProps> = ({
  participants,
  products,
  sessions,
  settings,
  onNavigateToSessions,
  onOpenReportModal,
}) => {
  // State for selected participant ('all' or specific participant ID)
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'individual' | 'overview'>('individual');

  const isAllParticipants = selectedParticipantId === 'all';

  // Unique departments for filter
  const departments = DEPARTMENT_OPTIONS;

  // Participants belonging to current department filter
  const departmentParticipants = useMemo(() => {
    if (selectedDepartment === 'All') return participants;
    return participants.filter((p) => p.department === selectedDepartment);
  }, [participants, selectedDepartment]);

  // Filtered participant list for selector (matches search & department)
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = selectedDepartment === 'All' || p.department === selectedDepartment;
      return matchSearch && matchDept;
    });
  }, [participants, searchTerm, selectedDepartment]);

  // Handlers to synchronize participant selection and department filter
  const handleSelectParticipant = (participantId: string) => {
    setSelectedParticipantId(participantId);
    if (participantId !== 'all') {
      const p = participants.find((item) => item.id === participantId);
      if (p && p.department) {
        setSelectedDepartment(p.department);
      }
    }
  };

  const handleSelectDepartment = (dept: string) => {
    setSelectedDepartment(dept);
    if (selectedParticipantId !== 'all') {
      const currentParticipant = participants.find((p) => p.id === selectedParticipantId);
      if (currentParticipant && dept !== 'All' && currentParticipant.department !== dept) {
        setSelectedParticipantId('all');
      }
    }
  };

  // Currently selected participant object (or collective dummy object if 'all')
  const selectedParticipant = useMemo(() => {
    if (isAllParticipants) {
      const count = departmentParticipants.length;
      return {
        id: 'all',
        name: selectedDepartment === 'All' ? 'Semua Peserta Training' : `Semua Peserta Divisi ${selectedDepartment}`,
        nip: `GABUNGAN (${count} PESERTA)`,
        department: selectedDepartment === 'All' ? 'Seluruh Divisi' : selectedDepartment,
        title: selectedDepartment === 'All' ? 'Ringkasan Kolektif Seluruh Peserta' : `Ringkasan Kolektif Divisi ${selectedDepartment}`,
        email: '',
      };
    }
    return participants.find((p) => p.id === selectedParticipantId) || participants[0] || null;
  }, [participants, selectedParticipantId, selectedDepartment, isAllParticipants, departmentParticipants]);

  // Active Sessions for calculation (single participant or all participants)
  const activeSessions = useMemo(() => {
    if (isAllParticipants) {
      let filteredS = sessions;
      if (selectedDepartment !== 'All') {
        const deptParticipantIds = new Set(
          participants.filter((p) => p.department === selectedDepartment).map((p) => p.id)
        );
        filteredS = sessions.filter((s) => deptParticipantIds.has(s.participantId));
      }
      return [...filteredS].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    if (!selectedParticipant) return [];
    return sessions
      .filter((s) => s.participantId === selectedParticipant.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, selectedParticipant, isAllParticipants, selectedDepartment, participants]);

  // Map products to completion status for selected participant or all participants
  const productMasteryList = useMemo(() => {
    return products.map((prod) => {
      const prodSessions = activeSessions.filter((s) => s.productId === prod.id);
      const latestSession = prodSessions[prodSessions.length - 1] || null;
      const attemptsCount = prodSessions.length;
      const hasTaken = attemptsCount > 0;

      if (isAllParticipants) {
        const competentCount = prodSessions.filter((s) => s.status === 'Kompeten').length;
        const passRate = attemptsCount > 0 ? Math.round((competentCount / attemptsCount) * 100) : 0;
        const avgScore =
          attemptsCount > 0
            ? Math.round((prodSessions.reduce((a, b) => a + b.finalScore, 0) / attemptsCount) * 10) / 10
            : 0;
        const isCompetent = passRate >= 70;

        return {
          product: prod,
          latestSession,
          isCompetent,
          attemptsCount,
          hasTaken,
          competentCount,
          passRate,
          avgScore,
        };
      } else {
        const isCompetent = prodSessions.some((s) => s.status === 'Kompeten');
        const competentCount = isCompetent ? 1 : 0;
        const passRate = isCompetent ? 100 : 0;
        const avgScore = latestSession ? latestSession.finalScore : 0;

        return {
          product: prod,
          latestSession,
          isCompetent,
          attemptsCount,
          hasTaken,
          competentCount,
          passRate,
          avgScore,
        };
      }
    });
  }, [products, activeSessions, isAllParticipants]);

  // Metrics calculation for selected participant or all participants
  const participantMetrics = useMemo(() => {
    if (activeSessions.length === 0) {
      return {
        totalSessions: 0,
        competentCount: 0,
        remedialCount: 0,
        passRate: 0,
        avgTeori: 0,
        avgPraktek: 0,
        avgRolePlay: 0,
        avgFinal: 0,
        avgPreTest: 0,
        avgPostTest: 0,
        avgNGain: 0,
        softwareCompetent: 0,
        hardwareCompetent: 0,
      };
    }

    const total = activeSessions.length;
    const competent = activeSessions.filter((s) => s.status === 'Kompeten').length;
    const remedial = total - competent;
    const passRate = Math.round((competent / total) * 100);

    const avgTeori = Math.round((activeSessions.reduce((a, b) => a + b.teoriScore, 0) / total) * 10) / 10;
    const avgPraktek = Math.round((activeSessions.reduce((a, b) => a + b.praktekScore, 0) / total) * 10) / 10;
    const avgRolePlay = Math.round((activeSessions.reduce((a, b) => a + b.rolePlayScore, 0) / total) * 10) / 10;
    const avgFinal = Math.round((activeSessions.reduce((a, b) => a + b.finalScore, 0) / total) * 10) / 10;

    const avgPreTest = Math.round((activeSessions.reduce((a, b) => a + (b.preTestScore || 0), 0) / total) * 10) / 10;
    const avgPostTest = Math.round((activeSessions.reduce((a, b) => a + (b.postTestScore || 0), 0) / total) * 10) / 10;
    const avgNGain = Math.round((activeSessions.reduce((a, b) => a + (b.nGainScore || 0), 0) / total) * 100) / 100;

    const softwareCompetent = products.filter((p) =>
      p.category === 'Software' &&
      activeSessions.some((s) => s.productId === p.id && s.status === 'Kompeten')
    ).length;

    const hardwareCompetent = products.filter((p) =>
      p.category === 'Hardware' &&
      activeSessions.some((s) => s.productId === p.id && s.status === 'Kompeten')
    ).length;

    return {
      totalSessions: total,
      competentCount: competent,
      remedialCount: remedial,
      passRate,
      avgTeori,
      avgPraktek,
      avgRolePlay,
      avgFinal,
      avgPreTest,
      avgPostTest,
      avgNGain,
      softwareCompetent,
      hardwareCompetent,
    };
  }, [activeSessions, products]);

  // Radar chart data for skill competency
  const radarChartData = useMemo(() => {
    if (activeSessions.length === 0) return [];
    return [
      { subject: 'Ujian Teori', Score: participantMetrics.avgTeori, FullMark: 100 },
      { subject: 'Ujian Praktek', Score: participantMetrics.avgPraktek, FullMark: 100 },
      { subject: 'Role-Play 1-on-1', Score: participantMetrics.avgRolePlay, FullMark: 100 },
      { subject: 'Post-Test (Pemahaman)', Score: participantMetrics.avgPostTest, FullMark: 100 },
      { subject: 'Kecepatan N-Gain (%)', Score: Math.min(Math.max(participantMetrics.avgNGain * 100, 0), 100), FullMark: 100 },
    ];
  }, [activeSessions, participantMetrics]);

  // Learning Progress Over Time (Pre vs Post test & Final Score curve)
  const timelineChartData = useMemo(() => {
    if (activeSessions.length === 0) return [];
    return activeSessions.map((s, index) => {
      const prod = products.find((p) => p.id === s.productId);
      const part = participants.find((p) => p.id === s.participantId);
      const pName = part ? part.name : 'Peserta';
      return {
        sessionName: `#${index + 1} ${pName.split(' ')[0]} (${prod ? prod.code : 'Modul'})`,
        fullDate: s.date,
        moduleName: prod ? prod.name : s.productId,
        participantName: pName,
        NilaiAkhir: s.finalScore,
        KKM: s.kkmThreshold,
        PreTest: s.preTestScore || 0,
        PostTest: s.postTestScore || 0,
        Teori: s.teoriScore,
        Praktek: s.praktekScore,
        RolePlay: s.rolePlayScore,
        Status: s.status,
      };
    });
  }, [activeSessions, products, participants]);

  // Overview All Participants Comparison Table / Chart (Filtered by department and search)
  const participantOverviewData = useMemo(() => {
    return filteredParticipants.map((p) => {
      const pSessions = sessions.filter((s) => s.participantId === p.id);
      const totalS = pSessions.length;
      const compCount = pSessions.filter((s) => s.status === 'Kompeten').length;
      const avgScore =
        totalS > 0 ? Math.round((pSessions.reduce((acc, s) => acc + s.finalScore, 0) / totalS) * 10) / 10 : 0;
      const passRatio = totalS > 0 ? Math.round((compCount / totalS) * 100) : 0;
      const avgNGain =
        totalS > 0
          ? Math.round((pSessions.reduce((acc, s) => acc + (s.nGainScore || 0), 0) / totalS) * 100) / 100
          : 0;

      return {
        id: p.id,
        name: p.name,
        nip: p.nip,
        department: p.department,
        title: p.title,
        totalSessions: totalS,
        competentCount: compCount,
        avgScore,
        passRatio,
        avgNGain,
      };
    });
  }, [filteredParticipants, sessions]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Visualisasi &amp; Progress Kompetensi Peserta
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Pantau perkembangan kompetensi individual, grafik peningkatan Pre-Test vs Post-Test (N-Gain),
            serta peta penguasaan modul software dan hardware untuk setiap peserta training.
          </p>
        </div>

        {/* Mode Switcher: Individual vs Overview */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'individual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Progress Individual Peserta</span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Matriks &amp; Perbandingan Semua Peserta</span>
          </button>
        </div>
      </div>

      {activeTab === 'individual' ? (
        <>
          {/* Participant Selector & Filter Bar (Order: 1. Divisi, 2. Peserta, 3. Search) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* 1. Filter Divisi */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700 shrink-0">Divisi:</span>
              <select
                value={selectedDepartment}
                onChange={(e) => handleSelectDepartment(e.target.value)}
                className="w-full lg:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="All">Semua Divisi</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Pilih Peserta */}
            <div className="flex-1 flex items-center gap-1.5 min-w-[240px]">
              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700 shrink-0">Peserta:</span>
              <select
                value={selectedParticipantId}
                onChange={(e) => handleSelectParticipant(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="all">
                  👥 -- SEMUA PESERTA {selectedDepartment === 'All' ? 'SELURUH DIVISI' : `DIVISI ${selectedDepartment.toUpperCase()}`} ({departmentParticipants.length} Orang) --
                </option>
                {filteredParticipants.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.nip}] {p.name} — {p.department} ({p.title})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Kolom Search */}
            <div className="relative w-full lg:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama / NIP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>
          </div>

          {selectedParticipant ? (
            <div className="space-y-6">
              {/* Participant Card Profile & Summary Stats Header */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                      {isAllParticipants ? (
                        <Users className="w-7 h-7 text-white" />
                      ) : (
                        selectedParticipant.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900">{selectedParticipant.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                          {isAllParticipants ? 'KOLEKTIF' : `NIP: ${selectedParticipant.nip}`}
                        </span>
                        {isAllParticipants ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <Users className="w-3 h-3 text-indigo-600" />
                            <span>Rangkuman Seluruh Peserta</span>
                          </span>
                        ) : participantMetrics.passRate >= 80 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Kandidat Unggulan</span>
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{selectedParticipant.department}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>{selectedParticipant.title}</span>
                        </span>
                        {selectedParticipant.email && (
                          <span className="text-slate-400">✉️ {selectedParticipant.email}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button to Sessions */}
                  <div className="flex items-center gap-2">
                    {onNavigateToSessions && (
                      <button
                        onClick={() => onNavigateToSessions(isAllParticipants ? undefined : selectedParticipant.id)}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>{isAllParticipants ? 'Lihat Semua Sesi' : 'Lihat Riwayat Sesi'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 5 Quick Metric Cards for Participant */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4">
                  {/* Card 1: Total Sesi & Pass Rate */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Total Sesi Diikuti</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-bold text-slate-900">{participantMetrics.totalSessions} Sesi</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                      Tingkat Kelulusan: {participantMetrics.passRate}%
                    </span>
                  </div>

                  {/* Card 2: Rata-Rata Nilai Akhir */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Rata-Rata Nilai Akhir</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-bold text-indigo-600">{participantMetrics.avgFinal}</span>
                      <span className="text-xs text-slate-600 font-bold">/ 100</span>
                    </div>
                    <span className="text-[11px] text-slate-600 mt-1 block">
                      Kompeten: {participantMetrics.competentCount} | Remedial: {participantMetrics.remedialCount}
                    </span>
                  </div>

                  {/* Card 3: Software Mastery */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Modul Software</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-bold text-blue-600">
                        {participantMetrics.softwareCompetent}
                      </span>
                      <span className="text-xs text-slate-600 font-bold">
                        / {products.filter((p) => p.category === 'Software').length} Modul
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600 mt-1 block">Telah Menguasai</span>
                  </div>

                  {/* Card 4: Hardware Mastery */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Modul Hardware</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-bold text-amber-600">
                        {participantMetrics.hardwareCompetent}
                      </span>
                      <span className="text-xs text-slate-600 font-bold">
                        / {products.filter((p) => p.category === 'Hardware').length} Modul
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600 mt-1 block">Telah Menguasai</span>
                  </div>

                  {/* Card 5: N-Gain Index */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Indeks Peningkatan N-Gain</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-bold text-emerald-600">
                        {participantMetrics.avgNGain}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600 mt-1 block">
                      {participantMetrics.avgNGain >= 0.7
                        ? '🟢 Peningkatan Tinggi'
                        : participantMetrics.avgNGain >= 0.3
                        ? '🟡 Peningkatan Sedang'
                        : '🔴 Peningkatan Rendah'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid Section 1: Radar Chart Competency & Pre vs Post Test Line Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Radar Chart */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-600" />
                        <span>Radar Radar Peta Keterampilan (Spider Chart)</span>
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      Sebaran nilai rata-rata pada setiap aspek penilaian &amp; persentase N-Gain.
                    </p>
                  </div>

                  <div className="h-72 w-full flex items-center justify-center">
                    {activeSessions.length === 0 ? (
                      <div className="text-slate-400 text-xs text-center">
                        Belum ada sesi assessment tercatat.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                          <PolarGrid stroke="#E2E8F0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                          <Radar
                            name={selectedParticipant.name}
                            dataKey="Score"
                            stroke="#4F46E5"
                            fill="#6366F1"
                            fillOpacity={0.4}
                          />
                          <Tooltip formatter={(value: any) => [`${value} Poin / 100`, 'Nilai']} />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Skill breakdown scores pills */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                      <span className="text-[10px] text-blue-600 font-bold block">Ujian Teori</span>
                      <strong className="text-blue-900 text-sm">{participantMetrics.avgTeori}</strong>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                      <span className="text-[10px] text-amber-600 font-bold block">Ujian Praktek</span>
                      <strong className="text-amber-900 text-sm">{participantMetrics.avgPraktek}</strong>
                    </div>
                    <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                      <span className="text-[10px] text-purple-600 font-bold block">Role-Play</span>
                      <strong className="text-purple-900 text-sm">{participantMetrics.avgRolePlay}</strong>
                    </div>
                  </div>
                </div>

                {/* Progress Timeline Chart: Pre-Test vs Post-Test vs Nilai Akhir */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Grafik Peningkatan Pre-Test vs Post-Test Sesi</span>
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Lompatan nilai pemahaman sebelum dan sesudah materi training disampaikan.
                    </p>
                  </div>

                  <div className="h-72 w-full">
                    {activeSessions.length === 0 ? (
                      <div className="text-slate-400 text-xs text-center py-24">
                        Belum ada riwayat sesi assessment.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineChartData} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis
                            dataKey="sessionName"
                            tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                            angle={-20}
                            textAnchor="end"
                          />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                          <Tooltip
                            formatter={(value: any, name: any) => [`${value} Poin`, name]}
                            labelFormatter={(label, items) => {
                              const item = items[0]?.payload;
                              return item
                                ? `${item.participantName} - ${item.moduleName} (${item.fullDate})`
                                : label;
                            }}
                          />
                          <Legend wrapperStyle={{ paddingTop: 10, fontSize: 11 }} />
                          <Line
                            type="monotone"
                            dataKey="PreTest"
                            name="Pre-Test (Awal)"
                            stroke="#94A3B8"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="PostTest"
                            name="Post-Test (Akhir)"
                            stroke="#2563EB"
                            strokeWidth={2.5}
                            dot={{ r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="NilaiAkhir"
                            name="Nilai Akhir Bobot"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Pre vs Post Averages */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">Rata-Rata Pre-Test</span>
                      <strong className="text-slate-700 text-sm">{participantMetrics.avgPreTest} Poin</strong>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-bold block">Rata-Rata Post-Test</span>
                      <strong className="text-emerald-800 text-sm">{participantMetrics.avgPostTest} Poin</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Section 2: Peta Kompetensi Katalog Modul Training (Product Mastery Matrix) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Peta Penguasaan Modul Produk Training ({productMasteryList.length} Modul)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Status kelulusan dan skor riwayat pada setiap modul produk software dan hardware.
                    </p>
                  </div>

                  {/* Legend Badges */}
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Kompeten</span>
                    </span>
                    <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 text-[11px]">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>Remedial</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Belum Diuji</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {productMasteryList.map((item) => {
                    const { product, latestSession, isCompetent, attemptsCount, hasTaken, competentCount, passRate, avgScore } = item;
                    return (
                      <div
                        key={product.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                          isCompetent
                            ? 'bg-emerald-50/40 border-emerald-200/90 hover:border-emerald-300'
                            : hasTaken
                            ? 'bg-rose-50/40 border-rose-200/90 hover:border-rose-300'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase ${
                                  product.category === 'Software'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {product.code}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">
                                KKM: {product.defaultKKM}
                              </span>
                            </div>

                            {/* Status Pill */}
                            {isAllParticipants ? (
                              hasTaken ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-2xs ${
                                    passRate >= 70
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-amber-600 text-white'
                                  }`}
                                >
                                  <Users className="w-3 h-3" />
                                  <span>
                                    {competentCount}/{attemptsCount} Lulus ({passRate}%)
                                  </span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-600">
                                  Belum Mengikuti
                                </span>
                              )
                            ) : isCompetent ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                                <Check className="w-3 h-3" />
                                <span>Kompeten</span>
                              </span>
                            ) : hasTaken ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Remedial</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-600">
                                Belum Mengikuti
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-800 text-xs leading-snug">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {product.description}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Session Details if Taken */}
                        {hasTaken ? (
                          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block">
                                {isAllParticipants ? 'Rata-Rata Nilai' : 'Nilai Terakhir'}
                              </span>
                              <strong
                                className={`text-xs font-extrabold ${
                                  (isAllParticipants ? avgScore : latestSession?.finalScore || 0) >= product.defaultKKM
                                    ? 'text-emerald-700'
                                    : 'text-rose-700'
                                }`}
                              >
                                {isAllParticipants ? avgScore : latestSession?.finalScore} / 100
                              </strong>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">
                                {isAllParticipants ? `Total Pengujian: ${attemptsCount} Sesi` : `Tanggal: ${latestSession?.date}`}
                              </span>
                              {!isAllParticipants && latestSession && onOpenReportModal && (
                                <button
                                  type="button"
                                  onClick={() => onOpenReportModal(latestSession)}
                                  className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer mt-0.5"
                                >
                                  <span>Lihat Rapor</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 pt-2 border-t border-slate-200/40 text-[11px] text-slate-400 italic">
                            Belum pernah diuji dalam sesi assessment.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
              Tidak ada data peserta yang ditemukan.
            </div>
          )}
        </>
      ) : (
        /* OVERVIEW TAB: Matriks & Perbandingan Semua Peserta */
        <div className="space-y-6">
          {/* Comparison Bar Chart: Rata-Rata Nilai per Peserta */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BarChart className="w-4 h-4 text-blue-600" />
                <span>Grafik Perbandingan Rata-Rata Nilai Akhir Seluruh Peserta</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengukur tingkat performa keseluruhan peserta di seluruh divisi.
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={participantOverviewData}
                  margin={{ top: 15, right: 30, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} Poin`, name]}
                    labelFormatter={(label, items) => {
                      const item = items[0]?.payload;
                      return item ? `${item.name} (${item.department} - ${item.title})` : label;
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                  <Bar dataKey="avgScore" name="Rata-Rata Nilai Akhir" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                    {participantOverviewData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={entry.avgScore >= 80 ? '#10B981' : entry.avgScore >= 70 ? '#3B82F6' : '#EF4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Matriks & Table Rekap Performa Semua Peserta */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Matriks Rekapitulasi Progress Per Peserta</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar rinci kelulusan, tingkat pemahaman, dan statistik sesi per individu.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-3.5 py-3">Nama Peserta / NIP</th>
                    <th className="px-3.5 py-3">Divisi &amp; Jabatan</th>
                    <th className="px-3.5 py-3 text-center">Total Sesi</th>
                    <th className="px-3.5 py-3 text-center">Kompeten</th>
                    <th className="px-3.5 py-3 text-center">Tingkat Lulus</th>
                    <th className="px-3.5 py-3 text-center">Rata-Rata Nilai</th>
                    <th className="px-3.5 py-3 text-center">Indeks N-Gain</th>
                    <th className="px-3.5 py-3 text-right">Aksi Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-medium">
                  {participantOverviewData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-slate-900">{row.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NIP: {row.nip}</div>
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="font-semibold text-slate-800">{row.department}</div>
                        <div className="text-[10px] text-slate-500">{row.title}</div>
                      </td>
                      <td className="px-3.5 py-3 text-center font-bold text-slate-800">
                        {row.totalSessions} Sesi
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {row.competentCount} Lulus
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        <span
                          className={`font-bold ${
                            row.passRatio >= 80
                              ? 'text-emerald-600'
                              : row.passRatio >= 50
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {row.passRatio}%
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-center font-bold text-indigo-700">
                        {row.avgScore}
                      </td>
                      <td className="px-3.5 py-3 text-center font-semibold text-slate-700">
                        {row.avgNGain}
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedParticipantId(row.id);
                            setActiveTab('individual');
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          Lihat Progress
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
