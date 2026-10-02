// src/services/api.ts
import axios from "axios";

// Axios instance untuk akses API Django (baseURL dari env)
const api = axios.create({
  // Set di .env / Vercel: VITE_API_BASE_URL=https://hse-construction-backend.onrender.com/api
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://hse-construction-backend.onrender.com/api",
  timeout: 15000, // Waktu tunggu maksimal 15 detik
});

// Tambahkan Bearer token ke setiap request jika tersimpan di localStorage
api.interceptors.request.use((config) => {
  // Disinkronkan dengan key 'accessToken' pada AuthContext.tsx
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Penanganan global saat response error
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Jika 401 (Unauthorized): Hapus token & user, lalu alihkan ke halaman login
    if (err?.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;