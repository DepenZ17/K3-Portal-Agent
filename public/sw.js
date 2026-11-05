// public/sw.js

// Event listener saat ada notifikasi push masuk dari server
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Notifikasi Portal K3";
  
  // Menentukan URL target secara dinamis berdasarkan type dan resource_id (sesuai aturan spesifikasi)
  let targetUrl = data.url;
  if (!targetUrl && data.type && data.resource_id) {
    const normalizedType = String(data.type).toLowerCase();
    if (normalizedType.includes("hira")) {
      targetUrl = `/hira/${data.resource_id}`;
    } else if (normalizedType.includes("permit") || normalizedType.includes("izin")) {
      targetUrl = `/work-permit/${data.resource_id}`;
    }
  }
  // Fallback default jika tidak ada rute spesifik
  targetUrl = targetUrl || "/work-permit/list";

  const options = {
    body: data.body || "Ada pembaruan status atau dokumen K3 terbaru.",
    icon: "/favicon.ico", // Path ke ikon aplikasi K3
    badge: "/favicon.ico", // Ikon kecil untuk bar notifikasi Android
    data: {
      url: targetUrl,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Event listener saat pengguna mengklik notifikasi
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data.url || "/work-permit/list";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Jika tab aplikasi sudah terbuka, fokuskan ke tab tersebut
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // Jika tab belum terbuka, buka tab baru menuju URL target
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});