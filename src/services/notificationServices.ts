// src/services/notificationServices.ts
import api from "./api";

/**
 * Struktur notifikasi internal.
 * target_type dan target_id dipakai frontend untuk merangkai rute navigasi.
 */
export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  /** Jenis dokumen tujuan, contoh: "work_permit", "hira" */
  target_type: string;
  /** ID dokumen tujuan */
  target_id: number;
  is_read: boolean;
  created_at?: string;
}

type NotificationListResponse = NotificationItem[] | { results?: NotificationItem[] };

/** Daftar notifikasi pengguna yang sedang login (mendukung array langsung maupun paginasi). */
export async function getNotifications(): Promise<NotificationItem[]> {
  const response = await api.get<NotificationListResponse>("/notifications/");
  const data = response.data;
  return Array.isArray(data) ? data : data.results ?? [];
}

/** Tandai satu notifikasi sudah dibaca. */
export async function markNotificationAsRead(id: number): Promise<void> {
  await api.post(`/notifications/${id}/read/`);
}