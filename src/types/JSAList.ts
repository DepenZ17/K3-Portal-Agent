// src/types/JSAList.ts

import type { ActivityType } from "./JSA";

// Item ringkas untuk tabel list
export interface JSAListItem {
  id: number;
  project: string;
  jobType: string;
  date: string;               // YYYY-MM-DD
  activityType: ActivityType; // R/NR/E
  maxRisk: number;            // Rt tertinggi dari semua rows (disiapkan backend)
  createdBy: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED"; // sesuaikan backend
}
