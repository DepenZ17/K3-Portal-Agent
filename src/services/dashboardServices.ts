// src/services/dashboardServices.ts
import api from "./api";

/** Hitungan dokumen per jenis (HIRA atau izin kerja). total tidak termasuk dokumen yang dibatalkan. */
export interface DocumentCounts {
  total: number;
  draft: number;
  /** Sedang direviu (untuk izin kerja: termasuk menunggu MK dan menunggu penutupan) */
  pending: number;
  /** Untuk izin kerja: sudah termasuk yang ditutup */
  approved: number;
  rejected: number;
}

/** GET /dashboard/stats/ — bentuknya sama untuk semua role; isinya mengikuti apa yang boleh dilihat role itu. */
export interface DashboardStats {
  role: string;
  hira: DocumentCounts;
  permits: DocumentCounts;
  /** Jumlah antrean tugas. Angka untuk tile "Pending Aksi". Tidak bergantung pada ?limit= */
  pending_action: number;
}

export type DashboardTaskType = "permit" | "hira";

/** GET /dashboard/tasks/ */
export interface DashboardTask {
  id: number;
  /** Buka dokumen dengan type + id. Urutan id HIRA dan izin kerja bisa sama. */
  type: DashboardTaskType;
  /** Teks tampilan, jangan dipakai untuk logika */
  title: string;
  /** Hanya teks badge */
  category: string;
  /** Kunci status workflow, mis. pending_supervisor */
  status: string;
  status_label: string;
  project: number;
  project_name: string;
  /** subcontractor | supervisor | hse_officer | project_manager | mk. Bandingkan dengan role pengguna. */
  waiting_on: string;
  waiting_on_label: string;
  updated_at: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>("/dashboard/stats/");
  return response.data;
}

/** Array polos (tanpa paginasi), yang paling lama menunggu di urutan pertama. limit default 10, maksimal 50. */
export async function getDashboardTasks(limit = 10): Promise<DashboardTask[]> {
  const response = await api.get<DashboardTask[]>("/dashboard/tasks/", { params: { limit } });
  return Array.isArray(response.data) ? response.data : [];
}