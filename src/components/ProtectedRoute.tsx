// src/components/ProtectedRoute.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Impor type Role dari src/types/auth (bukan dari AuthContext)
import type { Role } from "../types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, accessToken } = useAuth();

  // 1. Jika belum login (tidak ada token atau user), tendang ke /login
  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Jika route memiliki batasan role tertentu dan role user tidak sesuai
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Jika lolos validasi, tampilkan halaman tujuan
  return <>{children}</>;
}