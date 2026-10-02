// src/types/WorkPermitConfinedSpace.ts
import type { YesNo } from "./common";

export interface WorkPermitConfinedSpace {
  // Informasi pekerjaan umum
  project: string;
  date: string;
  location: string;
  description: string;
  contractor: string;   // Pekerjaan oleh (kontraktor/unit)
  equipment: string;    // Peralatan yang digunakan
  timeFrom: string;     // Waktu dari
  timeTo: string;       // Waktu sampai
  responsible: string;  // Yang bertanggung jawab
  workersCount: string; // Jumlah tenaga kerja

  // Jenis pekerjaan (A/B/C di header checklist)
  jobExcavation: boolean;         // (A) Pekerjaan Galian
  jobEnclosedRepair: boolean;     // (B) Pekerjaan Perbaikan Alat Kondisi Tertutup (Enclosed)
  jobOther: boolean;              // (C) Pekerjaan ...
  jobOtherDescription: string;    // uraian untuk (C)

  // Checklist keselamatan (17 poin sesuai dokumen)
  chkSpkSigned: YesNo;                   // 1
  chkResponsibleAssigned: YesNo;         // 2
  chkAreaProtectedFromCollapse: YesNo;   // 3
  chkAreaBarricadedAndSign: YesNo;       // 4
  chkLightingAdequate: YesNo;            // 5
  chkVentilationAdequate: YesNo;         // 6
  chkFreeFromFlammable: YesNo;           // 7
  chkFreeFromToxicGas: YesNo;            // 8
  chkEquipmentInspected: YesNo;          // 9
  chkMachineLockedOut: YesNo;            // 10
  chkGotSafetyInduction: YesNo;          // 11
  chkPpePrepared: YesNo;                 // 12
  chkWorkersCompetent: YesNo;            // 13
  chkTwoPersonsAndStandby: YesNo;        // 14
  chkEmergencyProcedureKnown: YesNo;     // 15
  chkCommunicationAdequate: YesNo;       // 16
  chkChemicalsSafeMsds: YesNo;           // 17

  // APD (sesuai kotak di bawah)
  apdMask: boolean;              // Masker
  apdGloves: boolean;            // Sarung Tangan
  apdHelmet: boolean;            // Helm
  apdSafetyShoes: boolean;       // Sepatu Safety
  apdSafetyGoggles: boolean;     // Kacamata Pengaman
  apdOthers: string;             // APD lainnya (opsional)

  // Catatan tambahan
  notes: string;
}
