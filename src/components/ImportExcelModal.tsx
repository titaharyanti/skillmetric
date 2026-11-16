import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Participant,
  TrainingProduct,
  TrainingSession,
  ProductCategory,
  AppSettings,
  DEPARTMENT_OPTIONS,
} from '../types';

export const normalizeDepartment = (input: string): string => {
  if (!input || !input.trim()) return DEPARTMENT_OPTIONS[0];
  const trimmed = input.trim();

  // Exact match check (case-insensitive)
  const exactMatch = DEPARTMENT_OPTIONS.find(
    (d) => d.toLowerCase() === trimmed.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  // Fuzzy match for common inputs/abbreviations
  const lower = trimmed.toLowerCase();
  if (lower.includes('hard')) return 'Sales Hardware';
  if (lower.includes('soft')) return 'Sales Software';
  if (lower.includes('mari') || lower.includes('laut')) return 'Sales Maritime';
  if (lower.includes('tele')) return 'Telesales';
  if (lower.includes('ops') || lower.includes('operat')) return 'Operation';
  if (lower.includes('tech') || lower.includes('tekni')) return 'Technician';
  if (lower.includes('cust') || lower.includes('success') || lower.includes('cs')) return 'Customer Success';
  if (lower.includes('biz') || lower.includes('busin') || lower.includes('dev') || lower.includes('bd')) return 'Business Development';

  return DEPARTMENT_OPTIONS[0];
};
import {
  calculateFinalScore,
  calculateNGain,
  getNGainCategory,
  getQualitativeGrade,
  getCompetencyStatus,
  getDayNameIndonesian,
} from '../utils/calculations';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Users,
  Boxes,
  Award,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export type ImportType = 'participants' | 'products' | 'sessions';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ImportType;
  participants: Participant[];
  products: TrainingProduct[];
  sessions: TrainingSession[];
  settings: AppSettings;
  onImportParticipants: (newParticipants: Participant[]) => void;
  onImportProducts: (newProducts: TrainingProduct[]) => void;
  onImportSessions: (newSessions: TrainingSession[]) => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'participants',
  participants,
  products,
  sessions,
  settings,
  onImportParticipants,
  onImportProducts,
  onImportSessions,
}) => {
  const [importType, setImportType] = useState<ImportType>(defaultType);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Reset state on tab change
  const handleTypeChange = (type: ImportType) => {
    setImportType(type);
    setParsedRows([]);
    setFileName('');
    setImportSuccessMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- 1. Download Sample Templates ---
  const handleDownloadTemplate = (type: ImportType) => {
    let headers: string[] = [];
    let sampleRows: any[][] = [];
    let sheetName = '';
    let fileName = '';

    if (type === 'participants') {
      sheetName = 'Template Peserta';
      fileName = 'Template_Import_Peserta_SkillMetric.xlsx';
      headers = [
        'NIP',
        'Nama Peserta',
        'Departemen / Divisi',
        'Jabatan / Role',
        'Email',
        'No Telepon',
      ];
      sampleRows = [
        [
          'NIP-2026-001',
          'Budi Santoso',
          'Sales Hardware',
          'Hardware Sales Executive',
          'budi.santoso@company.id',
          '081234567890',
        ],
        [
          'NIP-2026-002',
          'Siti Rahmawati',
          'Sales Software',
          'Software Sales Lead',
          'siti.rahmawati@company.id',
          '081987654321',
        ],
        [
          'NIP-2026-003',
          'Rahmat Hidayat',
          'Sales Maritime',
          'Maritime Account Specialist',
          'rahmat.hidayat@company.id',
          '081556677889',
        ],
        [
          'NIP-2026-004',
          'Dewi Lestari',
          'Telesales',
          'Senior Telesales Representative',
          'dewi.lestari@company.id',
          '081778899001',
        ],
        [
          'NIP-2026-005',
          'Eka Nurtanti',
          'Operation',
          'Operations Lead',
          'eka.nurtanti@company.id',
          '081889900112',
        ],
        [
          'NIP-2026-006',
          'Ahmad Fadhil',
          'Technician',
          'Senior Technician Specialist',
          'ahmad.fadhil@company.id',
          '082112233445',
        ],
        [
          'NIP-2026-007',
          'Fajar Ramadhan',
          'Customer Success',
          'Customer Success Lead',
          'fajar.ramadhan@company.id',
          '081990011223',
        ],
        [
          'NIP-2026-008',
          'Maya Putri',
          'Business Development',
          'Business Development Manager',
          'maya.putri@company.id',
          '081233445566',
        ],
      ];
    } else if (type === 'products') {
      sheetName = 'Template Produk';
      fileName = 'Template_Import_Produk_SkillMetric.xlsx';
      headers = [
        'Kode Produk',
        'Nama Produk Training',
        'Kategori (Software/Hardware)',
        'Jenis Training (Internal/Eksternal)',
        'Target Audien / Peserta',
        'Deskripsi Ringkas',
        'KKM Standard (0-100)',
        'Persyaratan Kompetensi (pisahkan koma)',
      ];
      sampleRows = [
        [
          'SF-ADV-01',
          'Core System Architecture & API Integration',
          'Software',
          'Internal',
          'Sales Software, Operation, Technician, Customer Success',
          'Pelatihan arsitektur sistem backend modern dan modul API enterprise.',
          80,
          'Pemahaman REST API, Query DB Optimization, Security Token',
        ],
        [
          'HW-NET-02',
          'Enterprise Network Router & Switch Deployment',
          'Hardware',
          'Eksternal',
          'Sales Hardware, Sales Maritime, Business Development, Telesales',
          'Sertifikasi pemasangan hardware router dan sistem failover data center.',
          75,
          'Kabel Fiber Optik, Konfigurasi VLAN, Router Diagnostics',
        ],
      ];
    } else if (type === 'sessions') {
      sheetName = 'Template Assessment';
      fileName = 'Template_Import_Hasil_Assessment_SkillMetric.xlsx';
      headers = [
        'NIP Peserta',
        'Nama Peserta (Opsional)',
        'Kode Produk',
        'Tanggal (YYYY-MM-DD)',
        'Jam Mulai (HH:MM)',
        'Jam Selesai (HH:MM)',
        'Nama Trainer / Evaluator',
        'Nilai PreTest (0-100)',
        'Nilai PostTest (0-100)',
        'Nilai Teori (0-100)',
        'Nilai Praktek (0-100)',
        'Nilai RolePlay (0-100)',
        'Catatan Evaluator',
      ];
      sampleRows = [
        [
          'TRN-2026-001',
          'Budi Kurniawan',
          'SOFT-POS-01',
          '2026-08-01',
          '08:30',
          '15:00',
          'Asesor Tita Haryanti, S.T., M.T. (Group Product Trainer)',
          65,
          88,
          85,
          90,
          88,
          'Sangat menguasai materi troubleshooting API backend.',
        ],
        [
          'TRN-2026-002',
          'Dewi Lestari',
          'HARD-EDC-01',
          '2026-08-02',
          '09:00',
          '16:00',
          'Kristovel Lamrezeki Simanullang, S.T. (Hardware Technical Trainer)',
          50,
          85,
          80,
          90,
          82,
          'Lulus kualifikasi instalasi hardware terminal EDC.',
        ],
        [
          'TRN-2026-003',
          'Rian Prasetyo',
          'HARD-IOT-02',
          '2026-08-03',
          '09:00',
          '15:30',
          'Sandy Azizi, S.T. (IoT Product Trainer)',
          60,
          80,
          80,
          85,
          78,
          'Keterampilan IoT & LoRaWAN memadai.',
        ],
      ];
    }

    const worksheetData = [headers, ...sampleRows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 5, 18) }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, fileName);
  };

  // --- 2. File Upload & Parse Logic ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setImportSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryStr = event.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse JSON rows with raw header values
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          alert('File Excel kosong atau tidak memiliki baris data.');
          setIsProcessing(false);
          return;
        }

        // Process rows according to current entity import type
        const processed = processParsedData(rawJson, importType);
        setParsedRows(processed);
      } catch (err) {
        alert('Gagal membaca file Excel: ' + (err as Error).message);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Helper function to map raw excel object keys flexibly
  const getKeyValue = (row: any, candidates: string[]): any => {
    const keys = Object.keys(row);
    for (const cand of candidates) {
      const match = keys.find(
        (k) => k.toLowerCase().trim() === cand.toLowerCase().trim()
      );
      if (match && row[match] !== undefined && row[match] !== '') {
        return row[match];
      }
    }
    return '';
  };

  const processParsedData = (rawJson: any[], type: ImportType) => {
    return rawJson.map((row, idx) => {
      const issues: string[] = [];

      if (type === 'participants') {
        const nip = String(getKeyValue(row, ['nip', 'nip peserta', 'id peserta'])).trim();
        const name = String(getKeyValue(row, ['nama', 'nama peserta', 'name'])).trim();
        const rawDept = String(
          getKeyValue(row, ['departemen', 'divisi', 'department', 'unit'])
        ).trim();
        const department = normalizeDepartment(rawDept);
        const role = String(
          getKeyValue(row, ['jabatan', 'role', 'posisi', 'jabatan peserta'])
        ).trim() || 'Staff';
        const email = String(getKeyValue(row, ['email', 'surel'])).trim();
        const phone = String(getKeyValue(row, ['phone', 'no telepon', 'telepon', 'hp'])).trim();

        if (!nip) issues.push('NIP Kosong');
        if (!name) issues.push('Nama Peserta Kosong');

        return {
          id: nip ? `P-${nip}` : `P-IMP-${Date.now()}-${idx}`,
          nip: nip || `NIP-TEMP-${idx + 1}`,
          name: name || 'Peserta Tanpa Nama',
          department,
          role,
          email,
          phone,
          _isValid: issues.length === 0,
          _issues: issues,
        };
      } else if (type === 'products') {
        const code = String(getKeyValue(row, ['kode produk', 'kode', 'code', 'productcode'])).trim();
        const name = String(getKeyValue(row, ['nama produk', 'nama produk training', 'nama', 'productname'])).trim();
        const rawCategory = String(getKeyValue(row, ['kategori', 'category', 'jenis'])).trim();
        const rawTrainingType = String(getKeyValue(row, ['jenis training', 'training type', 'tipe training', 'tipe'])).trim();
        const targetAudience = String(getKeyValue(row, ['target audien', 'target audien / peserta', 'target audience', 'audien', 'sasaran'])).trim();
        const description = String(getKeyValue(row, ['deskripsi', 'description', 'keterangan'])).trim() || 'Modul training standar.';
        const kkmRaw = getKeyValue(row, ['kkm standard', 'kkm', 'kkm threshold', 'default kkm']);
        const reqsRaw = getKeyValue(row, ['persyaratan kompetensi', 'kompetensi', 'competencies']);

        let category: ProductCategory = 'Software';
        if (rawCategory.toLowerCase().includes('hard')) {
          category = 'Hardware';
        }

        let trainingType: 'Internal' | 'Eksternal' = 'Internal';
        if (rawTrainingType.toLowerCase().includes('eksternal') || rawTrainingType.toLowerCase().includes('external') || rawTrainingType.toLowerCase().includes('customer')) {
          trainingType = 'Eksternal';
        }

        const kkm = Number(kkmRaw) || settings.defaultKKM || 75;

        let reqsArr: string[] = [];
        if (typeof reqsRaw === 'string' && reqsRaw.trim()) {
          reqsArr = reqsRaw.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
        } else {
          reqsArr = ['Pemahaman materi dasar training', 'Praktikum mandiri'];
        }

        if (!code) issues.push('Kode Produk Kosong');
        if (!name) issues.push('Nama Produk Kosong');

        return {
          id: code ? `PROD-${code}` : `PROD-IMP-${Date.now()}-${idx}`,
          code: code || `CODE-${idx + 1}`,
          name: name || 'Produk Tanpa Nama',
          category,
          trainingType,
          targetAudience: targetAudience || (trainingType === 'Internal' ? 'Karyawan Internal Perusahaan' : 'Calon Customer (Pitching) & Customer'),
          description,
          defaultKKM: kkm,
          competencyRequirements: reqsArr,
          _isValid: issues.length === 0,
          _issues: issues,
        };
      } else {
        // sessions import
        const nip = String(getKeyValue(row, ['nip peserta', 'nip', 'id peserta'])).trim();
        const participantName = String(getKeyValue(row, ['nama peserta', 'nama'])).trim();
        const productCode = String(getKeyValue(row, ['kode produk', 'kode', 'product code'])).trim();
        const dateRaw = String(getKeyValue(row, ['tanggal', 'date', 'tgl'])).trim();
        const startTime = String(getKeyValue(row, ['jam mulai', 'start time', 'mulai'])).trim() || '08:30';
        const endTime = String(getKeyValue(row, ['jam selesai', 'end time', 'selesai'])).trim() || '15:00';
        const trainerName = String(getKeyValue(row, ['nama trainer', 'trainer', 'asesor', 'penguji'])).trim() || settings.trainers[0] || 'Asesor Tita Haryanti';

        const preTest = Math.min(100, Math.max(0, Number(getKeyValue(row, ['nilai pretest', 'pretest', 'pre-test'])) || 0));
        const postTest = Math.min(100, Math.max(0, Number(getKeyValue(row, ['nilai posttest', 'posttest', 'post-test'])) || 0));
        const teori = Math.min(100, Math.max(0, Number(getKeyValue(row, ['nilai teori', 'teori'])) || 0));
        const praktek = Math.min(100, Math.max(0, Number(getKeyValue(row, ['nilai praktek', 'praktek', 'praktikum'])) || 0));
        const rolePlay = Math.min(100, Math.max(0, Number(getKeyValue(row, ['nilai roleplay', 'roleplay', 'role play'])) || 0));
        const notes = String(getKeyValue(row, ['catatan evaluator', 'catatan', 'notes', 'feedback'])).trim();

        // Match participant by NIP
        const matchedParticipant = participants.find(
          (p) => p.nip.toLowerCase() === nip.toLowerCase()
        );

        // Match product by code
        const matchedProduct = products.find(
          (pr) => pr.code.toLowerCase() === productCode.toLowerCase()
        );

        if (!nip) issues.push('NIP Kosong');
        if (!matchedParticipant) issues.push(`Peserta NIP "${nip}" Belum Terdaftar (Akan Dibuat Otomatis)`);
        if (!productCode) issues.push('Kode Produk Kosong');
        if (!matchedProduct) issues.push(`Produk "${productCode}" Tidak Ditemukan`);

        // Date format handling
        let date = dateRaw;
        if (!date || isNaN(new Date(date).getTime())) {
          date = new Date().toISOString().slice(0, 10);
        }

        const kkm = matchedProduct ? matchedProduct.defaultKKM : settings.defaultKKM;
        const weights = settings.weights;

        const finalScore = calculateFinalScore(teori, praktek, rolePlay, weights);
        const nGainScore = calculateNGain(preTest, postTest);
        const nGainCategory = getNGainCategory(nGainScore);
        const status = getCompetencyStatus(finalScore, kkm);
        const qualitativeGrade = getQualitativeGrade(finalScore);
        const day = getDayNameIndonesian(date);

        const sessionDeptRaw = String(getKeyValue(row, ['departemen', 'divisi', 'department'])).trim();
        const autoDepartment = normalizeDepartment(sessionDeptRaw);

        return {
          id: `SES-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
          participantId: matchedParticipant ? matchedParticipant.id : `P-${nip || Date.now()}`,
          _autoParticipant: !matchedParticipant && nip ? {
            id: `P-${nip}`,
            nip: nip,
            name: participantName || `Peserta (${nip})`,
            department: autoDepartment,
            role: 'Peserta',
            email: '',
            phone: '',
          } : null,
          productId: matchedProduct ? matchedProduct.id : products[0]?.id || 'PROD-1',
          productCategory: matchedProduct ? matchedProduct.category : 'Software',
          date,
          day,
          startTime,
          endTime,
          trainerName,
          preTestScore: preTest,
          postTestScore: postTest,
          teoriScore: teori,
          praktekScore: praktek,
          rolePlayScore: rolePlay,
          appliedWeights: weights,
          finalScore,
          nGainScore,
          nGainCategory,
          kkmThreshold: kkm,
          status,
          qualitativeGrade,
          evaluatorFeedback: notes || 'Imported via Excel',
          createdAt: new Date().toISOString(),
          _matchedParticipantName: matchedParticipant ? matchedParticipant.name : (participantName || `NIP: ${nip}`),
          _matchedProductCode: matchedProduct ? matchedProduct.code : productCode,
          _isValid: Boolean(nip && productCode && matchedProduct),
          _issues: issues,
        };
      }
    });
  };

  // --- 3. Execute Import to App State ---
  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;

    if (importType === 'participants') {
      const validParticipants: Participant[] = parsedRows
        .filter((r) => r.nip && r.name)
        .map((r) => ({
          id: r.id,
          nip: r.nip,
          name: r.name,
          department: r.department,
          role: r.role,
          email: r.email || '',
          phone: r.phone || '',
        }));

      if (validParticipants.length === 0) {
        alert('Tidak ada baris data peserta valid untuk diimpor.');
        return;
      }

      onImportParticipants(validParticipants);
      setImportSuccessMsg(`Berhasil mengimpor ${validParticipants.length} data peserta!`);
    } else if (importType === 'products') {
      const validProducts: TrainingProduct[] = parsedRows
        .filter((r) => r.code && r.name)
        .map((r) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          category: r.category,
          trainingType: r.trainingType,
          targetAudience: r.targetAudience,
          description: r.description,
          defaultKKM: r.defaultKKM,
          competencyRequirements: r.competencyRequirements,
        }));

      if (validProducts.length === 0) {
        alert('Tidak ada baris data produk valid untuk diimpor.');
        return;
      }

      onImportProducts(validProducts);
      setImportSuccessMsg(`Berhasil mengimpor ${validProducts.length} produk training!`);
    } else {
      // Sessions import: check for auto-created participants
      const autoParticipants: Participant[] = [];
      const validSessions: TrainingSession[] = [];

      parsedRows.forEach((r) => {
        if (r._isValid) {
          if (r._autoParticipant) {
            autoParticipants.push(r._autoParticipant);
          }
          const { _isValid, _issues, _matchedParticipantName, _matchedProductCode, _autoParticipant, ...cleanSession } = r;
          validSessions.push(cleanSession);
        }
      });

      if (validSessions.length === 0) {
        alert('Tidak ada baris assessment yang dapat diimpor. Pastikan Kode Produk valid.');
        return;
      }

      if (autoParticipants.length > 0) {
        onImportParticipants(autoParticipants);
      }
      onImportSessions(validSessions);

      setImportSuccessMsg(
        `Berhasil mengimpor ${validSessions.length} sesi assessment` +
          (autoParticipants.length > 0
            ? ` dan mendaftarkan ${autoParticipants.length} peserta baru!`
            : '!')
      );
    }

    setParsedRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Impor Data File Excel (.xlsx / .csv)</h3>
              <p className="text-xs text-slate-400">
                Unggah berkas Excel untuk input masal data Peserta, Katalog Produk, atau Hasil Assessment.
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Success Banner */}
          {importSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">{importSuccessMsg}</div>
              <button
                onClick={() => setImportSuccessMsg('')}
                className="text-emerald-600 hover:underline cursor-pointer text-[11px]"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Section 1: Entity Type Switcher */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              1. Pilih Jenis Data Yang Ingin Diimpor
            </label>

            <div className="grid grid-cols-3 gap-3">
              {/* Peserta */}
              <button
                type="button"
                onClick={() => handleTypeChange('participants')}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  importType === 'participants'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Users
                  className={`w-5 h-5 ${
                    importType === 'participants' ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="text-xs">Data Peserta</div>
                  <div className="text-[10px] font-normal text-slate-500">NIP, Nama, Divisi</div>
                </div>
              </button>

              {/* Produk */}
              <button
                type="button"
                onClick={() => handleTypeChange('products')}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  importType === 'products'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-bold ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Boxes
                  className={`w-5 h-5 ${
                    importType === 'products' ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="text-xs">Katalog Produk</div>
                  <div className="text-[10px] font-normal text-slate-500">Kode, KKM, Modul</div>
                </div>
              </button>

              {/* Hasil Assessment */}
              <button
                type="button"
                onClick={() => handleTypeChange('sessions')}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  importType === 'sessions'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Award
                  className={`w-5 h-5 ${
                    importType === 'sessions' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="text-xs">Hasil Assessment</div>
                  <div className="text-[10px] font-normal text-slate-500">Nilai Teori/Praktek/Gain</div>
                </div>
              </button>
            </div>

            {/* Official 8 Divisions Note */}
            <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-[11px] uppercase text-blue-800 tracking-wide mb-1">
                  Pilihan 8 Divisi Resmi Terintegrasi:
                </span>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <span
                      key={dept}
                      className="px-2 py-0.5 bg-white border border-blue-200 rounded-md font-semibold text-slate-700 shadow-2xs"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Download Template & File Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Download Template Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Unduh Format Template Excel</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Gunakan format kolom yang sudah disesuaikan agar proses parsing data berjalan otomatis tanpa error.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadTemplate(importType)}
                className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Unduh Template (.xlsx)</span>
              </button>
            </div>

            {/* Upload File Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Pilih / Unggah Berkas Excel</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mendukung format file <strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>.
                </p>
              </div>

              <label className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs">
                <Upload className="w-4 h-4" />
                <span>{fileName ? `File: ${fileName}` : 'Pilih Berkas Excel'}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Interactive Data Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span>Pratinjau Data ({parsedRows.length} Baris Ditemukan)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    {parsedRows.filter((r) => r._isValid).length} Valid
                  </span>
                  {parsedRows.filter((r) => !r._isValid).length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {parsedRows.filter((r) => !r._isValid).length} Catatan
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setParsedRows([]);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Pratinjau</span>
                </button>
              </div>

              {/* Table Preview Container */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 sticky top-0 font-bold">
                    <tr>
                      <th className="px-3 py-2 w-12 text-center">Status</th>
                      {importType === 'participants' && (
                        <>
                          <th className="px-3 py-2">NIP</th>
                          <th className="px-3 py-2">Nama Peserta</th>
                          <th className="px-3 py-2">Departemen</th>
                          <th className="px-3 py-2">Jabatan</th>
                        </>
                      )}
                      {importType === 'products' && (
                        <>
                          <th className="px-3 py-2">Kode</th>
                          <th className="px-3 py-2">Nama Produk</th>
                          <th className="px-3 py-2">Kategori</th>
                          <th className="px-3 py-2">KKM</th>
                        </>
                      )}
                      {importType === 'sessions' && (
                        <>
                          <th className="px-3 py-2">Peserta</th>
                          <th className="px-3 py-2">Produk</th>
                          <th className="px-3 py-2 text-center">Teori / Praktek</th>
                          <th className="px-3 py-2 text-center">Final Score</th>
                          <th className="px-3 py-2 text-center">Gain</th>
                        </>
                      )}
                      <th className="px-3 py-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row._isValid ? 'hover:bg-slate-50/80' : 'bg-amber-50/40 hover:bg-amber-50'}
                      >
                        <td className="px-3 py-2 text-center">
                          {row._isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-600 inline-block" />
                          )}
                        </td>

                        {importType === 'participants' && (
                          <>
                            <td className="px-3 py-2 font-mono font-medium">{row.nip}</td>
                            <td className="px-3 py-2 font-bold">{row.name}</td>
                            <td className="px-3 py-2">{row.department}</td>
                            <td className="px-3 py-2">{row.role}</td>
                          </>
                        )}

                        {importType === 'products' && (
                          <>
                            <td className="px-3 py-2 font-mono font-bold text-blue-600">{row.code}</td>
                            <td className="px-3 py-2 font-semibold">{row.name}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  row.category === 'Software'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {row.category}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-bold">{row.defaultKKM}</td>
                          </>
                        )}

                        {importType === 'sessions' && (
                          <>
                            <td className="px-3 py-2 font-semibold">
                              {row._matchedParticipantName}
                            </td>
                            <td className="px-3 py-2 font-mono text-blue-700">
                              {row._matchedProductCode}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {row.teoriScore} / {row.praktekScore}
                            </td>
                            <td className="px-3 py-2 text-center font-bold">
                              <span
                                className={
                                  row.status === 'Kompeten' ? 'text-emerald-600' : 'text-rose-600'
                                }
                              >
                                {row.finalScore}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center font-medium">{row.nGainScore}</td>
                          </>
                        )}

                        <td className="px-3 py-2 text-[11px]">
                          {row._issues && row._issues.length > 0 ? (
                            <span className="text-amber-700 font-medium">{row._issues.join(', ')}</span>
                          ) : (
                            <span className="text-emerald-600 font-medium">Siap Diimpor</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 ? (
              <span>
                Siap memproses{' '}
                <strong className="text-slate-800">
                  {
                    parsedRows.filter((r) =>
                      importType === 'sessions' ? r._isValid : r.nip || r.code
                    ).length
                  }{' '}
                  baris data
                </strong>
                .
              </span>
            ) : (
              <span>Unggah berkas Excel untuk melihat pratinjau data.</span>
            )}
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
              disabled={parsedRows.length === 0}
              onClick={handleExecuteImport}
              className={`px-5 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 ${
                parsedRows.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Eksekusi Impor Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
