import { AssessmentWeights, TrainingSession } from '../types';

/**
 * Calculates weighted final score based on Teori, Praktek, and Role-play scores.
 */
export function calculateFinalScore(
  teori: number,
  praktek: number,
  rolePlay: number,
  weights: AssessmentWeights
): number {
  const totalWeight = weights.teoriWeight + weights.praktekWeight + weights.rolePlayWeight;
  if (totalWeight === 0) return 0;

  const rawScore =
    (teori * weights.teoriWeight +
      praktek * weights.praktekWeight +
      rolePlay * weights.rolePlayWeight) /
    totalWeight;

  return Math.round(rawScore * 10) / 10;
}

/**
 * Calculates Normalized Gain (N-Gain) score based on Pre-Test and Post-Test.
 * N-Gain = (PostTest - PreTest) / (100 - PreTest)
 */
export function calculateNGain(preTest: number, postTest: number): number {
  if (preTest >= 100) return 1.0;
  if (postTest < preTest) {
    // Negative gain or no improvement
    const gain = (postTest - preTest) / preTest;
    return Math.round(gain * 100) / 100;
  }
  const gain = (postTest - preTest) / (100 - preTest);
  return Math.round(gain * 100) / 100;
}

/**
 * Returns N-Gain category classification according to Hake (1998)
 */
export function getNGainCategory(nGain: number): 'Tinggi' | 'Sedang' | 'Rendah' {
  if (nGain >= 0.7) return 'Tinggi';
  if (nGain >= 0.3) return 'Sedang';
  return 'Rendah';
}

/**
 * Returns qualitative grade letter & description based on final score
 */
export function getQualitativeGrade(
  score: number
): 'A (Sangat Baik)' | 'B (Baik)' | 'C (Cukup)' | 'D (Perlu Remedial)' {
  if (score >= 88) return 'A (Sangat Baik)';
  if (score >= 78) return 'B (Baik)';
  if (score >= 70) return 'C (Cukup)';
  return 'D (Perlu Remedial)';
}

/**
 * Returns competency status based on final score and KKM
 */
export function getCompetencyStatus(score: number, kkm: number): 'Kompeten' | 'Belum Kompeten' {
  return score >= kkm ? 'Kompeten' : 'Belum Kompeten';
}

/**
 * Converts YYYY-MM-DD date string to Indonesian formatted date string
 */
export function formatDateIndonesian(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Derives day name in Indonesian from YYYY-MM-DD
 */
export function getDayNameIndonesian(dateString: string): string {
  if (!dateString) return 'Senin';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Senin';
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
  } catch {
    return 'Senin';
  }
}

/**
 * Export training sessions data to CSV file
 */
export function exportSessionsToCSV(
  sessions: TrainingSession[],
  participantsMap: Record<string, { name: string; nip: string; department: string }>,
  productsMap: Record<string, { name: string; category: string; code: string }>
) {
  const headers = [
    'ID Sesi',
    'NIP Peserta',
    'Nama Peserta',
    'Departemen',
    'Kategori Produk',
    'Kode Produk',
    'Nama Produk Training',
    'Tanggal Training',
    'Hari',
    'Jam',
    'Trainer',
    'Nilai Pre-Test',
    'Nilai Post-Test',
    'N-Gain Index',
    'Kategori N-Gain',
    'Nilai Teori',
    'Nilai Praktek',
    'Nilai Role-Play',
    'Nilai Akhir Kumulatif',
    'KKM',
    'Status Kompetensi',
    'Predikat',
  ];

  const rows = sessions.map((s) => {
    const p = participantsMap[s.participantId] || { name: 'Unknown', nip: '-', department: '-' };
    const prod = productsMap[s.productId] || { name: 'Unknown', category: s.productCategory, code: '-' };

    return [
      s.id,
      `"${p.nip}"`,
      `"${p.name}"`,
      `"${p.department}"`,
      s.productCategory,
      prod.code,
      `"${prod.name}"`,
      s.date,
      s.day,
      `"${s.startTime} - ${s.endTime}"`,
      `"${s.trainerName}"`,
      s.preTestScore,
      s.postTestScore,
      s.nGainScore,
      s.nGainCategory,
      s.teoriScore,
      s.praktekScore,
      s.rolePlayScore,
      s.finalScore,
      s.kkmThreshold,
      s.status,
      `"${s.qualitativeGrade}"`,
    ];
  });

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Rekap_Assessment_Training_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
