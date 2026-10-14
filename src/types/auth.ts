// src/types/auth.ts
export type Role =
  | "subcontractor"
  | "supervisor"
  | "hse_officer"
  | "hse_coordinator"
  | "project_manager";

export interface AuthUser {
  id?: number;
  email: string;
  username?: string;
  full_name: string;
  role: Role;
  created_at?: string;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}