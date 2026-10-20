// src/services/workPermitServices.ts
import api from "./api"; // Menggunakan api.ts yang sudah ada
import type { 
  WorkPermitDetail, 
  WorkPermitPayload, 
  WorkPermitListParams, 
  PermitType 
} from "../types/workPermit";

const BASE_URL = "/permits";

// 1. Get List Work Permits (Mendukung filter query)
export const getWorkPermits = async (params?: WorkPermitListParams): Promise<WorkPermitDetail[]> => {
  const response = await api.get(`${BASE_URL}/`, { params });
  return response.data;
};

// 2. Get Form Schema (Pertanyaan checklist, safety areas, PPE options)
export const getWorkPermitFormSchema = async (type: PermitType = "working_at_height") => {
  try {
    const response = await api.get(`${BASE_URL}/form-schema/`, {
      params: { type },
    });
    return response.data;
  } catch {
    console.warn("Gagal memuat form schema dari server, menggunakan data bawaan form.");
    return { safety_areas: [], ppe_options: [] };
  }
};

// 3. Create Work Permit (Mendukung FormData untuk GPS & Foto)
export const createWorkPermit = async (payload: WorkPermitPayload): Promise<WorkPermitDetail> => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "photo" && value instanceof File) {
        formData.append("photo", value);
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await api.post(`${BASE_URL}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Fungsi untuk mengambil dokumen HIRA yang disetujui per proyek
export const getApprovedHiraDocumentsByProject = async (projectId: number | string) => {
  try {
    const response = await api.get(`/hira/documents/`, {
      params: { 
        project: projectId, 
        status: "approved" 
      },
    });
    return response.data;
  } catch {
    console.warn("Gagal memuat dokumen HIRA berdasarkan proyek.");
    return [];
  }
};

// 4. Get Detail Work Permit by ID
export const getWorkPermitById = async (id: string | number): Promise<WorkPermitDetail> => {
  const response = await api.get(`${BASE_URL}/${id}/`);
  return response.data;
};

// 5. Update Work Permit (PATCH - Mendukung FormData untuk file foto & GPS)
export const updateWorkPermit = async (
  id: string | number, 
  payload: Partial<WorkPermitPayload>
): Promise<WorkPermitDetail> => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "photo" && value instanceof File) {
        formData.append("photo", value);
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await api.patch(`${BASE_URL}/${id}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 6. Delete Draft (Hanya draft yang belum pernah di-submit)
export const deleteWorkPermit = async (id: string | number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}/`);
};

// ==========================================
// WORKFLOW & ACTION ENDPOINTS (/permits/{id}/<action>/)
// ==========================================

// Submit permit oleh creator
export const submitWorkPermit = async (id: string | number): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/submit/`);
  return response.data;
};

// Approve oleh role penanggung jawab (Supervisor, Officer, PM)
export const approveWorkPermit = async (id: string | number, remarks?: string): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/approve/`, { remarks });
  return response.data;
};

// Reject (Wajib remarks/alasan)
export const rejectWorkPermit = async (id: string | number, remarks: string): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/reject/`, { remarks });
  return response.data;
};

// Cancel oleh HSE Coordinator
export const cancelWorkPermit = async (id: string | number, reason: string): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/cancel/`, { reason });
  return response.data;
};

// Request Close oleh Creator (Wajib post_work_evaluation)
export const requestCloseWorkPermit = async (id: string | number, postWorkEvaluation: string): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/request-close/`, {
    post_work_evaluation: postWorkEvaluation,
  });
  return response.data;
};

// Confirm Close oleh HSE Officer (Saat status pending_close)
export const confirmCloseWorkPermit = async (id: string | number): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/confirm-close/`);
  return response.data;
};

// Set Nomor Dokumen oleh HSE Officer / HSE Coordinator
export const setWorkPermitNumber = async (id: string | number, documentNumber: string): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/set-number/`, {
    document_number: documentNumber,
  });
  return response.data;
};