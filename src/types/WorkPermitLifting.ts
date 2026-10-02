// src/types/WorkPermitLifting.ts
import type { YesNo } from "./common";

export interface WorkPermitLifting {
  // Informasi pekerjaan (header)
  project: string;
  date: string;
  location: string;
  description: string;
  equipment: string;    // Peralatan yang digunakan
  timeFrom: string;     // Waktu pekerjaan dari
  timeTo: string;       // Waktu pekerjaan sampai
  responsible: string;  // Yang bertanggung jawab
  workersCount: string; // Jumlah tenaga kerja

  // Checklist area (A/B/C di form)
  areaPerifer: boolean;   // (A) Area Perifer (Pinggiran)
  areaFabrikasi: boolean; // (B) Area Fabrikasi / Bekisting
  areaTopFloor: boolean;  // (C) Area Top Floor

  // 16 checklist keselamatan (sesuai dokumen)
  chkSpkSigned: YesNo;                  // 1. SPK / kontrak sudah ditandatangani
  chkResponsibleAssigned: YesNo;        // 2. Penanggung jawab pekerjaan sudah ditentukan
  chkWeatherGood: YesNo;                // 3. Cuaca cerah dan tidak mendung
  chkPpePrepared: YesNo;                // 4. Pekerja memakai & mempersiapkan APD sesuai
  chkSafetyInduction: YesNo;            // 5. Pekerja mendapat pengarahan K3 (Safety Induction)
  chkExperienced: YesNo;                // 6. Pekerja berpengalaman & kompeten
  chkNoBalanceIssue: YesNo;             // 7. Pekerja tidak mengalami gangguan keseimbangan
  chkEmergencyProcedureUnderstood: YesNo; // 8. Prosedur keadaan darurat sudah dimengerti
  chkSignsInstalled: YesNo;             // 9. Rambu-rambu yang diperlukan sudah terpasang
  chkSafetyLineDeckInstalled: YesNo;    // 10. Safety line dan safety deck sudah terpasang
  chkSlingCapacityCalculated: YesNo;    // 11. Kapasitas beban seling sudah diperhitungkan
  chkMobileCraneInspected: YesNo;       // 12. Mobile crane sudah diinspeksi dan layak pakai
  chkLiftingEquipmentInspected: YesNo;  // 13. Peralatan untuk mengangkat sudah diinspeksi dan layak pakai
  chkCraneSlingInspected: YesNo;        // 14. Seling crane untuk mengangkat sudah diinspeksi dan layak pakai
  chkSmallMaterialBucketProvided: YesNo; // 15. Terdapat peralatan seperti bucket untuk mengangkat material kecil
  chkAreaBelowClear: YesNo;             // 16. Area pekerjaan & area di bawah bebas dari area kerja dan lalu lintas orang

  // APD
  apdHelmet: boolean;   // Helm
  apdGloves: boolean;   // Sarung tangan
  apdShoes: boolean;    // Sepatu
  apdOthers: string;    // APD lain (opsional)

  // Catatan
  notes: string;
}
