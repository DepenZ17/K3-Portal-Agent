// src/utils/hiraRisk.ts

export type RiskCategory = "R" | "M" | "T" | "E";

export interface ComputedRisk {
  score: number;
  category: RiskCategory;
  categoryLabel: string;
  isAcceptable: boolean;
}

/**
 * Menghitung nilai Rt (Severity x Likelihood), kategori risiko, 
 * dan status penerimaan risiko secara live di frontend.
 * 
 * Aturan Skor & Kategori:
 * - R (Rendah)   : <= 4
 * - M (Menengah) : <= 9
 * - T (Tinggi)   : <= 16
 * - E (Ekstrem)  : > 16
 * 
 * Acceptable:
 * - true jika Rt <= 6
 */
export const calculateRisk = (severity: number, likelihood: number): ComputedRisk => {
  const s = Number(severity) || 0;
  const l = Number(likelihood) || 0;
  const score = s * l;

  let category: RiskCategory = "R";
  let categoryLabel = "R Rendah";

  if (score > 16) {
    category = "E";
    categoryLabel = "E Ekstrem";
  } else if (score > 9) {
    category = "T";
    categoryLabel = "T Tinggi";
  } else if (score > 4) {
    category = "M";
    categoryLabel = "M Menengah";
  }

  return {
    score,
    category,
    categoryLabel,
    isAcceptable: score <= 4,
  };
};