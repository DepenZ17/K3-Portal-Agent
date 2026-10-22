// src/context/AuthContextDef.ts
import { createContext } from "react";
import type { AuthUser, Role } from "../types/auth";

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  role: Role | "";
  login: (token: string, userData: AuthUser, refreshToken?: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);