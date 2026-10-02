// src/types/JSA.ts

// Rutin / Non-rutin / Emergency
export type ActivityType = "R" | "NR" | "E";

// Status tindak lanjut per langkah kerja
export type JsaRowStatus = "OPEN" | "DONE";

// 1 baris (1 langkah kerja) pada tabel JSA
export interface JSARow {
  stepNo: number;         // No urutan
  activity: string;       // Urutan kerja / kegiatan
  hazard: string;         // Bahaya
  risk: string;           // Risiko K3

  severity: number;       // R (1..5)
  likelihood: number;     // L (1..5)

  recommendation: string; // Tindakan rekomendasi
  pic: string;            // PIC
  status: JsaRowStatus;   // Status
  notes: string;          // Keterangan
  followUp: string;       // Tindak lanjut
}

// Data utama JSA (header + items)
export interface JSA {
  // ID dari backend
  id: number;

  // Header
  officeOrSite: string;
  project: string;
  jobType: string;
  department: string;
  date: string;           // YYYY-MM-DD
  team: string;           // Tim JSA (ringkas)
  activityType: ActivityType;

  // Tambahan template
  ppe: string;            // APD ringkas
  requiredPermits: string;// Ijin yang harus dilengkapi

  // Isi tabel
  rows: JSARow[];

  // Catatan umum
  generalNotes: string;

  // Metadata (opsional dari backend)
  createdBy: string;
  createdAt: string;      // ISO string
  status: "DRAFT" | "SUBMITTED" | "APPROVED"; // opsional kalau kamu pakai workflow
}

// Untuk create (POST) biasanya tidak pakai id/createdAt
export type JSACreatePayload = Omit<JSA, "id" | "createdBy" | "createdAt">;
