// src/context/AuthContext.tsx
import { createContext, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser, Role } from "../types/auth";

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  role: Role | "";
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem("accessToken") || null;
  });

  const login = (token: string, userData: AuthUser) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
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