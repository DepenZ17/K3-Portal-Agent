// src/context/AuthContext.tsx
import { useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../types/auth";
import { AuthContext } from "./AuthContextDef";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("accessToken") || null;
    } catch {
      localStorage.removeItem("accessToken");
      return null;
    }
  });

  const login = (token: string, userData: AuthUser, refreshToken?: string) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        role: user?.role || "",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}