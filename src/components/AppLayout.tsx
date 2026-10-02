// src/components/AppLayout.tsx
import type { ReactNode } from "react";
import { useEffect } from "react";
import Navbar from "./Navbar";
import { useAuth } from "../hooks/useAuth";
import { registerAndSubscribePush } from "../utils/pushNotifications";

interface AppLayoutProps {
  children: ReactNode;
}

// Ganti string ini nanti saat Backend sudah memberikan VAPID Public Key asli
const DUMMY_VAPID_PUBLIC_KEY = "";

export default function AppLayout({ children }: AppLayoutProps) {
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      registerAndSubscribePush(DUMMY_VAPID_PUBLIC_KEY, accessToken);
    }
  }, [accessToken]);

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />
      <main className="flex-grow-1 py-4">
        <div className="container-fluid px-4 px-lg-5">{children}</div>
      </main>
    </div>
  );
}