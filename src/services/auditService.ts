// src/services/auditService.ts
import api from "./api";
import type { AuditQueryParams, AuditResponse, AuditEntry } from "../types/audit"; 

/**
 * Mengambil daftar audit log dari backend.
 */
export const getAuditLogs = async (params?: AuditQueryParams): Promise<AuditResponse> => {
  const response = await api.get<AuditResponse>("/audit/", { params });
  return response.data;
};

/**
 * Mengambil detail lengkap audit log berdasarkan ID (GET /audit/{id}/).
 * Menyediakan ip_address, user_agent, dan snapshot untuk HSE Officer & Coordinator.
 */
export const getAuditLogDetail = async (id: string | number): Promise<AuditEntry> => {
  const response = await api.get<AuditEntry>(`/audit/${id}/`);
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

/**
 * Helper khusus untuk mengambil riwayat / audit trail dari 1 Work Permit tertentu
 */
export const getWorkPermitHistory = async (
  permitId: string | number,
  params?: Omit<AuditQueryParams, "resource_type" | "resource_id">
): Promise<AuditResponse> => {
  return getAuditLogs({
    ...params,
    resource_type: "permits.permit",
    resource_id: String(permitId),
  });
};