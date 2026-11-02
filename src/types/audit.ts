// src/types/audit.ts

/**
 * Daftar nilai action audit yang didukung oleh sistem backend.
 * Mencakup aksi umum serta aksi khusus untuk izin kerja dan OTP MK[cite: 4].
 */
export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "submitted"
  | "approved"
  | "rejected"
  | "cancelled"
  | "close_requested"
  | "closed"
  | "photo_added"
  | "photo_removed"
  | "attachment_added"
  | "attachment_removed"
  | "mk_link_issued"
  | "mk_otp_sent"
  | "mk_otp_failed";

/**
 * Representasi entri audit (List Row & Detail Row).
 * Field utama bersifat stabil untuk logika, sedangkan field display digunakan untuk tampilan UI[cite: 3, 4].
 */
export interface AuditEntry {
  id: string | number;
  timestamp: string;
  action: AuditAction;
  action_label: string;          // Teks tampilan untuk aksi (dapat berubah kata-katanya)[cite: 4]
  resource_type: string;         // Contoh: permits.permit, hira.hiradocument, dll[cite: 4]
  resource_label: string;        // Label sumber (misal: Izin Kerja, HIRA)[cite: 3]
  resource_id: string;
  resource_title: string;        // Judul/nama dari sumber terkait[cite: 3]
  project: string | number | null;
  project_name: string | null;   // Nama proyek[cite: 3]
  actor_name: string;            // Nama aktor yang melakukan tindakan[cite: 3]
  actor_role: string;            // Peran aktor (kunci stabil untuk logika)[cite: 4]
  summary: string | null;        // Ringkasan satu baris (bisa kosong)[cite: 4]
  remarks: string | null;        // Catatan atau alasan yang telah dibersihkan[cite: 4]

  // Field tambahan (hanya tersedia pada detail row untuk role HSE Officer & Coordinator)[cite: 4]
  user?: string | number | null;
  actor_label?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  snapshot?: Record<string, unknown> | null;
}

export interface AuditResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditEntry[];
}

/**
 * Parameter query untuk pemanggilan endpoint GET /audit/.
 */
export interface AuditQueryParams {
  page?: number;
  page_size?: number;        // Default 50, batas maksimal 200[cite: 3]
  resource_type?: string;
  resource_id?: string;
  action?: string;
  date_from?: string;        // Format tanggal YYYY-MM-DD[cite: 3]
  date_to?: string;          // Format tanggal YYYY-MM-DD[cite: 3]
  project?: string;
  user?: string;
  search?: string;           // Ditambahkan kembali agar fitur search aktif dan tidak error
}