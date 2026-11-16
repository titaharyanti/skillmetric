import React from 'react';
import {
  AppSettings,
  Participant,
  TrainingProduct,
  TrainingSession,
} from '../types';
import { formatDateIndonesian } from '../utils/calculations';
import {
  X,
  Printer,
  Award,
  CheckCircle2,
  XCircle,
  Building,
  Calendar,
  Clock,
  User,
  Laptop,
  Cpu,
} from 'lucide-react';

interface ReportModalProps {
  session: TrainingSession | null;
  onClose: () => void;
  participants: Participant[];
  products: TrainingProduct[];
  settings: AppSettings;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  session,
  onClose,
  participants,
  products,
  settings,
}) => {
  if (!session) return null;

  const participant = participants.find((p) => p.id === session.participantId);
  const product = products.find((pr) => pr.id === session.productId);

  const handlePrint = () => {
    window.print();
  };

  const weights = session.appliedWeights || settings.weights;
  const teoriWeighted = Math.round(((session.teoriScore * weights.teoriWeight) / 100) * 10) / 10;
  const praktekWeighted = Math.round(((session.praktekScore * weights.praktekWeight) / 100) * 10) / 10;
  const rolePlayWeighted = Math.round(((session.rolePlayScore * weights.rolePlayWeight) / 100) * 10) / 10;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-3 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-300 overflow-hidden my-auto sm:my-8 print:my-0 print:border-none print:shadow-none print:rounded-none">
        {/* Modal Action Bar (Hidden on Print) */}
        <div className="print:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Rapor & Sertifikat Evaluasi Kompetensi</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div id="printable-report" className="p-5 sm:p-8 space-y-6 bg-white text-slate-900 font-sans">
          {/* Document Header & Logo */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700 block">
                {settings.companyName}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                LEMBAR EVALUASI & HASIL UJI KOMPETENSI
              </h1>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {settings.trainingCenterName}
              </p>
            </div>

            <div className="text-right sm:text-right text-xs space-y-1">
              <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-slate-800">
                NO: {session.id.toUpperCase()}
              </div>
              <p className="text-[11px] text-slate-500">
                Tanggal Cetak: {formatDateIndonesian(new Date().toISOString().slice(0, 10))}
              </p>
            </div>
          </div>

          {/* Participant & Product Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Box A: Data Peserta */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                INFORMASI PESERTA TRAINING
              </span>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-medium">Nama Peserta</span>
                <span className="col-span-2 font-bold text-slate-900">: {participant?.name || '-'}</span>

                <span className="text-slate-500 font-medium">NIP / ID</span>
                <span className="col-span-2 font-mono font-semibold text-slate-800">: {participant?.nip || '-'}</span>

                <span className="text-slate-500 font-medium">Departemen</span>
                <span className="col-span-2 text-slate-800">: {participant?.department} ({participant?.role})</span>

                <span className="text-slate-500 font-medium">Kontak</span>
                <span className="col-span-2 text-slate-800">: {participant?.email}</span>
              </div>
            </div>

            {/* Box B: Modul Produk & Jadwal */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                MODUL TRAINING & JADWAL ASSESSMENT
              </span>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-medium">Produk Training</span>
                <span className="col-span-2 font-bold text-slate-900 flex items-center gap-1">
                  : {product?.name || 'Produk'}
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 font-semibold text-slate-700">
                    {session.productCategory}
                  </span>
                </span>

                <span className="text-slate-500 font-medium">Kode Produk</span>
                <span className="col-span-2 font-mono text-slate-800">: {product?.code || '-'}</span>

                <span className="text-slate-500 font-medium">Hari & Tanggal</span>
                <span className="col-span-2 font-semibold text-slate-800">
                  : {session.day}, {formatDateIndonesian(session.date)}
                </span>

                <span className="text-slate-500 font-medium">Jam & Trainer</span>
                <span className="col-span-2 text-slate-800">
                  : Pukul {session.startTime} - {session.endTime} WIB ({session.trainerName})
                </span>
              </div>
            </div>
          </div>

          {/* Table: Pre/Post & N-Gain Index */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
            <div>
              <span className="text-slate-500">Nilai Pre-Test (Baseline): </span>
              <strong className="text-slate-800 font-bold">{session.preTestScore}</strong>
            </div>
            <div>
              <span className="text-slate-500">Nilai Post-Test (Akhir): </span>
              <strong className="text-slate-800 font-bold">{session.postTestScore}</strong>
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg border border-purple-200 font-semibold">
              Indeks Peningkatan N-Gain: +{session.nGainScore} ({session.nGainCategory})
            </div>
          </div>

          {/* Table: Assessment Components Breakdown */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="py-2.5 px-3">Komponen Assessment</th>
                  <th className="py-2.5 px-3 text-center">Bobot</th>
                  <th className="py-2.5 px-3 text-center">Nilai Mentah</th>
                  <th className="py-2.5 px-3 text-center">Nilai Tertimbang</th>
                  <th className="py-2.5 px-3">Catatan Observasi Evaluator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Teori */}
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    1. Ujian Teori (Komprehensif)
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-600">
                    {weights.teoriWeight}%
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    {session.teoriScore}
                  </td>
                  <td className="py-3 px-3 text-center font-extrabold text-blue-700">
                    {teoriWeighted}
                  </td>
                  <td className="py-3 px-3 text-slate-600 italic">
                    {session.teoriNotes || 'Memenuhi standar teori dasar.'}
                  </td>
                </tr>

                {/* Praktek */}
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    2. Tugas Praktek (Hands-On Installation & Troubleshooting)
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-600">
                    {weights.praktekWeight}%
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    {session.praktekScore}
                  </td>
                  <td className="py-3 px-3 text-center font-extrabold text-blue-700">
                    {praktekWeighted}
                  </td>
                  <td className="py-3 px-3 text-slate-600 italic">
                    {session.praktekNotes || 'Pengerjaan praktek sesuai SOP.'}
                  </td>
                </tr>

                {/* Role-Play */}
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    3. Role-Play 1-on-1 (Simulasi User & Attitude)
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-600">
                    {weights.rolePlayWeight}%
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    {session.rolePlayScore}
                  </td>
                  <td className="py-3 px-3 text-center font-extrabold text-blue-700">
                    {rolePlayWeighted}
                  </td>
                  <td className="py-3 px-3 text-slate-600 italic">
                    {session.rolePlayNotes || 'Role-play simulasi klien baik.'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cumulative Result Box & Badge */}
          <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                NILAI AKHIR KUMULATIF & PASSING GRADE
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{session.finalScore}</span>
                <span className="text-xs text-slate-500 font-medium">
                  / 100 (KKM Minimal: <strong>{session.kkmThreshold}</strong>)
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Predikat Kualitatif: <strong className="text-blue-700">{session.qualitativeGrade}</strong>
              </p>
            </div>

            {/* Official Competency Stamp Badge */}
            <div
              className={`p-4 rounded-xl border-2 flex items-center gap-3 shadow-sm ${
                session.status === 'Kompeten'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-red-50 border-red-500 text-red-800'
              }`}
            >
              {session.status === 'Kompeten' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 shrink-0" />
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                  STATUS HUKUM UJI
                </span>
                <span className="text-lg font-black tracking-tight">{session.status.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Overall Evaluator Feedback */}
          {session.evaluatorFeedback && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-amber-900">Catatan & Rekomendasi Instruktur:</span>
              <p className="text-amber-800 italic">{session.evaluatorFeedback}</p>
            </div>
          )}

          {/* Signatures Section */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-500 mb-12">Trainer / Evaluator Penguji,</p>
              <p className="font-bold text-slate-900 underline">{session.trainerName}</p>
              <p className="text-[10px] text-slate-400">Pusat Pelatihan {settings.companyName}</p>
            </div>

            <div>
              <p className="text-slate-500 mb-12">Mengetahui, Manager Training Center,</p>
              <p className="font-bold text-slate-900 underline">Head of Quality & Training</p>
              <p className="text-[10px] text-slate-400">{settings.trainingCenterName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
