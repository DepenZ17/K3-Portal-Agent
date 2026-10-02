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
  const options = {
    body: data.body || "Ada pembaruan status atau dokumen K3 terbaru.",
    icon: "/favicon.ico", // Path ke ikon aplikasi K3
    badge: "/favicon.ico", // Ikon kecil untuk bar notifikasi Android
    data: {
      url: data.url || "/work-permit/list", // Fallback URL saat notifikasi diklik
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Event listener saat pengguna mengklik notifikasi
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data.url;

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