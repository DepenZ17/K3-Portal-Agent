import type { YesNo } from "./common";

export interface WorkPermitTowerCrane {
  // Informasi pekerjaan (header)
  project: string;
  date: string;
  location: string;
  description: string;
  equipment: string;
  timeFrom: string;
  timeTo: string;
  responsible: string;
  workersCount: string;

  // Checklist area (A/B di form)
  areaTowerCrane: boolean; // (A) Area Tower Crane (TC)
  areaTopFloor: boolean;   // (B) Area Top Floor

  // 15 checklist keselamatan (sesuai dokumen)
  chkSpkSigned: YesNo;               // 1
  chkResponsibleAssigned: YesNo;     // 2
  chkWeatherGood: YesNo;             // 3
  chkTrainingTC: YesNo;              // 4
  chkPpePrepared: YesNo;             // 5
  chkSafetyInduction: YesNo;         // 6
  chkExperienced: YesNo;             // 7
  chkNoBalanceIssue: YesNo;          // 8
  chkAreaFreeFromElectric: YesNo;    // 9
  chkSignsInstalled: YesNo;          // 10
  chkSafetyLineInstalled: YesNo;     // 11
  chkTcBeltInspected: YesNo;         // 12
  chkMobileCraneInspected: YesNo;    // 13
  chkEquipmentInspected: YesNo;      // 14
  chkCraneSlingInspected: YesNo;     // 15

  // APD
  apdHelmet: boolean;       // Helm
  apdBodyHarness: boolean;  // Di dokumen tertulis "Body Hardness" (kemungkinan Body Harness)
  apdGloves: boolean;       // Sarung tangan
  apdOthers: string;        // APD lain (opsional)

  // Catatan
  notes: string;
}
