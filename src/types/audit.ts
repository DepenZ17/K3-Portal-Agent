// src/types/audit.ts
export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "submitted"
  | "approved"
  | "rejected"
  | "cancelled";

export interface AuditEntry {
  id: string | number;
  resource_type: string;
  resource_id: string;
  action: AuditAction;
  project: string | number | null;
  user: string | number | null;
  actor_label: string;
  ip_address: string;
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
  page_size?: number;
  resource_type?: string;
  resource_id?: string;
  action?: string;
  date_from?: string;
  date_to?: string;
  project?: string;
  user?: string;
  search?: string;
}
