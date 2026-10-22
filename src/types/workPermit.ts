// src/types/workPermit.ts

/** ==========================================
 *  1. ENUMS & BASIC TYPES
 *  ========================================== */

/** Jenis izin kerja yang didukung dalam sistem */
export type PermitType = "working_at_height";

/** Status alur kerja (workflow) dari sebuah izin kerja */
export type WorkPermitStatus =
  | "draft"
  | "pending_supervisor"
  | "pending_officer"
  | "pending_pm"
  | "pending_mk"
  | "approved"
  | "rejected"
  | "pending_close"
  | "closed"
  | "cancelled";

/** Kategori tingkat risiko keselamatan kerja */
export type RiskCategory = "R" | "M" | "T" | "E";

/** Referensi singkat user dari server */
export interface UserRef {
  id: number;
  full_name: string;
  role: string;
}

/** ==========================================
 *  2. GPS & EVIDENCE STRUCTURES
 *  ========================================== */

/** Data lokasi yang dikirim saat submit/ dan approve/ (Supervisor & HSE Officer) */
export interface GpsLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;      // Akurasi dalam meter
  captured_at: string;   // ISO timestamp saat GPS diambil
}

/** Stempel lokasi dari server (satu per step per putaran). Server tidak memverifikasi lokasi. */
export interface PermitGeoStamp {
  id: number;
  step: "creator" | "supervisor" | "hse_officer" | string;
  submission_round: number;
  latitude: number | string;   // Bisa berupa string jika backend memakai Decimal
  longitude: number | string;
  accuracy: number | string;
  captured_at: string;
  recorded_by?: number | UserRef;
  recorded_at?: string;
}

/** Foto bukti lapangan (before / after) */
export interface PermitPhoto {
  id: number;
  stage: "before" | "after";
  original_name: string;
  content_type: string;
  size: number;
  uploaded_by?: number | UserRef;
  uploaded_at: string;
  url: string | null;        // Signed link, kedaluwarsa sekitar 1 jam. Bisa null jika storage down.
}

/** ==========================================
 *  3. SAFETY CHECKLIST STRUCTURE
 *  ========================================== */

/** 14 Checklist Keselamatan Working at Height (key "1" s.d "14") */
export interface HeightChecklist {
  "1": boolean; // SPK/kontrak ditandatangani
  "2": boolean; // Penanggung jawab ditentukan
  "3": boolean; // Cuaca cerah & tidak mendung
  "4": boolean; // Pekerja memakai & menyiapkan APD sesuai
  "5": boolean; // Sudah mendapat pengarahan K3 (Safety Induction)
  "6": boolean; // Punya pengalaman & kompeten
  "7": boolean; // Tidak punya penyakit ayan, rabun senja, gangguan keseimbangan
  "8": boolean; // Prosedur keadaan darurat dimengerti
  "9": boolean; // Rambu-rambu dipasang
  "10": boolean; // Safety line / safety net / safety deck terpasang
  "11": boolean; // Climbing terpasang (pekerjaan corewall)
  "12": boolean; // Area kerja & bawahnya bersih & bebas lalu lintas orang
  "13": boolean; // Peralatan diinspeksi & layak pakai
  "14": boolean; // Bahan kimia B3 aman, ada MSDS & label jelas
  [key: string]: boolean; // Indeks dinamis tambahan jika diperlukan
}

/** ==========================================
 *  4. PAYLOAD INTERFACES (CREATE / UPDATE)
 *  ========================================== */

/**
 * Body untuk POST /permits/ dan PATCH /permits/{id}/ (JSON).
 * Foto TIDAK dikirim di sini: gunakan POST /permits/{id}/photos/.
 * Lokasi TIDAK dikirim di sini: gunakan submit/ dan approve/.
 */
export interface WorkPermitPayload {
  project: number;
  hira_activity: number;
  permit_type: PermitType;
  work_date: string;       // Format: "YYYY-MM-DD"
  work_start: string;      // Format: "HH:MM"
  work_end: string;        // Format: "HH:MM"
  work_location: string;
  work_description: string;
  equipment_used?: string;
  person_in_charge: string;
  worker_count: number;
  safety_areas: string[];  // Contoh: ["A", "C"]
  checklist: HeightChecklist;
  ppe: string[];           // Contoh: ["body_harness", "sepatu"]
  ppe_other?: string[];    // Maksimal 2 baris, tidak boleh kosong
}

/** Body untuk submit/ (semua field wajib) */
export type SubmitPermitPayload = GpsLocationData;

/** Body untuk approve/ (Supervisor & HSE Officer wajib menyertakan lokasi, PM tidak) */
export interface ApprovePermitPayload extends Partial<GpsLocationData> {
  remarks?: string;
}

/** ==========================================
 *  5. APPROVAL & WORKFLOW INTERFACES
 *  ========================================== */

/** Item stepper rantai persetujuan (approval chain) */
export interface ApprovalChainItem {
  step: "supervisor" | "hse_officer" | "project_manager" | "mk";
  state: "approved" | "rejected" | "pending" | "waiting";
}

/** Histori keputusan approval */
export interface WorkPermitApprovalHistory {
  id?: number;
  step: string;
  decision: string;
  decided_by?: UserRef;
  decided_by_name?: string;
  remarks?: string;
  submission_round: number;
  decided_at?: string;
}

/** ==========================================
 *  6. RESPONSE INTERFACES
 *  ========================================== */

/** Item pada GET /permits/ (daftar). Field khusus detail tidak ada di sini. */
export interface WorkPermitListItem {
  id: number;
  project: number;
  project_name: string;
  permit_type: PermitType;
  document_number?: string;
  work_date: string;
  work_location: string;
  work_description: string;
  status: WorkPermitStatus;
  risk_category?: RiskCategory;    // Baru terisi saat permit pertama kali di-submit
  submission_round: number;
  created_by?: UserRef;
  created_at: string;
  updated_at: string;
  hira_activity_name?: string;     // Belum ada di list menurut dokumen, hanya jika backend menambahkannya
}

/** Respons lengkap GET /permits/{id}/ dan semua aksi workflow */
export interface WorkPermitDetail extends WorkPermitListItem, WorkPermitPayload {
  hira_activity_name: string;
  hira_document: number;
  hira_initial_category: RiskCategory;

  photos?: PermitPhoto[];
  geo_stamps?: PermitGeoStamp[];

  approvals?: WorkPermitApprovalHistory[];
  approval_chain?: ApprovalChainItem[];   // Kosong sebelum submit pertama

  cancelled_by?: UserRef;
  cancelled_at?: string;
  cancel_reason?: string;
  post_work_evaluation?: string;
  close_requested_at?: string;
  closed_by?: UserRef;
  closed_at?: string;

  form?: {
    code: string;                 // Contoh: F.01/P.10/SHE/KPT
    revision: string | number;
  };
  allowed_actions?: Record<string, boolean> | string[];
}

/** ==========================================
 *  7. QUERY PARAMS & PERMISSIONS
 *  ========================================== */

/** Parameter query filter untuk mengambil daftar Work Permits */
export interface WorkPermitListParams {
  project?: number | string;
  status?: WorkPermitStatus;
  risk_category?: RiskCategory;
  permit_type?: PermitType;
  page?: number;      // Tambahkan ini
  page_size?: number; // Tambahkan ini
}

// ==========================================
// Paginasi Work Permit (WorkPermitList.tsx)
// ==========================================

export interface PaginatedWorkPermitResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: WorkPermitListItem[];
}

/** Kunci aksi yang diizinkan (allowed actions) pada suatu dokumen izin kerja */
export type WorkPermitAllowedAction =
  | "can_edit"
  | "can_submit"
  | "can_decide"
  | "can_cancel"
  | "can_request_close"
  | "can_confirm_close"
  | "can_set_number"
  | "can_upload_before_photos"
  | "can_upload_after_photos"
  | "decide_requires_location";