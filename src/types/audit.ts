// src/types/audit.ts
export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "submitted"
  | "approved"
  | "rejected"
  | "cancelled"
  | "close_requested"  // Pengajuan tutup izin kerja (sesuai dokumen backend)
  | "closed"           // Tutup resmi izin kerja
  | "number_set"
  | "photo_added";

export interface AuditEntry {
  id: string | number;
  resource_type: string;
  resource_id: string;
  action: AuditAction;
  project: string | number | null;
  user: string | number | null;
  actor_label: string;
  ip_address: string | null;
  user_agent: string;
  timestamp: string;
  remarks: string | null;
  snapshot: Record<string, unknown> | null;
}

export interface AuditResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditEntry[];
}

export interface AuditQueryParams {
  page?: number;
  page_size?: number;        // Maksimal 200
  resource_type?: string;
  resource_id?: string;
  action?: string;
  date_from?: string;        // YYYY-MM-DD
  date_to?: string;          // YYYY-MM-DD
  project?: string;
  user?: string;
  search?: string;           // Tidak ada di daftar filter dokumen, lihat catatan di bawah
}