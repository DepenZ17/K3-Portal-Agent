// src/services/pushService.ts
import api from "./api"; // Jika ingin langsung mengirim subscription ke backend

/** Mengelola izin web push notification di browser */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("Browser ini tidak mendukung Web Push Notification.");
    return "denied";
  }
  const permission = await Notification.requestPermission();
  return permission;
}

/** Mendaftarkan Service Worker untuk kebutuhan Web Push */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker berhasil didaftarkan.");
      return registration;
    } catch (error) {
      console.error("Gagal mendaftarkan Service Worker:", error);
    }
  }
}

/** Helper untuk mengubah VAPID key dari string (base64) ke Uint8Array */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Mendaftarkan browser ke Push Manager dan mengirimkan subscription ke backend */
export async function subscribeUserToPush(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string
): Promise<PushSubscription | undefined> {
  try {
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // Tambahkan type assertion di sini untuk mengatasi error tipe data TypeScript
      applicationServerKey: applicationServerKey as unknown as BufferSource,
    });

    // Kirim objek subscription ke backend
    await api.post("/notifications/push-subscribe/", subscription);
    
    return subscription;
  } catch (error) {
    console.error("Gagal melakukan subscribe push notification:", error);
  }
}