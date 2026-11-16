import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Participant, TrainingProduct, TrainingSession, DEPARTMENT_OPTIONS } from '../types';
import {
  X,
  FileSpreadsheet,
  FileCode2,
  Check,
  CheckSquare,
  Square,
  Sliders,
  Download,
  Filter,
  Calendar,
  Users,
  User,
  Award,
  RefreshCw,
  Boxes,
  UserCheck,
  ChevronDown,
  Search,
} from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: TrainingSession[];
  participants: Participant[];
  products: TrainingProduct[];
  trainers?: string[];
}

interface ColumnOption {
  key: string;
  label: string;
  category: 'peserta' | 'produk' | 'jadwal' | 'nilai';
  isDefault: boolean;
}

const ALL_COLUMNS: ColumnOption[] = [
  // Peserta
  { key: 'id', label: 'ID Sesi Assessment', category: 'peserta', isDefault: true },
  { key: 'nip', label: 'NIP Peserta', category: 'peserta', isDefault: true },
  { key: 'name', label: 'Nama Peserta', category: 'peserta', isDefault: true },
  { key: 'department', label: 'Departemen / Divisi', category: 'peserta', isDefault: true },
  { key: 'role', label: 'Jabatan Peserta', category: 'peserta', isDefault: false },

  // Produk
  { key: 'productCategory', label: 'Kategori Produk (Software/Hardware)', category: 'produk', isDefault: true },
  { key: 'productCode', label: 'Kode Produk', category: 'produk', isDefault: true },
  { key: 'productName', label: 'Nama Produk Training', category: 'produk', isDefault: true },

  // Jadwal & Penguji
  { key: 'date', label: 'Tanggal Training', category: 'jadwal', isDefault: true },
  { key: 'day', label: 'Hari Execution', category: 'jadwal', isDefault: true },
  { key: 'time', label: 'Jam / Waktu Execution', category: 'jadwal', isDefault: true },
  { key: 'trainer', label: 'Nama Trainer / Penguji', category: 'jadwal', isDefault: true },

  // Nilai & Evaluasi
  { key: 'preTest', label: 'Nilai Pre-Test', category: 'nilai', isDefault: true },
  { key: 'postTest', label: 'Nilai Post-Test', category: 'nilai', isDefault: true },
  { key: 'nGainScore', label: 'N-Gain Index Score', category: 'nilai', isDefault: true },
  { key: 'nGainCategory', label: 'Kategori N-Gain', category: 'nilai', isDefault: true },
  { key: 'teoriScore', label: 'Nilai Ujian Teori', category: 'nilai', isDefault: true },
  { key: 'praktekScore', label: 'Nilai Tugas Praktek', category: 'nilai', isDefault: true },
  { key: 'rolePlayScore', label: 'Nilai Role-Play 1-on-1', category: 'nilai', isDefault: true },
  { key: 'finalScore', label: 'Nilai Akhir Kumulatif', category: 'nilai', isDefault: true },
  { key: 'kkm', label: 'Passing Grade (KKM)', category: 'nilai', isDefault: true },
  { key: 'status', label: 'Status Kelulusan Kompetensi', category: 'nilai', isDefault: true },
  { key: 'grade', label: 'Predikat Kualitatif', category: 'nilai', isDefault: true },
];

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  sessions,
  participants,
  products,
  trainers = [],
}) => {
  const [fileFormat, setFileFormat] = useState<'excel' | 'csv'>('excel');
  const [exportMode, setExportMode] = useState<'default' | 'custom'>('default');

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Software' | 'Hardware'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Kompeten' | 'Belum Kompeten'>('All');
  
  // Department multi-select
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState<boolean>(false);
  const [departmentSearch, setDepartmentSearch] = useState<string>('');

  // Participant multi-select
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [isParticipantDropdownOpen, setIsParticipantDropdownOpen] = useState<boolean>(false);
  const [participantSearch, setParticipantSearch] = useState<string>('');

  // Product multi-select
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<string>('');

  // Trainer multi-select
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);
  const [isTrainerDropdownOpen, setIsTrainerDropdownOpen] = useState<boolean>(false);
  const [trainerSearch, setTrainerSearch] = useState<string>('');

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Selected column keys state
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    ALL_COLUMNS.filter((c) => c.isDefault).map((c) => c.key)
  );

  if (!isOpen) return null;

  const participantMap = new Map<string, Participant>(participants.map((p) => [p.id, p]));
  const productMap = new Map<string, TrainingProduct>(products.map((pr) => [pr.id, pr]));

  // Lists for dropdown options
  const uniqueDepartments = DEPARTMENT_OPTIONS;

  // Searched departments inside dropdown
  const searchedDepartments = uniqueDepartments.filter((dept) =>
    dept.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  // Department selection helper functions
  const isDepartmentChecked = (dept: string): boolean => {
    if (selectedDepartments.includes('__NONE__')) return false;
    if (selectedDepartments.length === 0) return true;
    return selectedDepartments.includes(dept);
  };

  const toggleDepartmentSelection = (dept: string) => {
    setSelectedParticipantIds([]); // reset participant filter when department changes
    if (selectedDepartments.includes('__NONE__')) {
      setSelectedDepartments([dept]);
      return;
    }
    if (selectedDepartments.length === 0) {
      const next = uniqueDepartments.filter((d) => d !== dept);
      setSelectedDepartments(next.length === 0 ? ['__NONE__'] : next);
      return;
    }
    if (selectedDepartments.includes(dept)) {
      const next = selectedDepartments.filter((d) => d !== dept);
      setSelectedDepartments(next.length === 0 ? ['__NONE__'] : next);
    } else {
      const next = [...selectedDepartments, dept];
      setSelectedDepartments(next.length === uniqueDepartments.length ? [] : next);
    }
  };

  const handleSelectAllDepartments = () => {
    setSelectedDepartments([]);
    setSelectedParticipantIds([]);
  };

  const handleClearAllDepartments = () => {
    setSelectedDepartments(['__NONE__']);
    setSelectedParticipantIds([]);
  };

  // Filter participants by selected department(s) if specific department(s) are chosen
  const availableParticipants = selectedDepartments.includes('__NONE__')
    ? []
    : selectedDepartments.length === 0
    ? participants
    : participants.filter((p) => selectedDepartments.includes(p.department));

  // Search filtered participants inside the dropdown
  const searchedParticipants = availableParticipants.filter((p) => {
    if (!participantSearch.trim()) return true;
    const q = participantSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.nip && p.nip.toLowerCase().includes(q)) ||
      (p.department && p.department.toLowerCase().includes(q)) ||
      (p.role && p.role.toLowerCase().includes(q))
    );
  });

  // Participant selection helper functions
  const isParticipantChecked = (pId: string): boolean => {
    if (selectedParticipantIds.includes('__NONE__')) return false;
    if (selectedParticipantIds.length === 0) return true;
    return selectedParticipantIds.includes(pId);
  };

  const toggleParticipantSelection = (pId: string) => {
    if (selectedParticipantIds.includes('__NONE__')) {
      setSelectedParticipantIds([pId]);
      return;
    }

    if (selectedParticipantIds.length === 0) {
      // Unchecking one when all were selected
      const next = availableParticipants.map((p) => p.id).filter((id) => id !== pId);
      setSelectedParticipantIds(next.length === 0 ? ['__NONE__'] : next);
      return;
    }

    if (selectedParticipantIds.includes(pId)) {
      const next = selectedParticipantIds.filter((id) => id !== pId);
      setSelectedParticipantIds(next.length === 0 ? ['__NONE__'] : next);
    } else {
      const next = [...selectedParticipantIds, pId];
      setSelectedParticipantIds(next.length === availableParticipants.length ? [] : next);
    }
  };

  const handleSelectAllParticipants = () => {
    setSelectedParticipantIds([]); // empty array means All selected
  };

  const handleClearAllParticipants = () => {
    setSelectedParticipantIds(['__NONE__']);
  };

  // Product selection helper functions
  const searchedProducts = products.filter((prod) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      prod.name.toLowerCase().includes(q) ||
      prod.code.toLowerCase().includes(q) ||
      (prod.category && prod.category.toLowerCase().includes(q))
    );
  });

  const isProductChecked = (prodId: string): boolean => {
    if (selectedProductIds.includes('__NONE__')) return false;
    if (selectedProductIds.length === 0) return true;
    return selectedProductIds.includes(prodId);
  };

  const toggleProductSelection = (prodId: string) => {
    if (selectedProductIds.includes('__NONE__')) {
      setSelectedProductIds([prodId]);
      return;
    }
    if (selectedProductIds.length === 0) {
      const next = products.map((p) => p.id).filter((id) => id !== prodId);
      setSelectedProductIds(next.length === 0 ? ['__NONE__'] : next);
      return;
    }
    if (selectedProductIds.includes(prodId)) {
      const next = selectedProductIds.filter((id) => id !== prodId);
      setSelectedProductIds(next.length === 0 ? ['__NONE__'] : next);
    } else {
      const next = [...selectedProductIds, prodId];
      setSelectedProductIds(next.length === products.length ? [] : next);
    }
  };

  const handleSelectAllProducts = () => {
    setSelectedProductIds([]);
  };

  const handleClearAllProducts = () => {
    setSelectedProductIds(['__NONE__']);
  };

  // Only trainers from Settings
  const uniqueTrainers = Array.from(
    new Set((trainers && trainers.length > 0 ? trainers : []).filter(Boolean))
  ).sort();

  const searchedTrainers = uniqueTrainers.filter((tr) =>
    tr.toLowerCase().includes(trainerSearch.toLowerCase())
  );

  const isTrainerChecked = (trName: string): boolean => {
    if (selectedTrainers.includes('__NONE__')) return false;
    if (selectedTrainers.length === 0) return true;
    return selectedTrainers.includes(trName);
  };

  const toggleTrainerSelection = (trName: string) => {
    if (selectedTrainers.includes('__NONE__')) {
      setSelectedTrainers([trName]);
      return;
    }
    if (selectedTrainers.length === 0) {
      const next = uniqueTrainers.filter((t) => t !== trName);
      setSelectedTrainers(next.length === 0 ? ['__NONE__'] : next);
      return;
    }
    if (selectedTrainers.includes(trName)) {
      const next = selectedTrainers.filter((t) => t !== trName);
      setSelectedTrainers(next.length === 0 ? ['__NONE__'] : next);
    } else {
      const next = [...selectedTrainers, trName];
      setSelectedTrainers(next.length === uniqueTrainers.length ? [] : next);
    }
  };

  const handleSelectAllTrainers = () => {
    setSelectedTrainers([]);
  };

  const handleClearAllTrainers = () => {
    setSelectedTrainers(['__NONE__']);
  };

  // Filter sessions based on all selected criteria
  const filteredSessions = sessions.filter((s) => {
    if (categoryFilter !== 'All' && s.productCategory !== categoryFilter) return false;
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;

    // 1. Department filter
    if (selectedDepartments.includes('__NONE__')) return false;
    if (selectedDepartments.length > 0) {
      const p = participantMap.get(s.participantId);
      if (!p || !selectedDepartments.includes(p.department)) return false;
    }

    // 2. Participant filter
    if (selectedParticipantIds.includes('__NONE__')) return false;
    if (selectedParticipantIds.length > 0) {
      if (!selectedParticipantIds.includes(s.participantId)) return false;
    }

    // 3. Product filter
    if (selectedProductIds.includes('__NONE__')) return false;
    if (selectedProductIds.length > 0) {
      if (!selectedProductIds.includes(s.productId)) return false;
    }

    // 4. Trainer filter
    if (selectedTrainers.includes('__NONE__')) return false;
    if (selectedTrainers.length > 0) {
      if (!selectedTrainers.includes(s.trainerName)) return false;
    }

    if (startDate && s.date < startDate) return false;
    if (endDate && s.date > endDate) return false;

    return true;
  });

  const isFilterActive =
    categoryFilter !== 'All' ||
    statusFilter !== 'All' ||
    selectedDepartments.length > 0 ||
    selectedParticipantIds.length > 0 ||
    selectedProductIds.length > 0 ||
    selectedTrainers.length > 0 ||
    Boolean(startDate) ||
    Boolean(endDate);

  const handleResetFilters = () => {
    setCategoryFilter('All');
    setStatusFilter('All');
    setSelectedDepartments([]);
    setSelectedParticipantIds([]);
    setSelectedProductIds([]);
    setSelectedTrainers([]);
    setStartDate('');
    setEndDate('');
  };

  const toggleColumnKey = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    setSelectedKeys(ALL_COLUMNS.map((c) => c.key));
  };

  const handleSelectDefault = () => {
    setSelectedKeys(ALL_COLUMNS.filter((c) => c.isDefault).map((c) => c.key));
  };

  const handleDeselectAll = () => {
    setSelectedKeys([]);
  };

  // Determine active columns based on mode
  const activeColumns =
    exportMode === 'default'
      ? ALL_COLUMNS.filter((c) => c.isDefault)
      : ALL_COLUMNS.filter((c) => selectedKeys.includes(c.key));

  const handleExport = () => {
    if (activeColumns.length === 0) {
      alert('Pilih minimal satu kolom data untuk di-ekspor.');
      return;
    }

    const headers = activeColumns.map((c) => c.label);

    const rows = filteredSessions.map((s) => {
      const p = participantMap.get(s.participantId) || { name: 'Unknown', nip: '-', department: '-', role: '-' };
      const prod = productMap.get(s.productId) || { name: 'Unknown', category: s.productCategory, code: '-' };

      const rowMap: Record<string, any> = {
        id: s.id,
        nip: p.nip,
        name: p.name,
        department: p.department,
        role: p.role || '-',
        productCategory: s.productCategory,
        productCode: prod.code,
        productName: prod.name,
        date: s.date,
        day: s.day,
        time: `${s.startTime} - ${s.endTime}`,
        trainer: s.trainerName,
        preTest: s.preTestScore,
        postTest: s.postTestScore,
        nGainScore: s.nGainScore,
        nGainCategory: s.nGainCategory,
        teoriScore: s.teoriScore,
        praktekScore: s.praktekScore,
        rolePlayScore: s.rolePlayScore,
        finalScore: s.finalScore,
        kkm: s.kkmThreshold,
        status: s.status,
        grade: s.qualitativeGrade,
      };

      return activeColumns.map((c) => rowMap[c.key] ?? '');
    });

    const dateStr = new Date().toISOString().slice(0, 10);

    if (fileFormat === 'excel') {
      // Create Workbook & Worksheet with XLSX
      const worksheetData = [headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Auto width calculation for columns
      const colWidths = headers.map((h, i) => {
        let maxLen = h.length;
        rows.forEach((r) => {
          const val = String(r[i] ?? '');
          if (val.length > maxLen) maxLen = val.length;
        });
        return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
      });
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Assessment');
      XLSX.writeFile(workbook, `Rekap_Assessment_Training_${dateStr}.xlsx`);
    } else {
      // CSV Export logic
      const csvLines = [
        headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
        ...rows.map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')
        ),
      ];
      const csvContent = '\uFEFF' + csvLines.join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `Rekap_Assessment_Training_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Ekspor Rekap Laporan Assessment</h3>
              <p className="text-xs text-slate-400">
                Pilih format berkas dan kustomisasi kolom data yang ingin di-ekspor.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Pilihan Format File */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              1. Format Berkas Ekspor
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Excel */}
              <button
                type="button"
                onClick={() => setFileFormat('excel')}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  fileFormat === 'excel'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg ${
                    fileFormat === 'excel' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Microsoft Excel (.xlsx)</div>
                  <div className="text-[11px] text-slate-500">
                    Format spreadsheet standar dengan kolom rapi
                  </div>
                </div>
              </button>

              {/* CSV */}
              <button
                type="button"
                onClick={() => setFileFormat('csv')}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  fileFormat === 'csv'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg ${
                    fileFormat === 'csv' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Comma Separated (.csv)</div>
                  <div className="text-[11px] text-slate-500">
                    Format teks universal kompatibel UTF-8
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Filter Data Ekspor */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>2. Filter Data Ekspor</span>
              </label>

              {isFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Semua Filter</span>
                </button>
              )}
            </div>

            {/* Filter Group 1: Category & Status Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kategori Produk:</span>
                </label>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('All')}
                    className={`flex-1 py-1 rounded text-center font-medium transition-all cursor-pointer ${
                      categoryFilter === 'All'
                        ? 'bg-slate-800 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('Software')}
                    className={`flex-1 py-1 rounded text-center font-medium transition-all cursor-pointer ${
                      categoryFilter === 'Software'
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Software
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('Hardware')}
                    className={`flex-1 py-1 rounded text-center font-medium transition-all cursor-pointer ${
                      categoryFilter === 'Hardware'
                        ? 'bg-amber-600 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hardware
                  </button>
                </div>
              </div>

              {/* Competency Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Status Kelulusan:</span>
                </label>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('All')}
                    className={`flex-1 py-1 rounded text-center font-medium transition-all cursor-pointer ${
                      statusFilter === 'All'
                        ? 'bg-slate-800 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('Kompeten')}
                    className={`flex-1 py-1 rounded text-center font-medium transition-all cursor-pointer ${
                      statusFilter === 'Kompeten'
                        ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kompeten
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('Belum Kompeten')}
                    className={`flex-1 py-1 rounded text-center font-medium transition-all cursor-pointer ${
                      statusFilter === 'Belum Kompeten'
                        ? 'bg-rose-600 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Belum
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Group 2: Department, Participant, Product, Trainer Multi-Select Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              {/* 1. Multi-Select Department / Divisi Filter */}
              <div className="space-y-1 relative">
                <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Divisi ({uniqueDepartments.length}):</span>
                  </span>
                  {selectedDepartments.length > 0 && !selectedDepartments.includes('__NONE__') && (
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                      {selectedDepartments.length} Terpilih
                    </span>
                  )}
                </label>

                {/* Main Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsDepartmentDropdownOpen((prev) => !prev)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <span className="truncate pr-1 text-left">
                    {selectedDepartments.includes('__NONE__')
                      ? '0 Divisi Terpilih'
                      : selectedDepartments.length === 0 ||
                        selectedDepartments.length === uniqueDepartments.length
                      ? `Semua Divisi (${uniqueDepartments.length})`
                      : `${selectedDepartments.length} dari ${uniqueDepartments.length} Divisi`}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform shrink-0 ${
                      isDepartmentDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Panel */}
                {isDepartmentDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsDepartmentDropdownOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 w-64 sm:w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                      {/* Search input */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari divisi..."
                          value={departmentSearch}
                          onChange={(e) => setDepartmentSearch(e.target.value)}
                          className="w-full pl-8 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {departmentSearch && (
                          <button
                            type="button"
                            onClick={() => setDepartmentSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between text-[11px] px-1 pt-0.5 pb-1 border-b border-slate-100">
                        <button
                          type="button"
                          onClick={handleSelectAllDepartments}
                          className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>Pilih Semua ({uniqueDepartments.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllDepartments}
                          className="text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Square className="w-3 h-3" />
                          <span>Kosongkan</span>
                        </button>
                      </div>

                      {/* Scrollable Checkbox List */}
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                        {searchedDepartments.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-400 italic">
                            Divisi tidak ditemukan
                          </div>
                        ) : (
                          searchedDepartments.map((dept) => {
                            const isChecked = isDepartmentChecked(dept);
                            return (
                              <label
                                key={dept}
                                className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                                  isChecked ? 'bg-blue-50/70 text-blue-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleDepartmentSelection(dept)}
                                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                                  />
                                  <span className="font-semibold text-slate-900 truncate">
                                    {dept}
                                  </span>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>

                      {/* Footer info & Done button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {selectedDepartments.includes('__NONE__')
                            ? '0 divisi terpilih'
                            : selectedDepartments.length === 0
                            ? `Semua ${uniqueDepartments.length} divisi terpilih`
                            : `${selectedDepartments.length} dari ${uniqueDepartments.length} divisi`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsDepartmentDropdownOpen(false)}
                          className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Selesai
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 2. Multi-Select Participant Filter */}
              <div className="space-y-1 relative">
                <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Peserta Training ({availableParticipants.length}):</span>
                  </span>
                  {selectedParticipantIds.length > 0 && !selectedParticipantIds.includes('__NONE__') && (
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                      {selectedParticipantIds.length} Terpilih
                    </span>
                  )}
                </label>

                {/* Main Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsParticipantDropdownOpen((prev) => !prev)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <span className="truncate pr-1 text-left">
                    {selectedParticipantIds.includes('__NONE__')
                      ? '0 Peserta Terpilih'
                      : selectedParticipantIds.length === 0 ||
                        selectedParticipantIds.length === availableParticipants.length
                      ? `Semua Peserta (${availableParticipants.length})`
                      : `${selectedParticipantIds.length} dari ${availableParticipants.length} Peserta`}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform shrink-0 ${
                      isParticipantDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Panel */}
                {isParticipantDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsParticipantDropdownOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                      {/* Search input */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari nama / NIP / divisi..."
                          value={participantSearch}
                          onChange={(e) => setParticipantSearch(e.target.value)}
                          className="w-full pl-8 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {participantSearch && (
                          <button
                            type="button"
                            onClick={() => setParticipantSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between text-[11px] px-1 pt-0.5 pb-1 border-b border-slate-100">
                        <button
                          type="button"
                          onClick={handleSelectAllParticipants}
                          className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>Pilih Semua ({availableParticipants.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllParticipants}
                          className="text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Square className="w-3 h-3" />
                          <span>Kosongkan</span>
                        </button>
                      </div>

                      {/* Scrollable Checkbox List */}
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                        {searchedParticipants.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-400 italic">
                            Peserta tidak ditemukan
                          </div>
                        ) : (
                          searchedParticipants.map((p) => {
                            const isChecked = isParticipantChecked(p.id);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                                  isChecked ? 'bg-blue-50/70 text-blue-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleParticipantSelection(p.id)}
                                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                                  />
                                  <div className="truncate">
                                    <div className="font-semibold text-slate-900 truncate leading-tight">
                                      {p.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      NIP: {p.nip || '-'}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 shrink-0">
                                  {p.department}
                                </span>
                              </label>
                            );
                          })
                        )}
                      </div>

                      {/* Footer info & Done button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {selectedParticipantIds.includes('__NONE__')
                            ? '0 peserta terpilih'
                            : selectedParticipantIds.length === 0
                            ? `Semua ${availableParticipants.length} peserta terpilih`
                            : `${selectedParticipantIds.length} dari ${availableParticipants.length} peserta`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsParticipantDropdownOpen(false)}
                          className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Selesai
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 3. Multi-Select Product / Modul Filter */}
              <div className="space-y-1 relative">
                <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-slate-500" />
                    <span>Modul ({products.length}):</span>
                  </span>
                  {selectedProductIds.length > 0 && !selectedProductIds.includes('__NONE__') && (
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                      {selectedProductIds.length} Terpilih
                    </span>
                  )}
                </label>

                {/* Main Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsProductDropdownOpen((prev) => !prev)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <span className="truncate pr-1 text-left">
                    {selectedProductIds.includes('__NONE__')
                      ? '0 Modul Terpilih'
                      : selectedProductIds.length === 0 ||
                        selectedProductIds.length === products.length
                      ? `Semua Modul (${products.length})`
                      : `${selectedProductIds.length} dari ${products.length} Modul`}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform shrink-0 ${
                      isProductDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Panel */}
                {isProductDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsProductDropdownOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                      {/* Search input */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari nama / kode modul..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full pl-8 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {productSearch && (
                          <button
                            type="button"
                            onClick={() => setProductSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between text-[11px] px-1 pt-0.5 pb-1 border-b border-slate-100">
                        <button
                          type="button"
                          onClick={handleSelectAllProducts}
                          className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>Pilih Semua ({products.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllProducts}
                          className="text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Square className="w-3 h-3" />
                          <span>Kosongkan</span>
                        </button>
                      </div>

                      {/* Scrollable Checkbox List */}
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                        {searchedProducts.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-400 italic">
                            Modul tidak ditemukan
                          </div>
                        ) : (
                          searchedProducts.map((prod) => {
                            const isChecked = isProductChecked(prod.id);
                            return (
                              <label
                                key={prod.id}
                                className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                                  isChecked ? 'bg-blue-50/70 text-blue-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleProductSelection(prod.id)}
                                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                                  />
                                  <div className="truncate">
                                    <div className="font-semibold text-slate-900 truncate leading-tight">
                                      {prod.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      Kode: {prod.code || '-'}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 shrink-0">
                                  {prod.category}
                                </span>
                              </label>
                            );
                          })
                        )}
                      </div>

                      {/* Footer info & Done button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {selectedProductIds.includes('__NONE__')
                            ? '0 modul terpilih'
                            : selectedProductIds.length === 0
                            ? `Semua ${products.length} modul terpilih`
                            : `${selectedProductIds.length} dari ${products.length} modul`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsProductDropdownOpen(false)}
                          className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Selesai
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 4. Multi-Select Trainer Filter */}
              <div className="space-y-1 relative">
                <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Trainer ({uniqueTrainers.length}):</span>
                  </span>
                  {selectedTrainers.length > 0 && !selectedTrainers.includes('__NONE__') && (
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                      {selectedTrainers.length} Terpilih
                    </span>
                  )}
                </label>

                {/* Main Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsTrainerDropdownOpen((prev) => !prev)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <span className="truncate pr-1 text-left">
                    {selectedTrainers.includes('__NONE__')
                      ? '0 Trainer Terpilih'
                      : selectedTrainers.length === 0 ||
                        selectedTrainers.length === uniqueTrainers.length
                      ? `Semua Trainer (${uniqueTrainers.length})`
                      : `${selectedTrainers.length} dari ${uniqueTrainers.length} Trainer`}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform shrink-0 ${
                      isTrainerDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Panel */}
                {isTrainerDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsTrainerDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-64 sm:w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                      {/* Search input */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari trainer..."
                          value={trainerSearch}
                          onChange={(e) => setTrainerSearch(e.target.value)}
                          className="w-full pl-8 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {trainerSearch && (
                          <button
                            type="button"
                            onClick={() => setTrainerSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between text-[11px] px-1 pt-0.5 pb-1 border-b border-slate-100">
                        <button
                          type="button"
                          onClick={handleSelectAllTrainers}
                          className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>Pilih Semua ({uniqueTrainers.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllTrainers}
                          className="text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Square className="w-3 h-3" />
                          <span>Kosongkan</span>
                        </button>
                      </div>

                      {/* Scrollable Checkbox List */}
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                        {searchedTrainers.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-400 italic">
                            Trainer tidak ditemukan
                          </div>
                        ) : (
                          searchedTrainers.map((tr) => {
                            const isChecked = isTrainerChecked(tr);
                            return (
                              <label
                                key={tr}
                                className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                                  isChecked ? 'bg-blue-50/70 text-blue-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleTrainerSelection(tr)}
                                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                                  />
                                  <span className="font-semibold text-slate-900 truncate">
                                    {tr}
                                  </span>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>

                      {/* Footer info & Done button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {selectedTrainers.includes('__NONE__')
                            ? '0 trainer terpilih'
                            : selectedTrainers.length === 0
                            ? `Semua ${uniqueTrainers.length} trainer terpilih`
                            : `${selectedTrainers.length} dari ${uniqueTrainers.length} trainer`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsTrainerDropdownOpen(false)}
                          className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Selesai
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Filter Group 3: Date Range */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Rentang Tanggal Execution Training:</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs text-slate-400 font-bold">s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Live Matches Count Banner */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Data Hasil Filter: <strong className="text-emerald-700">{filteredSessions.length} sesi</strong>{' '}
                <span className="text-slate-400">(dari total {sessions.length} sesi)</span>
              </span>
              {filteredSessions.length === 0 && (
                <span className="text-rose-600 font-semibold text-[11px]">
                  ⚠️ Tidak ada data yang cocok dengan kombinasi filter ini.
                </span>
              )}
            </div>
          </div>

          {/* Section 3: Mode Pemilihan Kolom (Default vs Customize) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                3. Pilihan Kolom Data Ekspor
              </label>

              {exportMode === 'custom' && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Pilih Semua
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleSelectDefault}
                    className="text-slate-600 hover:underline font-medium cursor-pointer"
                  >
                    Standar
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-rose-600 hover:underline font-medium cursor-pointer"
                  >
                    Kosongkan
                  </button>
                </div>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportMode('default')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  exportMode === 'default'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-bold ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs">Default (Semua Kolom Standar)</div>
                  <div className="text-[11px] font-normal text-slate-500">
                    Ekspor seluruh 20+ variabel rekapitulasi nilai
                  </div>
                </div>
                {exportMode === 'default' && (
                  <div className="p-1 bg-indigo-600 text-white rounded-full">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setExportMode('custom')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  exportMode === 'custom'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-bold ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Customize (Pilih Kolom)</span>
                  </div>
                  <div className="text-[11px] font-normal text-slate-500">
                    Pilih variabel tertentu ({selectedKeys.length} terpilih)
                  </div>
                </div>
                {exportMode === 'custom' && (
                  <div className="p-1 bg-indigo-600 text-white rounded-full">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            </div>

            {/* Custom Column Checkbox Grid */}
            {exportMode === 'custom' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                {/* Category Grouping */}
                {[
                  { id: 'peserta', name: 'Informasi Peserta Training' },
                  { id: 'produk', name: 'Informasi Produk Training' },
                  { id: 'jadwal', name: 'Jadwal & Penguji Assessment' },
                  { id: 'nilai', name: 'Komponen Nilai & Hasil Evaluasi' },
                ].map((group) => {
                  const cols = ALL_COLUMNS.filter((c) => c.category === group.id);
                  return (
                    <div key={group.id} className="space-y-2">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                        {group.name}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cols.map((col) => {
                          const isChecked = selectedKeys.includes(col.key);
                          return (
                            <label
                              key={col.key}
                              className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-white border-blue-300 text-slate-900 font-semibold shadow-2xs'
                                  : 'bg-slate-100/60 border-transparent text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleColumnKey(col.key)}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <span>{col.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal Action */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Akan meng-ekspor <strong className="text-slate-800">{filteredSessions.length} sesi</strong> dengan{' '}
            <strong className="text-slate-800">{activeColumns.length} kolom data</strong>.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleExport}
              className={`px-5 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 ${
                fileFormat === 'excel'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>
                Unduh Berkas ({fileFormat === 'excel' ? '.xlsx' : '.csv'})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
