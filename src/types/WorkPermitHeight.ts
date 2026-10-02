// src/types/WorkPermitHeight.ts
import type { YesNo } from "./common";

export interface WorkPermitHeight {
  // Informasi pekerjaan (header)
  project: string;
  date: string;
  location: string;
  description: string;
  contractor: string;     // pekerjaan oleh
  equipment: string;      // peralatan yang digunakan
  timeFrom: string;
  timeTo: string;
  responsible: string;    // penanggung jawab
  workersCount: string;

  // Checklist area (A/B/C)
  areaA: boolean; // (A) Area Perifer (Pinggiran)
  areaB: boolean; // (B) Area Pit Lift / Tangga
  areaC: boolean; // (C) Pekerjaan perbaikan/perawatan di ketinggian

  // 14 checklist keselamatan (nama deskriptif)
  chkSpkSigned: YesNo;                 // 1. SPK/kontrak ditandatangani
  chkResponsibleAssigned: YesNo;       // 2. Penanggung jawab ditentukan
  chkWeatherGood: YesNo;               // 3. Cuaca cerah & tidak mendung
  chkPpePrepared: YesNo;               // 4. Pekerja memakai & menyiapkan APD sesuai
  chkSafetyInduction: YesNo;           // 5. Sudah mendapat pengarahan K3 (Safety Induction)
  chkExperienced: YesNo;               // 6. Punya pengalaman & kompeten
  chkNoBalanceIssue: YesNo;            // 7. Tidak punya penyakit ayan, rabun senja, gangguan keseimbangan
  chkEmergencyProcedureUnderstood: YesNo; // 8. Prosedur keadaan darurat dimengerti
  chkSignsInstalled: YesNo;            // 9. Rambu-rambu dipasang
  chkSafetyLineNetDeckInstalled: YesNo; // 10. Safety line / safety net / safety deck terpasang
  chkClimbingInstalled: YesNo;         // 11. Climbing terpasang (pekerjaan corewall)
  chkAreaBelowClear: YesNo;            // 12. Area kerja & bawahnya bersih & bebas lalu lintas orang
  chkEquipmentInspected: YesNo;        // 13. Peralatan diinspeksi & layak pakai
  chkChemicalB3Controlled: YesNo;      // 14. Bahan kimia B3 aman, ada MSDS & label jelas

  // APD (Alat Pelindung Diri)
  apdGloves: boolean;        // Sarung tangan
  apdSafetyBelt: boolean;    // Safety Belt
  apdBodyHarness: boolean;   // Body Harness
  apdShoes: boolean;         // Sepatu
  apdOthers: string;         // APD lain (tidak pakai "........")

  // Catatan
  notes: string;
}
