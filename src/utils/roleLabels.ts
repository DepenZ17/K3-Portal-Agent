// src/utils/roleLabels.ts
import type { Role } from "../types/auth";

/** Label Tampilan Bahasa Indonesia untuk UI/Badges */
export const ROLE_LABELS: Record<Role, string> = {
  subcontractor: "Subkontraktor",
  supervisor: "Supervisor Lapangan",
  hse_officer: "HSE Officer",
  hse_coordinator: "HSE Coordinator",
  project_manager: "Project Manager",
};

/** Utility untuk mengambil label nama role yang aman */
export const getRoleLabel = (role: Role | string): string => {
  return ROLE_LABELS[role as Role] || role;
};