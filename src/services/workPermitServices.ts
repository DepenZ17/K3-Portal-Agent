// src/services/workPermitServices.ts
import api from "./api";
import type {
  WorkPermitDetail,
  WorkPermitListItem,
  WorkPermitPayload,
  WorkPermitListParams,
  PermitType,
  SubmitPermitPayload,
  ApprovePermitPayload,
} from "../types/workPermit";

const BASE_URL = "/permits";

// Tambahkan interface ini (bisa ditaruh di workPermit.ts atau langsung di sini)
export interface PaginatedWorkPermitResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: WorkPermitListItem[];
}

// 1. Get List Work Permits (Mendukung filter query & paginasi)
export const getWorkPermits = async (
  params?: WorkPermitListParams
): Promise<WorkPermitListItem[] | PaginatedWorkPermitResponse> => {
  const response = await api.get<WorkPermitListItem[] | PaginatedWorkPermitResponse>(`${BASE_URL}/`, { params });
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

// 3. Create Work Permit (JSON). Foto diunggah terpisah lewat uploadWorkPermitPhotos.
export const createWorkPermit = async (payload: WorkPermitPayload): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/`, payload);
  return response.data;
};

// Fungsi untuk mengambil dokumen HIRA yang disetujui per proyek
export const getApprovedHiraDocumentsByProject = async (projectId: number | string) => {
  try {
    const response = await api.get(`/hira/documents/`, {
      params: {
        project: projectId,
        status: "approved",
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

// 5. Update Work Permit (PATCH, JSON). Hanya saat draft atau rejected.
export const updateWorkPermit = async (
  id: string | number,
  payload: Partial<WorkPermitPayload>
): Promise<WorkPermitDetail> => {
  const response = await api.patch(`${BASE_URL}/${id}/`, payload);
  return response.data;
};

// 6. Delete Draft (Hanya draft yang belum pernah di-submit)
export const deleteWorkPermit = async (id: string | number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}/`);
};

// ==========================================
// WORKFLOW & ACTION ENDPOINTS (/permits/{id}/<action>/)
// ==========================================

// Submit permit oleh creator (wajib lokasi + minimal 1 foto "before")
export const submitWorkPermit = async (id: string | number, locationData: SubmitPermitPayload): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/submit/`, locationData);
  return response.data;
};

// Approve oleh role penanggung jawab. Supervisor & HSE Officer wajib menyertakan lokasi, PM tidak.
export const approveWorkPermit = async (id: string | number, payload?: ApprovePermitPayload): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/approve/`, payload);
  return response.data;
};

// Reject (Wajib remarks/alasan, tanpa lokasi)
export const rejectWorkPermit = async (id: string | number, remarks: string): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/reject/`, { remarks });
  return response.data;
};

// Cancel oleh HSE Coordinator
export const cancelWorkPermit = async (id: string | number, reason: string): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/cancel/`, { reason });
  return response.data;
};

// Request Close oleh Creator (wajib post_work_evaluation + minimal 1 foto "after")
export const requestCloseWorkPermit = async (id: string | number, postWorkEvaluation: string): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/request-close/`, {
    post_work_evaluation: postWorkEvaluation,
  });
  return response.data;
};

// Confirm Close oleh HSE Officer (saat status pending_close)
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

// ==========================================
// EVIDENCE / PHOTO ENDPOINTS (/permits/{id}/photos/)
// ==========================================

// Upload foto bukti lapangan (JPEG/PNG/WebP, maks 5 MB per file, maks 5 per stage)
// "before": saat draft/rejected. "after": saat approved, sebelum request-close.
export const uploadWorkPermitPhotos = async (
  id: string | number,
  stage: "before" | "after",
  files: File[]
): Promise<WorkPermitDetail> => {
  const formData = new FormData();
  formData.append("stage", stage);

  files.forEach((file) => {
    formData.append("photos", file);
  });

  const response = await api.post(`${BASE_URL}/${id}/photos/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Hapus foto bukti lapangan berdasarkan ID foto (aturan status sama dengan upload)
export const deleteWorkPermitPhoto = async (id: string | number, photoId: string | number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}/photos/${photoId}/`);
};

// ==========================================
// ATTACHMENTS (PDF) ENDPOINTS (/permits/{id}/attachments/)
// ==========================================

// Upload lampiran PDF wajib (kind: "medical" atau "certificate", maks 3 MB per file)
export const uploadWorkPermitAttachments = async (
  id: string | number,
  kind: "medical" | "certificate",
  files: File[]
): Promise<WorkPermitDetail> => {
  const formData = new FormData();
  formData.append("kind", kind);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post(`${BASE_URL}/${id}/attachments/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Hapus lampiran PDF tertentu berdasarkan ID attachment
export const deleteWorkPermitAttachment = async (
  id: string | number,
  attachmentId: string | number
): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}/attachments/${attachmentId}/`);
};

// ==========================================
// MK RESEND LINK ENDPOINT (/permits/{id}/mk-resend/)
// ==========================================

// Kirim ulang tautan persetujuan MK (Manajemen Konstruksi) saat status pending_mk
export const resendMkLink = async (id: string | number): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/${id}/mk-resend/`);
  return response.data;
};