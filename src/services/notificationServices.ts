// src/services/notificationServices.ts
import api from "./api";

export interface NotificationItem {
  id: number;
  kind: string;
  title: string;
  body: string;
  type: string;
  resource_id: number;
  project: number | null;
  project_name: string | null;
  status: string;
  created_at: string;
  read_at: string | null;
  needs_action: boolean;
  resolved_at: string | null;
  resolved_by_name: string;
  resolution_note: string;
}

export interface NotificationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NotificationItem[];
}

/** Mengambil jumlah notifikasi yang belum dibaca (untuk angka merah di lonceng)[cite: 7] */
export async function getUnreadCount(): Promise<{ unread_count: number }> {
  const response = await api.get<{ unread_count: number }>("/notifications/unread-count/");
  return response.data;
}

/** Mengambil daftar notifikasi untuk dropdown[cite: 7] */
export async function getNotifications(params?: { page?: number; unread?: boolean }): Promise<NotificationListResponse> {
  const response = await api.get<NotificationListResponse>("/notifications/", { params });
  return response.data;
}

/** Menandai satu notifikasi telah dibaca[cite: 7] */
export async function markNotificationAsRead(id: number): Promise<NotificationItem> {
  const response = await api.post<NotificationItem>(`/notifications/${id}/read/`);
  return response.data;
}

/** Menandai seluruh notifikasi telah dibaca[cite: 7] */
export async function markAllNotificationsAsRead(): Promise<{ updated: number }> {
  const response = await api.post<{ updated: number }>("/notifications/read-all/");
  return response.data;
}