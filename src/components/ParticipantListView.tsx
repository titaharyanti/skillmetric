import React, { useState } from 'react';
import { SpecificDateFilter } from './SpecificDateFilter';
import {
  Participant,
  ProductCategory,
  TrainingProduct,
  TrainingSession,
  AppSettings,
} from '../types';
import { formatDateIndonesian } from '../utils/calculations';
import { ExportReportModal } from './ExportReportModal';
import { ImportExcelModal, ImportType } from './ImportExcelModal';
import {
  Search,
  Filter,
  Plus,
  FileText,
  User,
  Cpu,
  Laptop,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  UserCheck,
  Award,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  Mail,
  Phone,
  Building2,
  BookOpen,
  Lock,
  Eye,
  RotateCcw,
  CalendarDays,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';

interface ParticipantListViewProps {
  participants: Participant[];
  sessions: TrainingSession[];
  products: TrainingProduct[];
  settings: AppSettings;
  onOpenReport: (session: TrainingSession) => void;
  onNewSessionForParticipant: (participantId: string) => void;
  onAddNewParticipant: () => void;
  onEditParticipant: (participant: Participant) => void;
  onDeleteSession: (sessionId: string) => void;
  onDeleteParticipant: (participantId: string) => void;
  isAdmin: boolean;
  onRequireAdmin: (msg?: string, pendingAction?: () => void) => void;
  onImportParticipants: (newParticipants: Participant[]) => void;
  onImportProducts: (newProducts: TrainingProduct[]) => void;
  onImportSessions: (newSessions: TrainingSession[]) => void;
}

export const ParticipantListView: React.FC<ParticipantListViewProps> = ({
  participants,
  sessions,
  products,
  settings,
  onOpenReport,
  onNewSessionForParticipant,
  onAddNewParticipant,
  onEditParticipant,
  onDeleteSession,
  onDeleteParticipant,
  isAdmin,
  onRequireAdmin,
  onImportParticipants,
  onImportProducts,
  onImportSessions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Kompeten' | 'Belum Kompeten'>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ProductCategory>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [dateFilterType, setDateFilterType] = useState<'single' | 'range'>('single');
  const [selectedExactDate, setSelectedExactDate] = useState<string>('');
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc'>('date-desc');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportExcelOpen, setIsImportExcelOpen] = useState(false);
  const [importExcelType, setImportExcelType] = useState<ImportType>('participants');

  const [expandedParticipantIds, setExpandedParticipantIds] = useState<string[]>(
    participants.map((p) => p.id) // Expand all by default
  );

  const productMap = new Map<string, TrainingProduct>(products.map((p) => [p.id, p]));

  // Derive available years
  const availableYears = Array.from(
    new Set(
      sessions
        .map((s) => (s.date ? s.date.slice(0, 4) : ''))
        .filter(Boolean)
    )
  ).sort().reverse();

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setSelectedYear('All');
    setSelectedMonth('All');
    setSelectedDay('All');
    setDateFilterType('single');
    setSelectedExactDate('');
    setSelectedStartDate('');
    setSelectedEndDate('');
    setSelectedTimeRange('All');
    setSortBy('date-desc');
  };

  const isFiltered =
    searchTerm !== '' ||
    statusFilter !== 'All' ||
    categoryFilter !== 'All' ||
    selectedYear !== 'All' ||
    selectedMonth !== 'All' ||
    selectedDay !== 'All' ||
    (dateFilterType === 'single' && selectedExactDate !== '') ||
    (dateFilterType === 'range' && (selectedStartDate !== '' || selectedEndDate !== '')) ||
    selectedTimeRange !== 'All';

  const toggleExpand = (id: string) => {
    setExpandedParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Helper session filter function
  const isSessionMatchingFilters = (s: TrainingSession) => {
    if (categoryFilter !== 'All' && s.productCategory !== categoryFilter) return false;
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (selectedYear !== 'All' && (!s.date || !s.date.startsWith(selectedYear))) return false;
    if (selectedMonth !== 'All' && (!s.date || s.date.split('-')[1] !== selectedMonth)) return false;
    if (selectedDay !== 'All' && s.day !== selectedDay) return false;

    // Date Filtering: Single Date vs Range Date
    if (dateFilterType === 'single') {
      if (selectedExactDate && s.date !== selectedExactDate) return false;
    } else {
      if (selectedStartDate && (!s.date || s.date < selectedStartDate)) return false;
      if (selectedEndDate && (!s.date || s.date > selectedEndDate)) return false;
    }

    if (selectedTimeRange !== 'All') {
      const start = s.startTime || '00:00';
      if (selectedTimeRange === 'pagi' && !(start >= '06:00' && start < '12:00')) return false;
      if (selectedTimeRange === 'siang' && !(start >= '12:00' && start < '15:00')) return false;
      if (selectedTimeRange === 'sore' && !(start >= '15:00' && start <= '21:00')) return false;
      if (
        !['pagi', 'siang', 'sore'].includes(selectedTimeRange) &&
        !start.startsWith(selectedTimeRange)
      ) {
        return false;
      }
    }

    return true;
  };

  // Filter logic
  const filteredParticipants = participants.filter((p) => {
    const participantSessions = sessions.filter((s) => s.participantId === p.id);

    // Search term check
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participantSessions.some((s) => {
        const prod = productMap.get(s.productId);
        return (
          prod?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.trainerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });

    if (!matchesSearch) return false;

    // If date/time/category/status filters are active, ensure participant has at least one matching session or fits criteria
    if (isFiltered) {
      if (participantSessions.length > 0) {
        const hasMatchingSession = participantSessions.some(isSessionMatchingFilters);
        if (!hasMatchingSession) return false;
      }
    }

    return true;
  });

  // Sort participants
  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    const aSessions = sessions.filter((s) => s.participantId === a.id);
    const bSessions = sessions.filter((s) => s.participantId === b.id);

    const aLatestDate = aSessions.map((s) => s.date).sort().reverse()[0] || '';
    const bLatestDate = bSessions.map((s) => s.date).sort().reverse()[0] || '';

    const aAvgScore =
      aSessions.length > 0
        ? aSessions.reduce((sum, s) => sum + s.finalScore, 0) / aSessions.length
        : 0;
    const bAvgScore =
      bSessions.length > 0
        ? bSessions.reduce((sum, s) => sum + s.finalScore, 0) / bSessions.length
        : 0;

    switch (sortBy) {
      case 'date-desc':
        return bLatestDate.localeCompare(aLatestDate);
      case 'date-asc':
        return aLatestDate.localeCompare(bLatestDate);
      case 'score-desc':
        return bAvgScore - aAvgScore;
      case 'score-asc':
        return aAvgScore - bAvgScore;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Akses Peserta (View Only):</strong> Anda dapat melihat seluruh hasil nilai &amp; mencetak Rapor / Sertifikat. Akses Tambah, Edit, dan Hapus data memerlukan otorisasi Admin.
            </span>
          </div>
          <button
            onClick={() => onRequireAdmin('Masuk Mode Admin untuk melakukan pengelolaan data peserta.')}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>Login Admin</span>
          </button>
        </div>
      )}

      {/* Top Header & Search Control Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Data Peserta &amp; Riwayat Assessment Training
            </h2>
            <p className="text-xs text-slate-500">
              Kelola peserta, jadwal training, dan hasil evaluasi kompetensi secara mendalam.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Rekap (Excel/CSV)</span>
            </button>

            <button
              onClick={() => {
                if (!isAdmin) {
                  onRequireAdmin('Akses Admin diperlukan untuk mengimpor data dari file Excel.', () => {
                    setImportExcelType('participants');
                    setIsImportExcelOpen(true);
                  });
                } else {
                  setImportExcelType('participants');
                  setIsImportExcelOpen(true);
                }
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Impor Excel</span>
            </button>

            <button
              onClick={() => {
                if (!isAdmin) {
                  onRequireAdmin('Akses Admin diperlukan untuk menambah data peserta baru.', onAddNewParticipant);
                } else {
                  onAddNewParticipant();
                }
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              {isAdmin ? <Plus className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
              <span>Tambah Peserta Baru</span>
            </button>
          </div>
        </div>

        {/* Search & Main Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama peserta, NIP, departemen, atau produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-slate-700"
            >
              <option value="All">Semua Status Kompetensi</option>
              <option value="Kompeten">Kompeten (Lulus KKM)</option>
              <option value="Belum Kompeten">Belum Kompeten (Remedial)</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-slate-700"
            >
              <option value="date-desc">Urutkan: Tanggal Terbaru</option>
              <option value="date-asc">Urutkan: Tanggal Terlama</option>
              <option value="score-desc">Urutkan: Nilai Akhir Tertinggi</option>
              <option value="score-asc">Urutkan: Nilai Akhir Terendah</option>
              <option value="name-asc">Urutkan: Nama Peserta (A - Z)</option>
              <option value="name-desc">Urutkan: Nama Peserta (Z - A)</option>
            </select>
          </div>
        </div>

        {/* Sub-Filters for Date, Time, Day, Category, Tanggal Spesifik / Rentang */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kategori Produk</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
            >
              <option value="All">Semua Kategori</option>
              <option value="Software">Software Only</option>
              <option value="Hardware">Hardware Only</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
            >
              <option value="All">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
            >
              <option value="All">Semua Bulan</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          {/* Day */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hari</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
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

          {/* Time Range */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam / Waktu</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
            >
              <option value="All">Semua Jam</option>
              <option value="pagi">Pagi (06:00-12:00)</option>
              <option value="siang">Siang (12:00-15:00)</option>
              <option value="sore">Sore (15:00-21:00)</option>
              <option value="08">Jam 08:00</option>
              <option value="09">Jam 09:00</option>
              <option value="10">Jam 10:00</option>
              <option value="13">Jam 13:00</option>
            </select>
          </div>

          {/* Date Range / Single Date Filter */}
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
      </div>

      {/* Participant Accordion List */}
      <div className="space-y-4">
        {sortedParticipants.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 space-y-3">
            <User className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold">Tidak ada data peserta yang cocok dengan kriteria filter.</p>
            <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian, sesuaikan filter tanggal/waktu, atau tambah peserta baru.</p>
          </div>
        ) : (
          sortedParticipants.map((p) => {
            const rawSessions = sessions.filter((s) => s.participantId === p.id);
            const pSessions = isFiltered ? rawSessions.filter(isSessionMatchingFilters) : rawSessions;
            const isExpanded = expandedParticipantIds.includes(p.id);

            const passedSessionsCount = pSessions.filter((s) => s.status === 'Kompeten').length;
            const avgParticipantScore =
              pSessions.length > 0
                ? Math.round((pSessions.reduce((acc, s) => acc + s.finalScore, 0) / pSessions.length) * 10) / 10
                : 0;

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all"
              >
                {/* Participant Header Card Bar */}
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                      {p.name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                          {p.nip}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {p.department} ({p.role})
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {p.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {p.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Actions */}
                  <div className="flex items-center gap-3 justify-between md:justify-end border-t md:border-t-0 border-slate-200 pt-3 md:pt-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium">
                        {pSessions.length} Training Diikuti
                      </span>
                      {pSessions.length > 0 && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium">
                          Rata-Rata: {avgParticipantScore}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!isAdmin) {
                            onRequireAdmin('Akses Admin diperlukan untuk menambah sesi training baru.', () =>
                              onNewSessionForParticipant(p.id)
                            );
                          } else {
                            onNewSessionForParticipant(p.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        title="Tambah sesi assessment training baru untuk peserta ini"
                      >
                        {isAdmin ? <Plus className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3 text-amber-300" />}
                        <span>+ Sesi Training</span>
                      </button>

                      <button
                        onClick={() => {
                          if (!isAdmin) {
                            onRequireAdmin('Akses Admin diperlukan untuk mengedit data peserta.', () =>
                              onEditParticipant(p)
                            );
                          } else {
                            onEditParticipant(p);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
                        title="Edit Profil Peserta"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (!isAdmin) {
                            onRequireAdmin('Akses Admin diperlukan untuk menghapus peserta.', () =>
                              onDeleteParticipant(p.id)
                            );
                          } else {
                            onDeleteParticipant(p.id);
                          }
                        }}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Peserta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleExpand(p.id)}
                        className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Session Cards Container */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-50/30 space-y-4">
                    {pSessions.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs space-y-2">
                        <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                        <p>Peserta ini belum memiliki sesi assessment training terdaftar.</p>
                        <button
                          onClick={() => {
                            if (!isAdmin) {
                              onRequireAdmin('Akses Admin diperlukan untuk mendaftarkan sesi training baru.', () =>
                                onNewSessionForParticipant(p.id)
                              );
                            } else {
                              onNewSessionForParticipant(p.id);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline cursor-pointer"
                        >
                          {isAdmin ? <Plus className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3 text-amber-500" />}
                          <span>Daftarkan ke Sesi Training Baru</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {pSessions.map((session) => {
                          const prod = productMap.get(session.productId);

                          return (
                            <div
                              key={session.id}
                              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-blue-300 transition-all space-y-3"
                            >
                              {/* Session Top Info Bar */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${
                                      session.productCategory === 'Software'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-amber-600 text-white shadow-xs'
                                    }`}
                                  >
                                    {session.productCategory === 'Software' ? (
                                      <Laptop className="w-3.5 h-3.5" />
                                    ) : (
                                      <Cpu className="w-3.5 h-3.5" />
                                    )}
                                    <span>{session.productCategory}</span>
                                  </span>

                                  <div>
                                    <h4 className="font-bold text-slate-900 text-sm">
                                      {prod?.name || 'Produk Training'}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 font-mono">{prod?.code}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Status Badge */}
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                                      session.status === 'Kompeten'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : 'bg-red-50 text-red-700 border-red-300'
                                    }`}
                                  >
                                    {session.status === 'Kompeten' ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-600" />
                                    )}
                                    <span>{session.status}</span>
                                  </span>

                                  {/* Rapor Button */}
                                  <button
                                    onClick={() => onOpenReport(session)}
                                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Cetak Rapor / Sertifikat</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (!isAdmin) {
                                        onRequireAdmin('Akses Admin diperlukan untuk menghapus sesi training.', () =>
                                          onDeleteSession(session.id)
                                        );
                                      } else {
                                        onDeleteSession(session.id);
                                      }
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                    title="Hapus Sesi"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Schedule & Trainer Information */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                  <span>
                                    <strong>{session.day}</strong>, {formatDateIndonesian(session.date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Pukul {session.startTime} - {session.endTime} WIB</span>
                                </div>
                                <div className="flex items-center gap-2 sm:col-span-1">
                                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="truncate">Trainer: <strong>{session.trainerName}</strong></span>
                                </div>
                              </div>

                              {/* Assessment Component Score Grid (Teori, Praktek, Role-Play) */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                                {/* Teori */}
                                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-center">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                    Teori ({session.appliedWeights?.teoriWeight || 30}%)
                                  </span>
                                  <span className="text-base font-extrabold text-slate-800">
                                    {session.teoriScore}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">/ 100</span>
                                </div>

                                {/* Praktek */}
                                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-center">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                    Praktek ({session.appliedWeights?.praktekWeight || 40}%)
                                  </span>
                                  <span className="text-base font-extrabold text-blue-700">
                                    {session.praktekScore}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">/ 100</span>
                                </div>

                                {/* Role-Play */}
                                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-center">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                    Role-Play 1-on-1 ({session.appliedWeights?.rolePlayWeight || 30}%)
                                  </span>
                                  <span className="text-base font-extrabold text-purple-700">
                                    {session.rolePlayScore}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">/ 100</span>
                                </div>

                                {/* Final Score & N-Gain */}
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-2.5 rounded-lg text-center flex flex-col justify-center">
                                  <span className="text-[10px] text-slate-300 uppercase font-semibold">
                                    Nilai Akhir
                                  </span>
                                  <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-lg font-black text-amber-300">
                                      {session.finalScore}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      (KKM: {session.kkmThreshold})
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-emerald-300 font-mono mt-0.5">
                                    N-Gain: +{session.nGainScore} ({session.nGainCategory})
                                  </span>
                                </div>
                              </div>

                              {/* Feedback / Evaluator Notes */}
                              {session.evaluatorFeedback && (
                                <p className="text-xs text-slate-600 bg-amber-50/60 border-l-2 border-amber-400 p-2 rounded-r italic">
                                  Catatan Evaluator: "{session.evaluatorFeedback}"
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

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
