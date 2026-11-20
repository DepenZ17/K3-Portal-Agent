// src/services/mkServices.ts
import axios from "axios";

// 1. URL Base Fallback ke Render jika VITE_API_BASE_URL belum ter-inject
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://hse-construction-backend.onrender.com/api";

const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

export interface MkHiraActivity {
  id?: number;
  activity_name?: string;
  potential_hazard?: string;
  risk_impact?: string;
  initial_category?: string;
  residual_category?: string;
  [key: string]: unknown;
}

export interface MkHiraGroup {
  id?: number;
  location_function?: string;
  applicable_regulation?: string;
  order?: number;
  activities?: MkHiraActivity[];
}

export interface MkHiraDocumentItem {
  document: {
    id: number;
    work_package: string;
    work_area: string;
    document_number: string | null;
    document_date: string | null;
    status: string;
    created_by_name?: string;
  };
  groups: MkHiraGroup[];
}

// 2. Definisi Tipe Detail Permit (Izin Kerja)
export interface PermitDetail {
  id?: number;
  project?: string;
  permit_type?: string;
  permit_type_label?: string;
  document_number?: string;
  work_date?: string;
  work_start?: string;
  work_end?: string;
  work_location?: string;
  work_description?: string;
  equipment_used?: string;
  person_in_charge?: string;
  worker_count?: number;
  risk_category?: string;
  applicant?: string;
  hira_activity_ids?: number[];
  hira_document_ids?: number[];
  hira?: {
    documents: MkHiraDocumentItem[];
  } | null;
  approvals?: Array<{
    step: string;
    decision: string;
    remarks?: string;
    decided_at?: string;
    decided_by?: string;
  }>;
  [key: string]: unknown;
}

export interface OtpDetails {
  sent?: boolean;
  expires_at?: string;
  attempts_left?: number;
  can_request_in_seconds?: number;
  requests_left?: number;
}

// 3. Response Portal Data MK (Ditambahkan properti otp sesuai spesifikasi backend)
export interface MkPortalResponse {
  state: string;
  contact_name: string;
  expires_at: string;
  otp?: OtpDetails;
  permit: PermitDetail;
}

export interface OtpResponse {
  otp?: OtpDetails;
}

// ----------------------------------------------------
// API Methods (Publik tanpa Header Auth)
// ----------------------------------------------------

// 1. Get Portal Data (Satu-satunya yang dipanggil saat halaman dimuat)
export const getMkPortalData = async (token: string): Promise<MkPortalResponse> => {
  const response = await publicApi.get<MkPortalResponse>(`/mk/${token}/`);
  return response.data;
};

// 2. Kirim Kode OTP
export const sendMkOtp = async (token: string): Promise<OtpResponse> => {
  const response = await publicApi.post<OtpResponse>(`/mk/${token}/send-otp/`);
  return response.data;
};

// 3. Setujui Permohonan oleh MK
export const approveMkPermit = async (
  token: string,
  payload: { otp: string; full_name: string; remarks?: string }
) => {
  const response = await publicApi.post(`/mk/${token}/approve/`, payload);
  return response.data;
};

// 4. Tolak Permohonan oleh MK (Remarks wajib)
export const rejectMkPermit = async (
  token: string,
  payload: { otp: string; full_name: string; remarks: string }
) => {
  const response = await publicApi.post(`/mk/${token}/reject/`, payload);
  return response.data;
};