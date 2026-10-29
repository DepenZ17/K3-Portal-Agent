// src/services/dashboardServices.ts
import api from "./api";

/**
 * Interface untuk menampung statistik ringkasan Dashboard.
 * Data diisi secara dinamis oleh backend sesuai dengan role pengguna yang login.
 */
export interface DashboardStats {
  /** Jumlah dokumen yang sudah disetujui (Khusus Role Subcontractor) */
  approved_count?: number;
  /** Jumlah dokumen yang sedang menanti verifikasi/reviu */
  pending_count?: number;
  /** Jumlah dokumen yang ditolak (Khusus Role Subcontractor) */
  rejected_count?: number;
  /** Total keseluruhan dokumen HIRA yang terdaftar (Khusus Role Approver/HSE/PM) */
  total_hira?: number;
  /** Total keseluruhan izin kerja (Work Permit) yang terdaftar (Khusus Role Approver/HSE/PM) */
  total_permits?: number;
}

/**
 * Interface untuk menampung item antrean tugas (Approval Queue) di Dashboard.
 * Berisi ringkasan dokumen yang memerlukan tindakan cepat dari pengguna.
 * Catatan: URL rute dikendalikan sepenuhnya oleh frontend.
 */
export interface DashboardTask {
  /** ID unik dokumen dari database */
  id: number;
  /** Judul atau deskripsi singkat tugas */
  title: string;
  /** Kategori dokumen untuk penanda badge (contoh: "Izin Kerja" atau "HIRA") */
  category: string;
  /** Status workflow terkini dokumen */
  status: string;
}

/**
 * Mengambil ringkasan statistik operasional K3 dari backend.
 * @returns Promise berisi objek statistik (DashboardStats)
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>("/api/dashboard/stats/");
  return response.data;
}

/**
 * Mengambil daftar antrean tugas atau dokumen yang memerlukan tindakan persetujuan (approval).
 * Mendukung format response array langsung maupun response paginasi DRF ({ results: [...] }).
 * @returns Promise berisi daftar array antrean tugas (DashboardTask[])
 */
export async function getDashboardTasks(): Promise<DashboardTask[]> {
  const response = await api.get<DashboardTask[] | { results: DashboardTask[] }>("/api/dashboard/tasks/");
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  return response.data.results || [];
}