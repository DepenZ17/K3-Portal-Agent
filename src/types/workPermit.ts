// src/types/workPermit.ts
/** ==========================================
 *  1. ENUMS & BASIC TYPES
 *  ========================================== */

/** Jenis izin kerja yang didukung dalam sistem */
export type PermitType =
  | "working_at_height"
  | "confined_space"
  | "fire_explosive"
  | "lifting"
  | "tower_crane";

/** Status alur kerja dari sebuah izin kerja */
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

/** Referensi singkat data pengguna dari server */
export interface UserRef {
  id: number;
  full_name: string;
  role: string;
}

/** ==========================================
 *  2. HIRA STRUCTURES
 *  ========================================== */

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

/** Dokumen HIRA yang terhubung ke izin kerja */
export interface PermitHiraDocument {
  document: {
    id: number;
    work_package: string;
    work_area: string;
    document_number: string | null;
    document_date: string | null;
    status: string;
    created_by_name?: string;
  };
  groups: PermitHiraGroup[];
}

/** ==========================================
 *  3. ATTACHMENTS & EVIDENCE STRUCTURES
 *  ========================================== */

/** Lampiran PDF: medical dan certificate */
export interface PermitAttachment {
  id: number;
  kind: "medical" | "certificate";
  original_name: string;
  size: number;
  uploaded_by?: number | UserRef;
  uploaded_at: string;
  url: string | null;
}

/** Data geolokasi perangkat */
export interface GpsLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  captured_at: string;
}

/** Rekaman stempel lokasi dari server */
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

/** Foto bukti dokumentasi lapangan */
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
 *  4. SAFETY CHECKLIST STRUCTURE
 *  ========================================== */

/** Checklist keselamatan kerja di ketinggian */
export interface HeightChecklist {
  [key: string]: boolean;
}

/** ==========================================
 *  5. PAYLOAD INTERFACES (CREATE / UPDATE)
 *  ========================================== */

/** Body data untuk POST /permits/ dan PATCH /permits/{id}/ */
export interface WorkPermitPayload {
  project: number;
  permit_type: PermitType;

  /** ID aktivitas dari HIRA yang telah disetujui */
  hira_activity_ids?: number[];

  work_date: string;
  work_start: string;
  work_end: string;
  work_location: string;
  work_description: string;
  equipment_used?: string;
  person_in_charge: string;
  worker_count: number;
  safety_areas: string[];
  checklist: HeightChecklist;
  ppe: string[];
  ppe_other?: string[];
}

/** Body untuk submit permit */
export type SubmitPermitPayload = GpsLocationData;

/** Body untuk approve permit */
export interface ApprovePermitPayload extends Partial<GpsLocationData> {
  remarks?: string;
}

/** ==========================================
 *  6. APPROVAL & WORKFLOW INTERFACES
 *  ========================================== */

/** Item stepper approval chain */
export interface ApprovalChainItem {
  step: "supervisor" | "hse_officer" | "project_manager" | "mk";
  state: "approved" | "rejected" | "pending" | "waiting";
}

/** Histori keputusan persetujuan */
export interface WorkPermitApprovalHistory {
  id?: number;
  step: string;
  decision: string;
  decided_by?: UserRef | null;
  decided_by_external?: {
    name: string;
    email: string;
  } | null;
  decided_by_name?: string | null;
  remarks?: string | null;
  submission_round: number;
  decided_at?: string | null;
}

/** Informasi permintaan persetujuan MK */
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
 *  7. RESPONSE INTERFACES
 *  ========================================== */

/** Data permit pada daftar */
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
  highest_initial_category?: RiskCategory | null;
  submission_round: number;
  created_by?: UserRef;
  created_at: string;
  updated_at: string;
  hira_activity_name?: string;
}

/** Respons detail izin kerja */
export interface WorkPermitDetail extends WorkPermitListItem {
  hira_activity_ids: number[];
  hira_document_ids: number[];
  highest_initial_category: RiskCategory | null;

  work_start: string;
  work_end: string;

  /** Multi-dokumen HIRA yang terhubung ke permit */
  hira?: {
    documents: PermitHiraDocument[];
  } | null;

  attachments?: PermitAttachment[];
  photos?: PermitPhoto[];
  geo_stamps?: PermitGeoStamp[];

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
    code: string;
    revision: string | number;
  };

  allowed_actions: Record<string, boolean>;
}

/** Kunci aksi yang diizinkan oleh backend */
export type WorkPermitAllowedAction =
  | "can_edit"
  | "can_submit"
  | "can_decide"
  | "can_cancel"
  | "can_request_close"
  | "can_confirm_close"
  | "can_set_number"
  | "can_manage_attachments"
  | "can_upload_before_photos"
  | "can_upload_after_photos"
  | "decide_requires_location"
  | "can_resend_mk_link";

/** Parameter filter daftar Work Permit */
export interface WorkPermitListParams {
  project?: number | string;
  status?: WorkPermitStatus;
  risk_category?: RiskCategory;
  permit_type?: PermitType;
  page?: number;
  page_size?: number;
}

/** Respons daftar permit dengan pagination */
export interface PaginatedWorkPermitResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: WorkPermitListItem[];
}
