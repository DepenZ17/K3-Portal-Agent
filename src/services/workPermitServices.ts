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
  PaginatedWorkPermitResponse,
} from "../types/workPermit";

import type { AxiosError } from "axios";

const BASE_URL = "/permits";

// ==========================================
// ERROR HANDLING
// ==========================================

/**
 * Mengambil pesan error dari respons API.
 * Mendukung pesan string, field validation, dan error jaringan.
 */
export const getWorkPermitErrorMessage = (
  error: unknown
): string => {
  const axiosError = error as AxiosError<
    Record<string, unknown>
  >;

  const data = axiosError.response?.data;

  if (data) {
    // Error berupa detail string
    if (typeof data.detail === "string") {
      return data.detail;
    }

    // Error berupa pesan string
    if (typeof data.message === "string") {
      return data.message;
    }

    // Error validasi Django REST Framework
    const validationMessages = Object.entries(data)
      .map(([field, value]) => {
        if (Array.isArray(value)) {
          return `${field}: ${value.join(", ")}`;
        }

        if (typeof value === "string") {
          return `${field}: ${value}`;
        }

        return null;
      })
      .filter((message): message is string => message !== null);

    if (validationMessages.length > 0) {
      return validationMessages.join("\n");
    }
  }

  if (axiosError.response) {
    return `Terjadi kesalahan server (${axiosError.response.status}).`;
  }

  if (axiosError.request) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  }

  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan yang tidak diketahui.";
};

// ==========================================
// HIRA OPTIONS PICKER
// ==========================================

export interface HiraOptionItem {
  id: number;
  work_package: string;
  work_area: string;
  document_number: string | null;
  document_date: string | null;
  created_by_name: string;
  mine: boolean;
  groups: Array<{
    id: number;
    location_function: string;
    applicable_regulation: string;
    order: number;
    activities: Array<{
      id: number;
      activity_name: string;
      potential_hazard: string;
      initial_category: string;
    }>;
  }>;
}

// Mengambil dokumen HIRA approved berdasarkan proyek
export const getApprovedHiraDocumentsByProject = async (
  projectId: number | string
): Promise<HiraOptionItem[]> => {
  const response = await api.get<HiraOptionItem[]>(
    `${BASE_URL}/hira-options/`,
    {
      params: {
        project: projectId,
      },
    }
  );

  return response.data;
};

// ==========================================
// WORK PERMIT CRUD
// ==========================================

// 1. Get List Work Permits
export const getWorkPermits = async (
  params?: WorkPermitListParams
): Promise<WorkPermitListItem[] | PaginatedWorkPermitResponse> => {
  const response = await api.get<
    WorkPermitListItem[] | PaginatedWorkPermitResponse
  >(`${BASE_URL}/`, { params });

  return response.data;
};

// 2. Get Form Schema
export const getWorkPermitFormSchema = async (
  type: PermitType = "working_at_height"
) => {
  const response = await api.get(`${BASE_URL}/form-schema/`, {
    params: { type },
  });

  return response.data;
};

// 3. Create Work Permit
export const createWorkPermit = async (
  payload: WorkPermitPayload
): Promise<WorkPermitDetail> => {
  const response = await api.post(`${BASE_URL}/`, payload);
  return response.data;
};

// 4. Get Detail Work Permit
export const getWorkPermitById = async (
  id: string | number
): Promise<WorkPermitDetail> => {
  const response = await api.get(`${BASE_URL}/${id}/`);
  return response.data;
};

// 5. Update Work Permit
export const updateWorkPermit = async (
  id: string | number,
  payload: Partial<WorkPermitPayload>
): Promise<WorkPermitDetail> => {
  const response = await api.patch(`${BASE_URL}/${id}/`, payload);
  return response.data;
};

// 6. Delete Draft
export const deleteWorkPermit = async (
  id: string | number
): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}/`);
};

// ==========================================
// WORKFLOW & ACTION ENDPOINTS
// ==========================================

// Submit permit
export const submitWorkPermit = async (
  id: string | number,
  locationData: SubmitPermitPayload
): Promise<WorkPermitDetail> => {
  const response = await api.post(
    `${BASE_URL}/${id}/submit/`,
    locationData
  );

  return response.data;
};

// Approve permit
export const approveWorkPermit = async (
  id: string | number,
  payload?: ApprovePermitPayload
): Promise<WorkPermitDetail> => {
  const response = await api.post(
    `${BASE_URL}/${id}/approve/`,
    payload
  );

  return response.data;
};

// Reject permit
export const rejectWorkPermit = async (
  id: string | number,
  remarks: string
): Promise<WorkPermitDetail> => {
  const response = await api.post(
    `${BASE_URL}/${id}/reject/`,
    { remarks }
  );

  return response.data;
};

// Cancel permit
export const cancelWorkPermit = async (
  id: string | number,
  reason: string
): Promise<WorkPermitDetail> => {
  const response = await api.post(
    `${BASE_URL}/${id}/cancel/`,
    { reason }
  );

  return response.data;
};

// Request Close
export const requestCloseWorkPermit = async (
  id: string | number,
  postWorkEvaluation: string
): Promise<WorkPermitDetail> => {
  const response = await api.post(
    `${BASE_URL}/${id}/request-close/`,
    {
      post_work_evaluation: postWorkEvaluation,
    }
  );

  return response.data;
};

// Confirm Close
export const confirmCloseWorkPermit = async (
  id: string | number
): Promise<WorkPermitDetail> => {
  const response = await api.post(
    `${BASE_URL}/${id}/confirm-close/`
  );

  return response.data;
};

// Set Document Number
export const setWorkPermitNumber = async (
  id: string | number,
  documentNumber: string
): Promise<WorkPermitDetail> => {
  const response = await api.post(
    `${BASE_URL}/${id}/set-number/`,
    {
      document_number: documentNumber,
    }
  );

  return response.data;
};

// ==========================================
// EVIDENCE / PHOTO ENDPOINTS
// ==========================================

// Upload foto before / after
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

  const response = await api.post(
    `${BASE_URL}/${id}/photos/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Delete photo
export const deleteWorkPermitPhoto = async (
  id: string | number,
  photoId: string | number
): Promise<void> => {
  await api.delete(
    `${BASE_URL}/${id}/photos/${photoId}/`
  );
};

// ==========================================
// ATTACHMENTS (PDF) ENDPOINTS
// ==========================================

// Upload medical / certificate PDF
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

  const response = await api.post(
    `${BASE_URL}/${id}/attachments/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Delete attachment
export const deleteWorkPermitAttachment = async (
  id: string | number,
  attachmentId: string | number
): Promise<void> => {
  await api.delete(
    `${BASE_URL}/${id}/attachments/${attachmentId}/`
  );
};

// ==========================================
// MK RESEND LINK
// ==========================================

export const resendMkLink = async (
  id: string | number
): Promise<WorkPermitDetail> => {
  const response = await api.post(
    `${BASE_URL}/${id}/mk-resend/`
  );

  return response.data;
};
