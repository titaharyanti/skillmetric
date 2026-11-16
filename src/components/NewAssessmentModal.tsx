import React, { useState, useEffect } from 'react';
import {
  AssessmentWeights,
  Participant,
  ProductCategory,
  TrainingProduct,
  TrainingSession,
  TrainingType,
} from '../types';
import {
  calculateFinalScore,
  calculateNGain,
  getCompetencyStatus,
  getDayNameIndonesian,
  getNGainCategory,
  getQualitativeGrade,
} from '../utils/calculations';
import {
  X,
  PlusCircle,
  Calendar,
  Clock,
  User,
  Award,
  CheckCircle2,
  XCircle,
  Laptop,
  Cpu,
  Building2,
  Briefcase,
} from 'lucide-react';

interface NewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  products: TrainingProduct[];
  trainers: string[];
  weights: AssessmentWeights;
  defaultKKM: number;
  initialParticipantId?: string;
  onSaveSession: (newSession: TrainingSession) => void;
}

export const NewAssessmentModal: React.FC<NewAssessmentModalProps> = ({
  isOpen,
  onClose,
  participants,
  products,
  trainers,
  weights,
  defaultKKM,
  initialParticipantId,
  onSaveSession,
}) => {
  const [participantId, setParticipantId] = useState(initialParticipantId || '');
  const [productId, setProductId] = useState('');
  const [trainingType, setTrainingType] = useState<TrainingType>('Internal');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [day, setDay] = useState(getDayNameIndonesian(new Date().toISOString().slice(0, 10)));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('16:00');
  const [startTimeMode, setStartTimeMode] = useState<'interval' | 'free'>('interval');
  const [endTimeMode, setEndTimeMode] = useState<'interval' | 'free'>('interval');
  const [trainerName, setTrainerName] = useState(trainers[0] || '');

  const timeIntervals = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  // Pre & Post Scores
  const [preTestScore, setPreTestScore] = useState<number>(45);
  const [postTestScore, setPostTestScore] = useState<number>(85);

  // Component Scores
  const [teoriScore, setTeoriScore] = useState<number>(80);
  const [praktekScore, setPraktekScore] = useState<number>(85);
  const [rolePlayScore, setRolePlayScore] = useState<number>(80);

  // Aspect Notes
  const [teoriNotes, setTeoriNotes] = useState('');
  const [praktekNotes, setPraktekNotes] = useState('');
  const [rolePlayNotes, setRolePlayNotes] = useState('');
  const [evaluatorFeedback, setEvaluatorFeedback] = useState('');

  // Selected product & KKM
  const selectedProduct = products.find((p) => p.id === productId) || products[0];
  const activeKKM = selectedProduct ? selectedProduct.defaultKKM : defaultKKM;

  useEffect(() => {
    if (initialParticipantId) {
      setParticipantId(initialParticipantId);
    } else if (participants.length > 0 && !participantId) {
      setParticipantId(participants[0].id);
    }
  }, [initialParticipantId, participants]);

  useEffect(() => {
    if (products.length > 0 && !productId) {
      setProductId(products[0].id);
      if (products[0].trainingType) {
        setTrainingType(products[0].trainingType);
      }
    }
  }, [products]);

  // When productId changes, sync default training type from product
  const handleProductChange = (newProdId: string) => {
    setProductId(newProdId);
    const prod = products.find((p) => p.id === newProdId);
    if (prod && prod.trainingType) {
      setTrainingType(prod.trainingType);
    }
  };

  // Handle date change -> update day automatically
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setDay(getDayNameIndonesian(newDate));
  };

  // Real-time calculated values
  const finalScore = calculateFinalScore(teoriScore, praktekScore, rolePlayScore, weights);
  const nGainScore = calculateNGain(preTestScore, postTestScore);
  const nGainCat = getNGainCategory(nGainScore);
  const status = getCompetencyStatus(finalScore, activeKKM);
  const qualGrade = getQualitativeGrade(finalScore);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!participantId || !productId) {
      alert('Pilih Peserta dan Produk Training terlebih dahulu.');
      return;
    }

    const newSession: TrainingSession = {
      id: `sess-${Date.now()}`,
      participantId,
      productId,
      productCategory: selectedProduct.category,
      trainingType,
      targetAudience: selectedProduct.targetAudience,
      date,
      day,
      startTime,
      endTime,
      trainerName,
      preTestScore: Number(preTestScore),
      postTestScore: Number(postTestScore),
      teoriScore: Number(teoriScore),
      praktekScore: Number(praktekScore),
      rolePlayScore: Number(rolePlayScore),
      appliedWeights: weights,
      finalScore,
      nGainScore,
      nGainCategory: nGainCat,
      kkmThreshold: activeKKM,
      status,
      qualitativeGrade: qualGrade,
      teoriNotes,
      praktekNotes,
      rolePlayNotes,
      evaluatorFeedback,
      createdAt: new Date().toISOString(),
    };

    onSaveSession(newSession);
    onClose();
  };

  const softwareProducts = products.filter((p) => p.category === 'Software');
  const hardwareProducts = products.filter((p) => p.category === 'Hardware');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto sm:my-8">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Input Sesi Assessment Training Baru</h3>
              <p className="text-xs text-slate-400">
                Lengkapi data peserta, jadwal, trainer, dan penilaian Teori, Praktek & Role-Play.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Participant & Product & Training Type */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Participant Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Peserta Training <span className="text-red-500">*</span>
                </label>
                <select
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.nip}) - {p.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Selector with Categories */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Produk Training (Software / Hardware) <span className="text-red-500">*</span>
                </label>
                <select
                  value={productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <optgroup label="💻 Kategori Software Products">
                    {softwareProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.code}] ({p.trainingType || 'Internal'}) (KKM: {p.defaultKKM})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="⚙️ Kategori Hardware Products">
                    {hardwareProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.code}] ({p.trainingType || 'Internal'}) (KKM: {p.defaultKKM})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Training Type Selector (Internal vs Eksternal) */}
            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                Jenis Training Sesi Ini:
              </span>

              <div className="flex items-center gap-3">
                <label
                  onClick={() => setTrainingType('Internal')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    trainingType === 'Internal'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="modalTrainingType"
                    checked={trainingType === 'Internal'}
                    onChange={() => setTrainingType('Internal')}
                    className="hidden"
                  />
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Training Internal (Karyawan)</span>
                </label>

                <label
                  onClick={() => setTrainingType('Eksternal')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    trainingType === 'Eksternal'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="modalTrainingType"
                    checked={trainingType === 'Eksternal'}
                    onChange={() => setTrainingType('Eksternal')}
                    className="hidden"
                  />
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Training Eksternal (Calon/Customer)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Schedule & Trainer */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Jadwal & Instruktur (Trainer)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Training</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Hari (Otomatis)</label>
                <input
                  type="text"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-slate-100 font-semibold text-slate-700 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600">Jam Mulai</label>
                  <div className="flex gap-1.5 text-[9px] font-bold">
                    <button
                      type="button"
                      onClick={() => setStartTimeMode('interval')}
                      className={`px-1 rounded-sm cursor-pointer ${
                        startTimeMode === 'interval'
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Interval
                    </button>
                    <button
                      type="button"
                      onClick={() => setStartTimeMode('free')}
                      className={`px-1 rounded-sm cursor-pointer ${
                        startTimeMode === 'free'
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Bebas
                    </button>
                  </div>
                </div>
                {startTimeMode === 'interval' ? (
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    required
                  >
                    {timeIntervals.map((time) => (
                      <option key={time} value={time}>
                        {time} WIB
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="Contoh: 08:15 WIB"
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    required
                  />
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600">Jam Selesai</label>
                  <div className="flex gap-1.5 text-[9px] font-bold">
                    <button
                      type="button"
                      onClick={() => setEndTimeMode('interval')}
                      className={`px-1 rounded-sm cursor-pointer ${
                        endTimeMode === 'interval'
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Interval
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndTimeMode('free')}
                      className={`px-1 rounded-sm cursor-pointer ${
                        endTimeMode === 'free'
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Bebas
                    </button>
                  </div>
                </div>
                {endTimeMode === 'interval' ? (
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    required
                  >
                    {timeIntervals.map((time) => (
                      <option key={time} value={time}>
                        {time} WIB
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="Contoh: 17:45 WIB"
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    required
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Trainer / Instruktur Uji</label>
              <select
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                {trainers.map((t, idx) => (
                  <option key={idx} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Assessment Scoring Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Nilai Pre-Test, Post-Test & Komponen Assessment
              </h4>
              <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Bobot Terpasang: Teori ({weights.teoriWeight}%), Praktek ({weights.praktekWeight}%), Role-Play ({weights.rolePlayWeight}%)
              </span>
            </div>

            {/* Pre/Post Test inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 p-3 bg-white rounded-lg border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nilai Pre-Test (Awal)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={preTestScore}
                  onChange={(e) => setPreTestScore(Number(e.target.value))}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nilai Post-Test (Akhir)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={postTestScore}
                  onChange={(e) => setPostTestScore(Number(e.target.value))}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Teori, Praktek, Role-Play Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Teori */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>📖 Nilai Teori</span>
                  <span className="text-blue-600">{weights.teoriWeight}%</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={teoriScore}
                  onChange={(e) => setTeoriScore(Number(e.target.value))}
                  className="w-full text-sm font-bold py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                  required
                />
                <textarea
                  placeholder="Catatan aspek pemahaman teori..."
                  value={teoriNotes}
                  onChange={(e) => setTeoriNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none h-16"
                />
              </div>

              {/* Praktek */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>🛠️ Nilai Praktek</span>
                  <span className="text-blue-600">{weights.praktekWeight}%</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={praktekScore}
                  onChange={(e) => setPraktekScore(Number(e.target.value))}
                  className="w-full text-sm font-bold py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                  required
                />
                <textarea
                  placeholder="Catatan aspek hands-on & instalasi..."
                  value={praktekNotes}
                  onChange={(e) => setPraktekNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none h-16"
                />
              </div>

              {/* Role-Play */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>🎭 Role-Play (1-on-1)</span>
                  <span className="text-blue-600">{weights.rolePlayWeight}%</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rolePlayScore}
                  onChange={(e) => setRolePlayScore(Number(e.target.value))}
                  className="w-full text-sm font-bold py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                  required
                />
                <textarea
                  placeholder="Catatan komunikasi & simulasi client..."
                  value={rolePlayNotes}
                  onChange={(e) => setRolePlayNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none h-16"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan / Rekomendasi Evaluator Overall
              </label>
              <textarea
                placeholder="Rekomendasi tindak lanjut, saran pengayaan atau jadwal remedial..."
                value={evaluatorFeedback}
                onChange={(e) => setEvaluatorFeedback(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-16"
              />
            </div>
          </div>

          {/* Live Calculation Preview Footer Box */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Hasil Kalkulasi Otomatis</span>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-black text-amber-300">{finalScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
                <div className="text-xs text-emerald-300 font-semibold border-l border-slate-700 pl-3">
                  N-Gain: +{nGainScore} ({nGainCat})
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
                  status === 'Kompeten'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}
              >
                {status === 'Kompeten' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>{status} (KKM: {activeKKM})</span>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Simpan Penilaian
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
