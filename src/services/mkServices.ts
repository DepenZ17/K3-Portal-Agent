import axios from "axios";

// 1. URL Base Fallback ke Render jika VITE_API_BASE_URL belum ter-inject
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://hse-construction-backend.onrender.com/api";

const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

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
  approvals?: Array<{
    step: string;
    decision: string;
    remarks?: string;
    decided_at?: string;
    decided_by?: string;
  }>;
  [key: string]: unknown; // Mengizinkan field tambahan dari JSON backend
}

// 3. Response Portal Data MK
export interface MkPortalResponse {
  state: string;
  contact_name: string;
  expires_at: string;
  permit: PermitDetail;
}

export interface OtpDetails {
  sent?: boolean;
  expires_at?: string;
  attempts_left?: number;
  can_request_in_seconds?: number;
  requests_left?: number;
}

export interface OtpResponse {
  otp?: OtpDetails;
}

// ----------------------------------------------------
// API Methods
// ----------------------------------------------------

// 1. Get Portal Data
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

// 4. Tolak Permohonan oleh MK
export const rejectMkPermit = async (
  token: string, 
  payload: { otp: string; full_name: string; remarks: string }
) => {
  const response = await publicApi.post(`/mk/${token}/reject/`, payload);
  return response.data;
};