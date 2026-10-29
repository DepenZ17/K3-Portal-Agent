//src/services/pushService.ts
// Fungsi helper untuk mengonversi VAPID key dari string base64 ke Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush(vapidPublicKey: string) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push messaging tidak didukung di browser ini.");
    return;
  }

  try {
    // 1. Daftarkan Service Worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // 2. Minta izin notifikasi ke pengguna
    const permissionResult = await Notification.requestPermission();
    if (permissionResult !== "granted") {
      throw new Error("Izin notifikasi ditolak oleh pengguna.");
    }

    // 3. Lakukan Subscribe ke Push Manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log("Push Subscription berhasil:", JSON.stringify(subscription));

    // 4. (Opsional) Kirim objek subscription ini ke backend Anda via API POST
    // await axios.post('/api/push/subscribe/', subscription);

    return subscription;
  } catch (error) {
    console.error("Gagal melakukan subscribe push notification:", error);
  }
}