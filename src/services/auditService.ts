// src/services/auditService.ts
import api from "./api";
import type { AuditQueryParams, AuditResponse } from "../types/audit"; 

/**
 * Mengambil daftar audit log dari backend.
 * Mendukung filter (resource_type, resource_id, project, user, action, dll) 
 * serta paginasi (page, page_size).
 */
export const getAuditLogs = async (params?: AuditQueryParams): Promise<AuditResponse> => {
  const response = await api.get<AuditResponse>("/audit/", { params });
  return response.data;
};

/**
 * Helper khusus untuk mengambil riwayat / audit trail dari 1 dokumen HIRA tertentu
 */
export const getHiraDocumentHistory = async (
  documentId: string | number,
  params?: Omit<AuditQueryParams, "resource_type" | "resource_id">
): Promise<AuditResponse> => {
  return getAuditLogs({
    ...params,
    resource_type: "hira.hiradocument",
    resource_id: String(documentId),
  });
};