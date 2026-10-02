// src/types/auth.ts

/** Definisi Role Pengguna di Portal K3 (Sesuai dengan Django TextChoices) */
export type Role =
  | "subcontractor"
  | "supervisor"
  | "hse_officer"
  | "hse_coordinator"
  | "project_manager";

/** Object User yang dikembalikan oleh Backend API */
export interface AuthUser {
  id: number;
  email: string;
  username?: string;
  full_name: string;
  role: Role;
  created_at?: string;
}

/** Request body untuk login API (`/token/` atau `/login/`) */
export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

/** Response standar dari JWT Auth Backend */
export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}