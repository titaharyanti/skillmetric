import React, { useState } from 'react';
import { SpecificDateFilter } from './SpecificDateFilter';
import { SpecificTimeFilter } from './SpecificTimeFilter';
import {
  Participant,
  ProductCategory,
  TrainingProduct,
  TrainingSession,
  TrainingType,
  DEPARTMENT_OPTIONS,
} from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Laptop,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Clock,
  Filter,
  RotateCcw,
  CalendarDays,
  Building2,
  Briefcase,
  Users,
  Target,
  ArrowRightLeft,
  X,
} from 'lucide-react';

interface DashboardViewProps {
  sessions: TrainingSession[];
  participants: Participant[];
  products: TrainingProduct[];
  onOpenReport: (session: TrainingSession) => void;
  onNavigateToSessions: () => void;
  mode?: 'Internal' | 'Eksternal';
  onSwitchMode?: (newMode: 'Internal' | 'Eksternal') => void;
  isAdmin?: boolean;
}

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-xl border border-slate-700">
        <p className="font-bold flex items-center gap-1.5" style={{ color: data.payload.color }}>
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.payload.color }} />
          {data.name}
        </p>
        <p className="mt-1 text-slate-200">
          Jumlah: <strong className="text-white font-bold">{data.value} Sesi Peserta</strong>
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Bar Chart
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-700 space-y-1.5">
        <p className="font-bold text-indigo-300 border-b border-slate-700 pb-1">{label}</p>
        {payload.map((p: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-slate-200">
            <span className="flex items-center gap-1.5" style={{ color: p.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}:
            </span>
            <strong className="text-white font-bold">{p.value} Poin</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Line Chart
const CustomLineTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPass = data.NilaiAkhir >= data.KKM;
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs shadow-2xl border border-slate-700 space-y-2 max-w-xs">
        <div className="border-b border-slate-700 pb-1.5 flex justify-between items-start gap-2">
          <div>
            <p className="font-bold text-emerald-400 text-xs">{data.participantName}</p>
            <p className="text-[11px] text-slate-300">{data.productName} ({data.productCategory})</p>
          </div>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
            {data.fullDate}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Nilai Akhir / KKM</span>
            <span className="font-bold text-emerald-400 text-sm">{data.NilaiAkhir}</span>
            <span className="text-slate-400 text-[10px]"> / {data.KKM}</span>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Status</span>
            <span className={`font-bold text-[11px] ${isPass ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPass ? 'Kompeten' : 'Belum Kompeten'}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-1.5 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-blue-400 font-medium">Nilai Teori:</span>
            <span className="font-bold">{data.Teori} Poin</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-400 font-medium">Nilai Praktek:</span>
            <span className="font-bold">{data.Praktek} Poin</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400 font-medium">Role-Play 1-on-1:</span>
            <span className="font-bold">{data.RolePlay} Poin</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Render Pie Slice Outer Text Label
const renderPieLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 16;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const shortName = name.includes('Remedial') ? 'Belum Kompeten' : 'Kompeten';

  return (
    <text
      x={x}
      y={y}
      fill="#334155"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${shortName} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  participants,
  products,
  onOpenReport,
  onNavigateToSessions,
  mode = 'Internal',
  onSwitchMode,
  isAdmin = false,
}) => {
  const activeMode = mode;

  // Lookup maps
  const participantMap = new Map<string, Participant>(participants.map((p) => [p.id, p]));
  const productMap = new Map<string, TrainingProduct>(products.map((pr) => [pr.id, pr]));

  const getSessionTrainingType = (s: TrainingSession): 'Internal' | 'Eksternal' => {
    if (s.trainingType) return s.trainingType;
    const prod = productMap.get(s.productId);
    if (prod && prod.trainingType) return prod.trainingType;
    return 'Internal';
  };

  // Filter sessions specifically for the active dashboard mode
  const modeSessions = sessions.filter((s) => getSessionTrainingType(s) === activeMode);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<'All' | ProductCategory>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [dateFilterType, setDateFilterType] = useState<'single' | 'range'>('single');
  const [selectedExactDate, setSelectedExactDate] = useState<string>('');
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

  // Advanced Time Filter States
  const [timeFilterType, setTimeFilterType] = useState<'single' | 'range'>('single');
  const [timeFilterMode, setTimeFilterMode] = useState<'interval' | 'free'>('interval');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedTimeRangeStart, setSelectedTimeRangeStart] = useState<string>('');
  const [selectedTimeRangeEnd, setSelectedTimeRangeEnd] = useState<string>('');
  const [timeFreeText, setTimeFreeText] = useState<string>('');

  // Available departments restricted strictly to the 8 required choices
  const availableDepartments = DEPARTMENT_OPTIONS;

  // Derive unique years from dataset, filled with 2026 as requested
  const availableYears = ['2026'];

  // Reset all filters
  const resetFilters = () => {
    setCategoryFilter('All');
    setSelectedDepartment('All');
    setSelectedYear('2026');
    setSelectedMonth('All');
    setSelectedDay('All');
    setDateFilterType('single');
    setSelectedExactDate('');
    setSelectedStartDate('');
    setSelectedEndDate('');
    setTimeFilterType('single');
    setTimeFilterMode('interval');
    setSelectedTimes([]);
    setSelectedTimeRangeStart('');
    setSelectedTimeRangeEnd('');
    setTimeFreeText('');
  };

  // Filter sessions strictly based on modeSessions and active date/time/division criteria
  const filteredSessions = modeSessions.filter((s) => {
    // Category
    if (categoryFilter !== 'All' && s.productCategory !== categoryFilter) return false;

    // Divisi / Department
    if (selectedDepartment !== 'All') {
      const p = participantMap.get(s.participantId);
      if (!p || p.department !== selectedDepartment) return false;
    }

    // Year
    if (selectedYear !== 'All' && (!s.date || !s.date.startsWith(selectedYear))) return false;

    // Month
    if (selectedMonth !== 'All' && (!s.date || s.date.split('-')[1] !== selectedMonth)) return false;

    // Day of week
    if (selectedDay !== 'All' && s.day !== selectedDay) return false;

    // Date Filtering: Single Date vs Range Date
    if (dateFilterType === 'single') {
      if (selectedExactDate && s.date !== selectedExactDate) return false;
    } else {
      if (selectedStartDate && (!s.date || s.date < selectedStartDate)) return false;
      if (selectedEndDate && (!s.date || s.date > selectedEndDate)) return false;
    }

    // Advanced Time / Hour Filtering
    if (timeFilterType === 'single') {
      if (timeFilterMode === 'interval') {
        if (selectedTimes.length > 0) {
          const start = s.startTime || '';
          const isMatched = selectedTimes.some((t) => {
            const cleanT = t.replace(/\s*WIB/gi, '').trim();
            const cleanS = start.replace(/\s*WIB/gi, '').trim();
            return cleanS.startsWith(cleanT) || cleanT.startsWith(cleanS);
          });
          if (!isMatched) return false;
        }
      } else {
        if (timeFreeText.trim() !== '') {
          const start = (s.startTime || '').toLowerCase();
          const end = (s.endTime || '').toLowerCase();
          const combined = `${start}-${end}`.toLowerCase();
          const term = timeFreeText.trim().toLowerCase();
          if (!start.includes(term) && !end.includes(term) && !combined.includes(term)) {
            return false;
          }
        }
      }
    } else {
      // Range Mode
      const start = s.startTime || '00:00';
      const cleanStart = start.replace(/\s*WIB/gi, '').trim();
      if (timeFilterMode === 'interval') {
        if (selectedTimeRangeStart) {
          const cleanRangeStart = selectedTimeRangeStart.replace(/\s*WIB/gi, '').trim();
          if (cleanStart < cleanRangeStart) return false;
        }
        if (selectedTimeRangeEnd) {
          const cleanRangeEnd = selectedTimeRangeEnd.replace(/\s*WIB/gi, '').trim();
          if (cleanStart > cleanRangeEnd) return false;
        }
      } else {
        if (selectedTimeRangeStart) {
          const cleanRangeStart = selectedTimeRangeStart.replace(/\s*WIB/gi, '').trim().toLowerCase();
          if (cleanStart.toLowerCase() < cleanRangeStart) return false;
        }
        if (selectedTimeRangeEnd) {
          const cleanRangeEnd = selectedTimeRangeEnd.replace(/\s*WIB/gi, '').trim().toLowerCase();
          if (cleanStart.toLowerCase() > cleanRangeEnd) return false;
        }
      }
    }

    return true;
  });

  const totalSessions = filteredSessions.length;
  const competentCount = filteredSessions.filter((s) => s.status === 'Kompeten').length;
  const remedialCount = filteredSessions.filter((s) => s.status === 'Belum Kompeten').length;
  const passRate = totalSessions > 0 ? Math.round((competentCount / totalSessions) * 100) : 0;

  const avgTeori =
    totalSessions > 0
      ? Math.round((filteredSessions.reduce((acc, s) => acc + s.teoriScore, 0) / totalSessions) * 10) / 10
      : 0;
  const avgPraktek =
    totalSessions > 0
      ? Math.round((filteredSessions.reduce((acc, s) => acc + s.praktekScore, 0) / totalSessions) * 10) / 10
      : 0;
  const avgRolePlay =
    totalSessions > 0
      ? Math.round((filteredSessions.reduce((acc, s) => acc + s.rolePlayScore, 0) / totalSessions) * 10) / 10
      : 0;
  const avgFinal =
    totalSessions > 0
      ? Math.round((filteredSessions.reduce((acc, s) => acc + s.finalScore, 0) / totalSessions) * 10) / 10
      : 0;
  const avgNGain =
    totalSessions > 0
      ? Math.round((filteredSessions.reduce((acc, s) => acc + s.nGainScore, 0) / totalSessions) * 100) / 100
      : 0;

  // Category breakdown on filtered set
  const softwareFiltered = filteredSessions.filter((s) => s.productCategory === 'Software');
  const hardwareFiltered = filteredSessions.filter((s) => s.productCategory === 'Hardware');

  const softwarePassRate =
    softwareFiltered.length > 0
      ? Math.round(
          (softwareFiltered.filter((s) => s.status === 'Kompeten').length / softwareFiltered.length) * 100
        )
      : 0;

  const hardwarePassRate =
    hardwareFiltered.length > 0
      ? Math.round(
          (hardwareFiltered.filter((s) => s.status === 'Kompeten').length / hardwareFiltered.length) * 100
        )
      : 0;

  // Departmental breakdown (For Internal Mode)
  const deptStatsMap = new Map<string, { count: number; totalScore: number; passCount: number }>();
  // Target Audience breakdown (For Eksternal Mode)
  const audStatsMap = new Map<string, { count: number; totalScore: number; passCount: number }>();

  filteredSessions.forEach((s) => {
    const p = participantMap.get(s.participantId);
    const prod = productMap.get(s.productId);

    // Dept
    const dept = p?.department || 'Divisi Lain';
    const currDept = deptStatsMap.get(dept) || { count: 0, totalScore: 0, passCount: 0 };
    deptStatsMap.set(dept, {
      count: currDept.count + 1,
      totalScore: currDept.totalScore + s.finalScore,
      passCount: currDept.passCount + (s.status === 'Kompeten' ? 1 : 0),
    });

    // Target Audience
    const aud = s.targetAudience || prod?.targetAudience || 'Calon Customer & Klien';
    const shortAud = aud.length > 25 ? aud.slice(0, 22) + '...' : aud;
    const currAud = audStatsMap.get(shortAud) || { count: 0, totalScore: 0, passCount: 0 };
    audStatsMap.set(shortAud, {
      count: currAud.count + 1,
      totalScore: currAud.totalScore + s.finalScore,
      passCount: currAud.passCount + (s.status === 'Kompeten' ? 1 : 0),
    });
  });

  const deptChartData = Array.from(deptStatsMap.entries())
    .map(([dept, data]) => ({
      name: dept,
      Sesi: data.count,
      NilaiRataRata: Math.round((data.totalScore / data.count) * 10) / 10,
      KelulusanPercent: Math.round((data.passCount / data.count) * 100),
    }))
    .sort((a, b) => {
      const idxA = DEPARTMENT_OPTIONS.indexOf(a.name as any);
      const idxB = DEPARTMENT_OPTIONS.indexOf(b.name as any);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

  const audienceChartData = Array.from(audStatsMap.entries()).map(([aud, data]) => ({
    name: aud,
    SesiDemo: data.count,
    NilaiRataRata: Math.round((data.totalScore / data.count) * 10) / 10,
    KesiapanPercent: Math.round((data.passCount / data.count) * 100),
  }));

  // Recharts Pie Data for Pass/Fail
  const pieData = [
    { name: 'Kompeten', value: competentCount, color: '#10B981' },
    { name: 'Belum Kompeten (Remedial)', value: remedialCount, color: '#EF4444' },
  ];

  // Category Score Averages comparison chart
  const categoryAvgData = [
    {
      name: 'Ujian Teori',
      RataRata: avgTeori,
      Software:
        softwareFiltered.length > 0
          ? Math.round(
              (softwareFiltered.reduce((a, b) => a + b.teoriScore, 0) / softwareFiltered.length) * 10
            ) / 10
          : 0,
      Hardware:
        hardwareFiltered.length > 0
          ? Math.round(
              (hardwareFiltered.reduce((a, b) => a + b.teoriScore, 0) / hardwareFiltered.length) * 10
            ) / 10
          : 0,
    },
    {
      name: 'Tugas Praktek',
      RataRata: avgPraktek,
      Software:
        softwareFiltered.length > 0
          ? Math.round(
              (softwareFiltered.reduce((a, b) => a + b.praktekScore, 0) / softwareFiltered.length) * 10
            ) / 10
          : 0,
      Hardware:
        hardwareFiltered.length > 0
          ? Math.round(
              (hardwareFiltered.reduce((a, b) => a + b.praktekScore, 0) / hardwareFiltered.length) * 10
            ) / 10
          : 0,
    },
    {
      name: 'Role-Play 1-on-1',
      RataRata: avgRolePlay,
      Software:
        softwareFiltered.length > 0
          ? Math.round(
              (softwareFiltered.reduce((a, b) => a + b.rolePlayScore, 0) / softwareFiltered.length) * 10
            ) / 10
          : 0,
      Hardware:
        hardwareFiltered.length > 0
          ? Math.round(
              (hardwareFiltered.reduce((a, b) => a + b.rolePlayScore, 0) / hardwareFiltered.length) * 10
            ) / 10
          : 0,
    },
  ];

  // Remedial candidates (Belum kompeten)
  const remedialSessions = filteredSessions.filter((s) => s.status === 'Belum Kompeten');

  // Top achievers (Highest scores)
  const topSessions = [...filteredSessions]
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 5);

  // Time trend chart data (chronological)
  const trendChartData = [...filteredSessions]
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .map((s, idx) => {
      const p = participantMap.get(s.participantId);
      const pr = productMap.get(s.productId);
      return {
        sessionLabel: `#${idx + 1} ${p?.name ? p.name.split(' ')[0] : 'Peserta'} (${pr?.code || 'Modul'})`,
        participantName: p?.name || 'Peserta',
        productName: pr?.name || s.productId,
        productCategory: s.productCategory,
        fullDate: `${s.date} ${s.startTime || ''}`,
        Teori: s.teoriScore,
        Praktek: s.praktekScore,
        RolePlay: s.rolePlayScore,
        NilaiAkhir: s.finalScore,
        KKM: s.kkmThreshold,
      };
    });

  const isFiltered =
    categoryFilter !== 'All' ||
    selectedDepartment !== 'All' ||
    selectedYear !== 'All' ||
    selectedMonth !== 'All' ||
    selectedDay !== 'All' ||
    (dateFilterType === 'single' && selectedExactDate !== '') ||
    (dateFilterType === 'range' && (selectedStartDate !== '' || selectedEndDate !== '')) ||
    (timeFilterType === 'single' &&
      ((timeFilterMode === 'interval' && selectedTimes.length > 0) ||
        (timeFilterMode === 'free' && timeFreeText.trim() !== ''))) ||
    (timeFilterType === 'range' &&
      (selectedTimeRangeStart !== '' || selectedTimeRangeEnd !== ''));

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Panel */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-3 rounded-xl text-white shadow-md ${
                activeMode === 'Internal'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
                  : 'bg-gradient-to-br from-emerald-600 to-teal-600'
              }`}
            >
              {activeMode === 'Internal' ? (
                <Building2 className="w-6 h-6" />
              ) : (
                <Briefcase className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-800">
                  {activeMode === 'Internal'
                    ? 'Dashboard & Analisis Training Internal Karyawan'
                    : 'Dashboard & Analisis Training Eksternal (Pitching & Customer)'}
                </h2>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                    activeMode === 'Internal'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {activeMode === 'Internal' ? 'Fokus Tim Internal' : 'Fokus Pitching & Customer'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activeMode === 'Internal'
                  ? 'Visualisasi & analisis data kompetensi internal karyawan (Sales Hardware, Sales Software, Sales Maritime, Telesales, Operation, Technician, Customer Success, & Business Development).'
                  : 'Visualisasi & analisis data kualifikasi pitching calon customer, demonstrasi produk awal, & pelatihan klien perusahaan.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {isAdmin && onSwitchMode && (
              <button
                onClick={() => onSwitchMode(activeMode === 'Internal' ? 'Eksternal' : 'Internal')}
                className={`px-3 py-2 text-xs font-bold rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                  activeMode === 'Internal'
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-300'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>
                  {activeMode === 'Internal'
                    ? 'Beralih ke Dashboard Eksternal'
                    : 'Beralih ke Dashboard Internal'}
                </span>
              </button>
            )}

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setCategoryFilter('All')}
                className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                  categoryFilter === 'All'
                    ? 'bg-white text-slate-800 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({modeSessions.length})
              </button>
              <button
                onClick={() => setCategoryFilter('Software')}
                className={`px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                  categoryFilter === 'Software'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Software</span>
              </button>
              <button
                onClick={() => setCategoryFilter('Hardware')}
                className={`px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                  categoryFilter === 'Hardware'
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Hardware</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Filters Row (Divisi, Date, Time) */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* 1. Filter Divisi / Department */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-indigo-600" />
              <span>Divisi Karyawan</span>
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium"
            >
              <option value="All">Semua Divisi</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filter Tahun */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span>Tahun</span>
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
            >
              <option value="All">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filter Bulan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-indigo-600" />
              <span>Bulan</span>
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
            >
              <option value="All">Semua Bulan</option>
              <option value="01">01 — Januari</option>
              <option value="02">02 — Februari</option>
              <option value="03">03 — Maret</option>
              <option value="04">04 — April</option>
              <option value="05">05 — Mei</option>
              <option value="06">06 — Juni</option>
              <option value="07">07 — Juli</option>
              <option value="08">08 — Agustus</option>
              <option value="09">09 — September</option>
              <option value="10">10 — Oktober</option>
              <option value="11">11 — November</option>
              <option value="12">12 — Desember</option>
            </select>
          </div>

          {/* 3. Filter Hari Dalam Seminggu */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-emerald-600" />
              <span>Hari</span>
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
            >
              <option value="All">Semua Hari</option>
              <option value="Senin">Senin</option>
              <option value="Selasa">Selasa</option>
              <option value="Rabu">Rabu</option>
              <option value="Kamis">Kamis</option>
              <option value="Jumat">Jumat</option>
              <option value="Sabtu">Sabtu</option>
              <option value="Minggu">Minggu</option>
            </select>
          </div>

          {/* 4. Filter Jam / Waktu Pelaksanaan */}
          <SpecificTimeFilter
            timeFilterType={timeFilterType}
            setTimeFilterType={setTimeFilterType}
            timeFilterMode={timeFilterMode}
            setTimeFilterMode={setTimeFilterMode}
            selectedTimes={selectedTimes}
            setSelectedTimes={setSelectedTimes}
            selectedTimeRangeStart={selectedTimeRangeStart}
            setSelectedTimeRangeStart={setSelectedTimeRangeStart}
            selectedTimeRangeEnd={selectedTimeRangeEnd}
            setSelectedTimeRangeEnd={setSelectedTimeRangeEnd}
            timeFreeText={timeFreeText}
            setTimeFreeText={setTimeFreeText}
          />

          {/* 5. Filter Tanggal Spesifik / Rentang Tanggal */}
          <SpecificDateFilter
            dateFilterType={dateFilterType}
            setDateFilterType={setDateFilterType}
            selectedExactDate={selectedExactDate}
            setSelectedExactDate={setSelectedExactDate}
            selectedStartDate={selectedStartDate}
            setSelectedStartDate={setSelectedStartDate}
            selectedEndDate={selectedEndDate}
            setSelectedEndDate={setSelectedEndDate}
          />
        </div>

        {/* Active Filter Indicator & Filter Badges Bar */}
        {isFiltered && (
          <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-indigo-600" /> Filter Aktif:
              </span>

              {categoryFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-2xs">
                  Modul: {categoryFilter}
                  <button onClick={() => setCategoryFilter('All')} className="hover:text-blue-900 cursor-pointer p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedDepartment !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-2xs">
                  Divisi: {selectedDepartment}
                  <button onClick={() => setSelectedDepartment('All')} className="hover:text-indigo-900 cursor-pointer p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedYear !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-2xs">
                  Tahun: {selectedYear}
                  <button onClick={() => setSelectedYear('All')} className="hover:text-emerald-900 cursor-pointer p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedMonth !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-2xs">
                  Bulan: {selectedMonth}
                  <button onClick={() => setSelectedMonth('All')} className="hover:text-amber-900 cursor-pointer p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedDay !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-2xs">
                  Hari: {selectedDay}
                  <button onClick={() => setSelectedDay('All')} className="hover:text-purple-900 cursor-pointer p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Advanced Time Filter Badges */}
              {timeFilterType === 'single' ? (
                timeFilterMode === 'interval' ? (
                  selectedTimes.length > 0 && (
                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-2xs">
                      Jam: {selectedTimes.map(t => `${t} WIB`).join(', ')}
                      <button onClick={() => setSelectedTimes([])} className="hover:text-orange-900 cursor-pointer p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                ) : (
                  timeFreeText.trim() !== '' && (
                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-2xs">
                      Jam: {timeFreeText}
                      <button onClick={() => setTimeFreeText('')} className="hover:text-orange-900 cursor-pointer p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                )
              ) : (
                (selectedTimeRangeStart || selectedTimeRangeEnd) && (
                  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-2xs">
                    Rentang Jam: {selectedTimeRangeStart || 'Awal'} s/d {selectedTimeRangeEnd || 'Akhir'}
                    <button
                      onClick={() => {
                        setSelectedTimeRangeStart('');
                        setSelectedTimeRangeEnd('');
                      }}
                      className="hover:text-orange-900 cursor-pointer p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              )}

              {dateFilterType === 'single' && selectedExactDate && (
                <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-2xs">
                  Tanggal: {selectedExactDate}
                  <button onClick={() => setSelectedExactDate('')} className="hover:text-pink-900 cursor-pointer p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {dateFilterType === 'range' && (selectedStartDate || selectedEndDate) && (
                <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-2xs">
                  Rentang: {selectedStartDate || 'Awal'} s/d {selectedEndDate || 'Akhir'}
                  <button
                    onClick={() => {
                      setSelectedStartDate('');
                      setSelectedEndDate('');
                    }}
                    className="hover:text-pink-900 cursor-pointer p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Menampilkan <strong className="text-slate-900 font-extrabold">{totalSessions}</strong> dari{' '}
              <span className="text-slate-700 font-bold">{modeSessions.length}</span> total sesi ({activeMode})
            </div>
          </div>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Sessions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{activeMode === 'Internal' ? 'Sesi Training Internal' : 'Sesi Training Eksternal'}</span>
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{totalSessions}</span>
            <span className="text-xs text-slate-500 ml-1">Sesi Ujian</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Software: <strong className="text-slate-700">{softwareFiltered.length}</strong></span>
            <span>Hardware: <strong className="text-slate-700">{hardwareFiltered.length}</strong></span>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{activeMode === 'Internal' ? 'Tingkat Kelulusan Tim' : 'Kesiapan Pitching & Demo'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{passRate}%</span>
            <span className="text-xs text-slate-500">({competentCount} Lulus/Kualifikasi)</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Soft Pass: <strong className="text-blue-600">{softwarePassRate}%</strong></span>
            <span>Hard Pass: <strong className="text-amber-600">{hardwarePassRate}%</strong></span>
          </div>
        </div>

        {/* Avg Final Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{activeMode === 'Internal' ? 'Rata-Rata Nilai Karyawan' : 'Rata-Rata Skor Pitching'}</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{avgFinal}</span>
            <span className="text-xs text-slate-500 ml-1">/ 100</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Bobot: 30% Teori, 40% Praktek, 30% Role-Play</span>
          </div>
        </div>

        {/* Avg N-Gain Index */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{activeMode === 'Internal' ? 'Efektivitas N-Gain' : 'Penyerapan Materi Klien'}</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600">{avgNGain}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              {avgNGain >= 0.7 ? 'Tinggi' : avgNGain >= 0.3 ? 'Sedang' : 'Rendah'}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Peningkatan dari Pre-Test ke Post-Test</span>
          </div>
        </div>

        {/* Remedial Alerts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{activeMode === 'Internal' ? 'Perlu Mentoring / Remedial' : 'Perlu Preparasi Ulang'}</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-red-600">{remedialCount}</span>
            <span className="text-xs text-slate-500 ml-1">Sesi</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Di bawah batas KKM / kualifikasi minimal</span>
          </div>
        </div>
      </div>

      {/* Mode-Specific Special Breakdown Section */}
      {activeMode === 'Internal' ? (
        /* Internal Division Breakdown Bar Chart */
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Matriks Performa Kompetensi per Divisi Karyawan (Sales Hardware, Sales Software, Sales Maritime, Telesales, Operation, Technician, CS, BizDev)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan rata-rata nilai akhir &amp; tingkat kelulusan tiap divisi internal perusahaan.
              </p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full border border-indigo-200 shrink-0">
              {deptChartData.length} Divisi Terdata
            </span>
          </div>

          <div className="h-64 w-full">
            {deptChartData.length === 0 ? (
              <div className="text-slate-400 text-xs text-center py-20">Tidak ada data divisi internal.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="NilaiRataRata" name="Nilai Rata-Rata Akhir" fill="#4338CA" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="KelulusanPercent" name="Tingkat Kelulusan (%)" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      ) : (
        /* Eksternal Target Audience Breakdown Bar Chart */
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Matriks Kualifikasi per Target Audien Eksternal (Pitching &amp; Customer)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Evaluasi performa demonstrasi produk berdasarkan segmen audien sasaran.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
              {audienceChartData.length} Segmen Audien Terdata
            </span>
          </div>

          <div className="h-64 w-full">
            {audienceChartData.length === 0 ? (
              <div className="text-slate-400 text-xs text-center py-20">Tidak ada data target audien eksternal.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={audienceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="NilaiRataRata" name="Skor Demonstrasi Rata-Rata" fill="#059669" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="KesiapanPercent" name="Tingkat Kesiapan Pitching (%)" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Pass vs Remedial Pie */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            {activeMode === 'Internal' ? 'Status Kelulusan Tim Internal' : 'Status Kualifikasi Sesi Eksternal'}
          </h3>
          <p className="text-xs text-slate-500 mb-4">Proporsi peserta Kompeten vs Belum Kompeten</p>
          <div className="h-72 w-full flex items-center justify-center">
            {totalSessions === 0 ? (
              <div className="text-slate-400 text-xs text-center py-10">Tidak ada data untuk filter ini.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={renderPieLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-6 text-xs mt-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Kompeten: <strong>{competentCount} Sesi</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-600">Remedial: <strong>{remedialCount} Sesi</strong></span>
            </div>
          </div>
        </div>

        {/* Chart 2: Category Component Averages Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Rata-Rata Nilai per Kategori Assessment (Teori, Praktek, Role-Play)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Perbandingan performa peserta pada ujian Teori, Tugas Praktek, dan Role-Play 1-on-1
          </p>
          <div className="h-72 w-full">
            {totalSessions === 0 ? (
              <div className="text-slate-400 text-xs text-center py-20">Tidak ada data untuk filter ini.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryAvgData} margin={{ top: 15, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                  <Bar dataKey="RataRata" name="Rata-Rata Keseluruhan" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Software" name="Produk Software" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Hardware" name="Produk Hardware" fill="#D97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Chart 3: Score Evolution Trend Chart Across Filtered Sessions */}
      {trendChartData.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Grafik Perubahan &amp; Distribusi Nilai per Sesi Assessment ({activeMode})
              </h3>
              <p className="text-xs text-slate-500">
                Setiap perubahan data nilai peserta langsung mengubah grafik ini secara dinamis.
              </p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold border border-indigo-200 shrink-0">
              {trendChartData.length} Sesi Terurut Waktu
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 15, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="sessionLabel"
                  tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                  angle={-30}
                  textAnchor="end"
                  height={65}
                  interval={0}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <Line type="monotone" dataKey="NilaiAkhir" name="Nilai Akhir" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="Teori" name="Teori" stroke="#3B82F6" strokeWidth={2} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="Praktek" name="Praktek" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="RolePlay" name="Role-Play" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Two Columns: Remedial Candidates & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Remedial Alerts Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-red-50/70 border-b border-red-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {activeMode === 'Internal' ? 'Daftar Karyawan Perlu Remedial' : 'Daftar Sesi Eksternal Perlu Preparasi Ulang'}
                </h3>
                <p className="text-xs text-slate-500">Peserta dengan Nilai Akhir di bawah batas Passing Grade (KKM)</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">
              {remedialSessions.length} Sesi
            </span>
          </div>

          <div className="p-4 flex-1 overflow-x-auto">
            {remedialSessions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                <span>Selamat! Semua sesi pada filter ini dinyatakan KOMPETEN &amp; LULUS.</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                    <th className="py-2.5 px-3">Peserta</th>
                    <th className="py-2.5 px-3">Produk &amp; Target Audien</th>
                    <th className="py-2.5 px-3">Teori / Praktek / Role-Play</th>
                    <th className="py-2.5 px-3 text-right">Nilai / KKM</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {remedialSessions.map((s) => {
                    const p = participantMap.get(s.participantId);
                    const prod = productMap.get(s.productId);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">{p?.name || 'Peserta'}</p>
                          <p className="text-[10px] text-slate-500">{p?.department || p?.nip}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-800">{prod?.name || s.productId}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                            {s.targetAudience || prod?.targetAudience || 'Target Audien'}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-600">
                          <div>T: <strong className="text-slate-800">{s.teoriScore}</strong> | P: <strong className="text-slate-800">{s.praktekScore}</strong> | R: <strong className="text-slate-800">{s.rolePlayScore}</strong></div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="font-bold text-red-600">{s.finalScore}</span>
                          <span className="text-[10px] text-slate-400"> / {s.kkmThreshold}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => onOpenReport(s)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] underline cursor-pointer"
                          >
                            Rapor
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Performers Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-emerald-50/70 border-b border-emerald-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {activeMode === 'Internal' ? 'Karyawan Performa Terbaik (Top Achievers)' : 'Sesi Pitching & Demo Terbaik'}
                </h3>
                <p className="text-xs text-slate-500">Peringkat performa terbaik dalam penguasaan kompetensi</p>
              </div>
            </div>
            <button
              onClick={onNavigateToSessions}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Peserta</th>
                  <th className="py-2.5 px-3">Produk &amp; Target</th>
                  <th className="py-2.5 px-3">N-Gain</th>
                  <th className="py-2.5 px-3 text-right">Nilai Akhir</th>
                  <th className="py-2.5 px-3 text-center">Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topSessions.map((s, idx) => {
                  const p = participantMap.get(s.participantId);
                  const prod = productMap.get(s.productId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              idx === 0
                                ? 'bg-amber-400 text-amber-950'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-800'
                                : idx === 2
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{p?.name || 'Peserta'}</p>
                            <p className="text-[10px] text-slate-500">{p?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-800">{prod?.name || s.productId}</p>
                        <span className="text-[10px] text-slate-500 truncate max-w-[120px] block">
                          {s.targetAudience || prod?.targetAudience || s.productCategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px] border border-purple-200">
                          +{s.nGainScore}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-600 text-sm">
                        {s.finalScore}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                          {s.qualitativeGrade.slice(0, 1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
