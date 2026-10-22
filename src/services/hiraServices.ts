// src/services/hiraServices.ts
import api from "./api";
import type {
  Project,
  ProjectOption,
  HiraDocumentList,
  HiraDetailResponse,
  HiraFormPayload,
  HiraGroup,
  HiraActivity,
  HiraStatus,
} from "../types/hira";

// ==========================================
// 1. PROJECT SERVICES
// ==========================================

/**
 * Mengambil daftar proyek aktif saja (?is_active=true)
 * Digunakan khusus untuk opsi dropdown/select di Form HIRA
 */
export const getActiveProjectOptions = async (): Promise<ProjectOption[]> => {
  const response = await api.get<ProjectOption[]>("/projects/", {
    params: { is_active: true },
  });
  return response.data;
};

/**
 * Mengambil semua daftar proyek yang diizinkan untuk pengguna saat ini.
 */
export const getProjects = async (params?: { is_active?: boolean }): Promise<Project[]> => {
  const response = await api.get<Project[]>("/projects/", { params });
  return response.data;
};

/**
 * Mengambil detail satu proyek berdasarkan ID
 */
export const getProjectById = async (id: number | string): Promise<Project> => {
  const response = await api.get<Project>(`/projects/${id}/`);
  return response.data;
};

// ==========================================
// 2. HIRA DOCUMENT SERVICES (/hira/documents/)
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

/**
 * Mengambil daftar dokumen HIRA (GET /hira/documents/)
 */
export const getHiraDocuments = async (
  params?: HiraQueryParams
): Promise<HiraDocumentList[] | PaginatedHiraResponse> => {
  const response = await api.get<HiraDocumentList[] | PaginatedHiraResponse>("/hira/documents/", { params });
  return response.data;
};

/**
 * Mengambil detail 1 dokumen HIRA (GET /hira/documents/{id}/)
 */
export const getHiraDocumentById = async (id: number | string): Promise<HiraDetailResponse> => {
  const response = await api.get<HiraDetailResponse>(`/hira/documents/${id}/`);
  return response.data;
};

/**
 * Membuat dokumen HIRA baru (POST /hira/documents/)
 */
export const createHiraDocument = async (payload: HiraFormPayload): Promise<HiraDetailResponse> => {
  const response = await api.post<HiraDetailResponse>("/hira/documents/", payload);
  return response.data;
};

/**
 * Update dokumen HIRA (PATCH /hira/documents/{id}/)
 */
export const updateHiraDocument = async (
  id: number | string,
  payload: Partial<HiraFormPayload>
): Promise<HiraDetailResponse> => {
  const response = await api.patch<HiraDetailResponse>(`/hira/documents/${id}/`, payload);
  return response.data;
};

/**
 * Menghapus dokumen HIRA Draft (DELETE /hira/documents/{id}/)
 */
export const deleteHiraDocument = async (id: number | string): Promise<void> => {
  await api.delete(`/hira/documents/${id}/`);
};

// ==========================================
// 3. HIRA DOCUMENT ACTIONS (/hira/documents/{id}/<action>/)
// ==========================================

/**
 * Submit HIRA (Subkontraktor)
 */
export const submitHiraDocument = async (id: number | string): Promise<HiraDetailResponse> => {
  const response = await api.post<HiraDetailResponse>(`/hira/documents/${id}/submit/`);
  return response.data;
};

/**
 * Approve HIRA (HSE Officer / Project Manager)
 */
export const approveHiraDocument = async (
  id: number | string,
  remarks?: string
): Promise<HiraDetailResponse> => {
  const response = await api.post<HiraDetailResponse>(`/hira/documents/${id}/approve/`, { remarks });
  return response.data;
};

/**
 * Reject HIRA (HSE Officer / Project Manager)
 */
export const rejectHiraDocument = async (
  id: number | string,
  remarks: string
): Promise<HiraDetailResponse> => {
  const response = await api.post<HiraDetailResponse>(`/hira/documents/${id}/reject/`, { remarks });
  return response.data;
};

/**
 * Cancel HIRA (HSE Coordinator)
 */
export const cancelHiraDocument = async (
  id: number | string,
  reason: string
): Promise<HiraDetailResponse> => {
  const response = await api.post<HiraDetailResponse>(`/hira/documents/${id}/cancel/`, { reason });
  return response.data;
};

/**
 * Set Nomor Dokumen HIRA (HSE Officer / HSE Coordinator)
 */
export const setHiraDocumentNumber = async (
  id: number | string,
  document_number: string
): Promise<HiraDetailResponse> => {
  const response = await api.post<HiraDetailResponse>(`/hira/documents/${id}/set-number/`, {
    document_number,
  });
  return response.data;
};

// ==========================================
// 4. HIRA GROUP SERVICES (/hira/groups/)
// ==========================================

export interface CreateHiraGroupPayload {
  hira_document: number | string;
  location_function: string;
  applicable_regulation?: string; // Ditambahkan di sini
  order?: number;
}

export interface UpdateHiraGroupPayload {
  location_function?: string;
  applicable_regulation?: string; // Ditambahkan di sini
  order?: number;
}

/**
 * Membuat group lokasi/fungsi baru
 */
export const createHiraGroup = async (payload: CreateHiraGroupPayload): Promise<HiraGroup> => {
  const response = await api.post<HiraGroup>("/hira/groups/", payload);
  return response.data;
};

/**
 * Mengupdate group lokasi/fungsi
 */
export const updateHiraGroup = async (
  id: number | string,
  payload: UpdateHiraGroupPayload
): Promise<HiraGroup> => {
  const response = await api.patch<HiraGroup>(`/hira/groups/${id}/`, payload);
  return response.data;
};

/**
 * Menghapus group
 */
export const deleteHiraGroup = async (id: number | string): Promise<void> => {
  await api.delete(`/hira/groups/${id}/`);
};

// ==========================================
// 5. HIRA ACTIVITY SERVICES (/hira/activities/)
// ==========================================

/**
 * Mengambil daftar aktivitas berdasarkan group atau dokumen HIRA
 */
export const getHiraActivities = async (params: {
  group?: number | string;
  hira_document?: number | string;
}): Promise<HiraActivity[]> => {
  const response = await api.get<HiraActivity[]>("/hira/activities/", { params });
  return response.data;
};

/**
 * Membuat item aktivitas penilaian risiko baru
 */
export const createHiraActivity = async (
  payload: Partial<HiraActivity> & { group: number | string }
): Promise<HiraActivity> => {
  const response = await api.post<HiraActivity>("/hira/activities/", payload);
  return response.data;
};

/**
 * Mengupdate item aktivitas
 */
export const updateHiraActivity = async (
  id: number | string,
  payload: Partial<HiraActivity>
): Promise<HiraActivity> => {
  const response = await api.patch<HiraActivity>(`/hira/activities/${id}/`, payload);
  return response.data;
};

/**
 * Menghapus item aktivitas
 */
export const deleteHiraActivity = async (id: number | string): Promise<void> => {
  await api.delete(`/hira/activities/${id}/`);
};