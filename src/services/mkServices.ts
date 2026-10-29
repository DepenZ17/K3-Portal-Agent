// src/services/mkServices.ts
import axios from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

export interface MkPortalResponse {
  state: string;
  contact_name: string;
  expires_at: string;
  permit: Record<string, unknown>;
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