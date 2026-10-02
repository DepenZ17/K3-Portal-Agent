// src/types/WorkPermitList.ts

export type WorkPermitType =
  | "HEIGHT"
  | "CONFINED_SPACE"
  | "HOT_WORK"
  | "LIFTING"
  | "TOWER_CRANE";

export type WorkPermitStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "VERIFIED"   // diverifikasi SHE Officer
  | "APPROVED"   // disetujui Site Manager
  | "CLOSED";

export interface WorkPermitListItem {
  id: number;
  type: WorkPermitType;
  project: string;
  location: string;
  date: string;
  status: WorkPermitStatus;
  createdBy: string;          // username Foreman pembuat

  // info tambahan dari backend
  hasBeforePhotos: boolean;   // ada foto sebelum kerja
  hasAfterPhotos: boolean;    // ada foto sesudah selesai
  canClose: boolean;          // boleh di-close (APPROVED, dll)
}
