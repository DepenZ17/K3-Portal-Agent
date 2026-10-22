// src/types/hira.ts

export type ActivityType = "R" | "NR" | "E"; // R = Rutin, NR = Non-Rutin, E = Darurat

export type HiraStatus =
  | "draft"
  | "pending_officer"
  | "pending_pm"
  | "approved"
  | "rejected"
  | "cancelled";

// Objek atau Array string untuk allowed_actions
export interface AllowedActionsObject {
  can_edit?: boolean;
  can_submit?: boolean;
  can_decide?: boolean;
  can_cancel?: boolean;
  can_set_number?: boolean;
}

export type AllowedAction =
  | "can_edit"
  | "can_submit"
  | "can_decide"
  | "can_cancel"
  | "can_set_number";

// Tipe untuk opsi Dropdown Proyek di Form hira (HiraForm.tsx)
export interface ProjectOption {
  id: number;
  name: string;
  is_active: boolean;
}

// Tipe Lengkap Proyek (Sesuai Fields di Backend) - Digunakan di HiraForm.tsx & HiraDetail.tsx
export interface Project {
  id: number;
  name: string;
  location: string;
  client_name: string;
  start_date: string;
  is_active: boolean;
}

// 1. Tipe untuk List HIRA (HiraList.tsx)
export interface HiraDocumentList {
  id: number;
  project: number;
  project_name: string;
  work_package: string;
  work_area: string;
  document_number: string | null;
  document_date: string | null;
  status: HiraStatus;
  submission_round: number;
  created_by: {
    id: number;
    full_name: string;
    role: string;
  };
  has_unacceptable_residual: boolean;
  created_at: string;
  updated_at: string;
}

// 3. Tipe Grup Lokasi / Fungsi (Hierarki Level 2 - Form & Detail)
// applicable_regulation dipindah ke level grup sesuai spesifikasi backend terbaru
export interface HiraGroup {
  id?: number;
  location_function: string;
  applicable_regulation?: string; 
  order?: number;
  activities: HiraActivity[];
}

// 4. Tipe Item Aktivitas Penilaian Risiko (Hierarki Level 3 - Form & Detail)
export interface HiraActivity {
  id?: number;
  activity_name: string;
  activity_type?: "R" | "NR" | "E";
  potential_hazard: string;
  risk_impact: string;
  initial_severity: number;
  initial_likelihood: number;
  initial_risk_score?: number;
  initial_category?: string;
  initial_acceptable?: boolean;
  existing_controls?: string;
  control_category?: string;
  residual_severity: number;
  residual_likelihood: number;
  residual_risk_score?: number;
  residual_category?: string;
  residual_acceptable?: boolean;
  is_acceptable?: boolean;
  opportunity?: string;
  order?: number;
}

// 5. Tipe Riwayat Persetujuan / Approval (Detail)
export interface HiraApproval {
  id: number;
  step?: "hse_officer" | "project_manager";
  decision?: "approved" | "rejected";
  stage?: string;
  status?: string;
  decided_by?: {
    id: number;
    full_name: string;
    role: string;
  };
  decided_by_name?: string | null;
  decided_at: string | null;
  remarks?: string | null;
  notes?: string | null;
  submission_round?: number;
}

// 7. Tipe Response Lengkap Detail HIRA (HiraDetail.tsx)
export interface HiraDetailResponse {
  id: number;
  project: number;
  project_name: string;
  project_info?: {
    name: string;
    location: string;
    client_name: string;
  };
  work_package: string;
  work_area: string;
  document_number: string | null;
  document_date: string | null;
  status: HiraStatus;
  submission_round: number;
  form_revision?: number;
  created_by: {
    id: number;
    full_name: string;
    role: string;
  };
  cancelled_by?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  has_unacceptable_residual: boolean;
  groups: HiraGroup[];
  approvals: HiraApproval[];
  allowed_actions: AllowedAction[];
  created_at: string;
  updated_at: string;
}

// 8. Tipe Payload Form Tambah / Edit HIRA (HiraForm.tsx)
export interface HiraFormPayload {
  project: number;
  work_package: string;
  work_area: string;
  document_number?: string;
  document_date?: string;
  groups?: HiraGroup[];
}

// ==========================================
// Paginasi & Filter HIRA (HiraList.tsx)
// ==========================================

export interface HiraQueryParams {
  project?: number | string;
  status?: HiraStatus;
  page?: number;
  page_size?: number;
}

export interface PaginatedHiraResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: HiraDocumentList[];
}