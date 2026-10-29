// src/types/workPermit.ts

/** ==========================================
 *  1. ENUMS & BASIC TYPES
 *  ========================================== */

/** Jenis izin kerja yang didukung dalam sistem (saat ini working_at_height yang aktif) */
export type PermitType = 
  | "working_at_height" 
  | "confined_space" 
  | "fire_explosive" 
  | "lifting" 
  | "tower_crane";

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

export interface PermitHiraActivity {
  id?: number;
  activity_name: string;
  activity_type?: "R" | "NR" | "E";
  potential_hazard: string;
  risk_impact: string;
  initial_severity: number;
  initial_likelihood: number;
  initial_score?: number;
  initial_category?: string;
  initial_acceptable?: boolean;
  residual_severity: number;
  residual_likelihood: number;
  residual_score?: number;
  residual_category?: string;
  residual_acceptable?: boolean;
  existing_controls?: string;
  control_category?: string;
  opportunity?: string;
  order?: number;
}

export interface PermitHiraGroup {
  id?: number;
  location_function: string;
  applicable_regulation?: string;
  order?: number;
  activities: PermitHiraActivity[];
}

/** Kategori tingkat risiko keselamatan kerja (R, M, T, E) */
export type RiskCategory = "R" | "M" | "T" | "E";

/** Referensi singkat data pengguna dari server */
export interface UserRef {
  id: number;
  full_name: string;
  role: string;
}

/** ==========================================
 *  2. ATTACHMENTS & EVIDENCE STRUCTURES
 *  ========================================== */

/** Lampiran PDF (jenis medical dan certificate wajib disertakan saat submit)*/
export interface PermitAttachment {
  id: number;
  kind: "medical" | "certificate";
  original_name: string;
  size: number;
  uploaded_by?: number | UserRef;
  uploaded_at: string;
  url: string | null; // Tautan bertanda tangan (signed link) yang berlaku sementara
}

/** Data geolokasi perangkat yang dikirim saat aksi submit/ dan approve/ */
export interface GpsLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;     // Tingkat akurasi GPS dalam satuan meter
  captured_at: string;  // Waktu pengambilan koordinat dalam format ISO timestamp
}

/** Rekaman stempel lokasi (geo_stamps) dari server untuk verifikasi peninjau */
export interface PermitGeoStamp {
  id: number;
  step: string;
  submission_round: number;
  latitude: number | string;
  longitude: number | string;
  accuracy: number | string;
  captured_at: string;
  recorded_by?: number | UserRef;
  recorded_at?: string;
}

/** Foto bukti dokumentasi lapangan (tahap before / after) */
export interface PermitPhoto {
  id: number;
  stage: "before" | "after";
  original_name: string;
  content_type: string;
  size: number;
  uploaded_by?: number | UserRef;
  uploaded_at: string;
  url: string | null;
}

/** ==========================================
 *  3. SAFETY CHECKLIST STRUCTURE
 *  ========================================== */

/** Struktur checklist keselamatan kerja di ketinggian (14 poin pertanyaan) */
export interface HeightChecklist {
  [key: string]: boolean;
}

/** ==========================================
 *  4. PAYLOAD INTERFACES (CREATE / UPDATE)
 *  ========================================== */

/**
 * Body data untuk pembuatan (POST /permits/) dan pembaruan (PATCH /permits/{id}/).
 * Menggunakan pendekatan hira_document dan hira_activity_ids sesuai perubahan struktur HIRA
 */
export interface WorkPermitPayload {
  project: number;
  permit_type: PermitType;
  hira_document?: number | null;      // ID dokumen HIRA yang sudah disetujui
  hira_activity_ids?: number[];       // Daftar ID aktivitas dari HIRA tersebut (maksimal 10)
  work_date: string;       // Tanggal pengerjaan (Format: "YYYY-MM-DD")
  work_start: string;      // Jam mulai kerja (Format: "HH:MM")
  work_end: string;        // Jam selesai kerja (Format: "HH:MM")
  work_location: string;   // Lokasi spesifik area pekerjaan
  work_description: string;// Deskripsi detail pekerjaan
  equipment_used?: string; // Peralatan yang digunakan (opsional)
  person_in_charge: string;// Nama penanggung jawab lapangan
  worker_count: number;    // Jumlah total pekerja
  safety_areas: string[];  // Daftar kode area keselamatan dari skema
  checklist: HeightChecklist; // Status jawaban checklist keselamatan
  ppe: string[];           // Daftar kunci APD yang digunakan
  ppe_other?: string[];    // Catatan APD tambahan (maksimal 2 baris)
}

/** Body untuk submit/ (semua field geolokasi wajib) */
export type SubmitPermitPayload = GpsLocationData;

/** Body untuk approve/ (Supervisor & HSE Officer wajib menyertakan lokasi, PM tidak) */
export interface ApprovePermitPayload extends Partial<GpsLocationData> {
  remarks?: string;
}

/** ==========================================
 *  5. APPROVAL & WORKFLOW INTERFACES
 *  ========================================== */

/** Item stepper untuk menampilkan status rantai persetujuan (approval chain) */
export interface ApprovalChainItem {
  step: "supervisor" | "hse_officer" | "project_manager" | "mk";
  state: "approved" | "rejected" | "pending" | "waiting";
}

/** Catatan histori keputusan persetujuan dari setiap peninjau */
export interface WorkPermitApprovalHistory {
  id?: number;
  step: string;
  decision: string;
  decided_by?: UserRef | null;
  decided_by_external?: {
    name: string;
    email: string;
  } | null;
  remarks?: string | null;
  submission_round: number;
  decided_at?: string | null;
}

/** Informasi permintaan persetujuan eksternal untuk Manajemen Konstruksi (MK) */
export interface PermitMkRequest {
  id: number;
  contact_name: string;
  contact_email: string;
  state: "active" | "expired" | "decided" | "superseded";
  expires_at: string;
  email_sent: boolean;
  email_sent_at?: string | null;
  email_error?: string | null;
  otp_sent_count: number;
}

/** ==========================================
 *  6. RESPONSE INTERFACES
 *  ========================================== */

export interface WorkPermitListItem {
  id: number;
  project: number;
  project_name: string;
  permit_type: PermitType;
  document_number: string | null;
  work_date: string;
  work_location: string;
  work_description: string;
  status: WorkPermitStatus;
  risk_category: RiskCategory | null;
  highest_initial_category?: RiskCategory | null; // <-- Tambahkan ini jika backend mengirimkannya di list
  submission_round: number;
  created_by?: UserRef;
  created_at: string;
  updated_at: string;
  hira_activity_name?: string;
}

/** Struktur objek respons lengkap saat mengambil detail izin kerja (GET /permits/{id}/) */
export interface WorkPermitDetail extends WorkPermitListItem {
  hira_document: number | null;
  hira_activity_ids: number[];
  highest_initial_category: RiskCategory | null;

  work_start: string; 
  work_end: string;   
  
  // Layout HIRA yang dipilih beserta rincian aktivitas yang dicentang
  hira?: {
    document: {
      id: number;
      work_package: string;
      work_area: string;
      document_number: string | null;
      document_date: string | null;
      status: string;
    };
    groups: PermitHiraGroup[];
  } | null;

  attachments?: PermitAttachment[]; // Daftar lampiran dokumen PDF
  photos?: PermitPhoto[];           // Foto bukti lapangan
  geo_stamps?: PermitGeoStamp[];    // Rekaman jejak lokasi GPS

  equipment_used?: string;
  person_in_charge: string;
  worker_count: number;
  safety_areas: string[];
  checklist: HeightChecklist;
  ppe: string[];
  ppe_other?: string[];

  approvals?: WorkPermitApprovalHistory[];
  approval_chain?: ApprovalChainItem[];
  mk_requests?: PermitMkRequest[];

  cancelled_by?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  post_work_evaluation?: string | null;
  close_requested_at?: string | null;
  closed_by?: string | null;
  closed_at?: string | null;

  form: {
    code: string;     // Kode formulir resmi (misal: F.01/P.10/SHE/KPT)
    revision: string | number; // Dikembalikan sesuai file lama (string | number)
  };
  allowed_actions: Record<string, boolean>;
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
  | "decide_requires_location"
  | "can_resend_mk_link"; // <-- Pastikan ini ada

/** Parameter query filter untuk pencarian dan pemfilteran daftar Work Permits */
export interface WorkPermitListParams {
  project?: number | string;
  status?: WorkPermitStatus;
  risk_category?: RiskCategory;
  permit_type?: PermitType;
  page?: number;
  page_size?: number;
}

/** Format struktur respons terpaginasi dari server */
export interface PaginatedWorkPermitResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: WorkPermitListItem[];
}