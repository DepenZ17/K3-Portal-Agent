// src/utils/pushNotifications.ts

// Helper konversi Public VAPID Key dari Base64 ke Uint8Array (standar Web Push Protocol)
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

export async function registerAndSubscribePush(
  vapidPublicKey: string,
  accessToken: string
): Promise<PushSubscription | undefined> {
  // 1. Cek dukungan browser terhadap Service Worker & Push API
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Browser ini tidak mendukung Web Push Notification.");
    return undefined;
  }

  try {
    // 2. Minta izin notifikasi dari pengguna
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Izin notifikasi ditolak oleh pengguna.");
      return undefined;
    }

    // 3. Registrasi Service Worker dari public/sw.js
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // 4. Ambil atau buat Subscription baru
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription && vapidPublicKey) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource,
      });
    }

    // 5. Kirim subscription JSON ke Backend (jika API sudah siap)
    if (subscription && accessToken) {
      /* 
      await fetch("/api/v1/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(subscription),
      });
      */
      console.log("Web Push Subscription Siap:", JSON.stringify(subscription));
    }

    return subscription || undefined;
  } catch (error) {
    console.error("Gagal mendaftarkan Web Push Notification:", error);
    return undefined;
  }
}