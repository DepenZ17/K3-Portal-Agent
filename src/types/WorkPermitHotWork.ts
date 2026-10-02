// src/types/WorkPermitHotWork.ts
import type { YesNo } from "./common";

export interface WorkPermitHotWork {
  // Informasi pekerjaan
  project: string;
  date: string;
  location: string;
  description: string;
  contractor: string;   // Pekerjaan oleh (kontraktor/unit)
  equipment: string;    // Peralatan hot work (mesin las, tabung gas, gerinda, dll.)
  timeFrom: string;     // Waktu mulai pekerjaan
  timeTo: string;       // Waktu selesai pekerjaan
  responsible: string;  // Penanggung jawab pekerjaan
  workersCount: string; // Jumlah tenaga kerja yang terlibat

  // Jenis pekerjaan (A/B/C/D di header checklist)
  jobWeldingElectric: boolean;      // (A) Pekerjaan Las Listrik
  jobWeldingGas: boolean;           // (B) Pekerjaan Las Dengan Gas
  jobCuttingBending: boolean;       // (C) Pekerjaan cutting/bending
  jobOther: boolean;                // (D) Pekerjaan lainnya
  jobOtherDescription: string;      // Uraian untuk jenis pekerjaan (D)

  // Checklist keselamatan (18 poin, mengikuti dokumen)
  chkSpkSigned: YesNo;                        // 1. SPK atau kontrak pekerjaan sudah ditandatangani
  chkResponsibleAssigned: YesNo;              // 2. Penanggung jawab pekerjaan sudah ditentukan
  chkAreaFreeFromFlammableExplosive: YesNo;   // 3. Area diamankan dan dibebaskan dari bahan mudah terbakar & mudah meledak
  chkAreaFreeFromPuddlesLeaksGas: YesNo;      // 4. Area bebas genangan, bocoran, dan percikan gas
  chkAreaFreeFromOpenElectrical: YesNo;       // 5. Area bebas dari sambungan listrik terbuka
  chkAreaBarricadedAndSign: YesNo;            // 6. Area diberi pembatas (safety line) & rambu "Yang Tidak Berwenang Dilarang Masuk"
  chkLightingAdequate: YesNo;                 // 7. Area kerja memiliki penerangan yang memadai
  chkVentilationAdequate: YesNo;              // 8. Ventilasi udara cukup, aliran udara keluar-masuk baik (untuk ruang tertutup)
  chkAreaInspectedAndGasLeakFree: YesNo;      // 9. Area sudah diinspeksi dan bebas dari kebocoran gas
  chkValveRegulatorHoseTorchOk: YesNo;        // 10. Valve, regulator, selang, dan torch las dalam kondisi baik dan layak pakai
  chkGasCylinderNotRustyOrDamaged: YesNo;     // 11. Tabung gas tidak berkarat, tidak penyok, dan tidak ada tanda-tanda retak
  chkGasCylinderUprightAndChained: YesNo;     // 12. Tabung gas berdiri tegak, seimbang, dan terikat rantai dengan aman
  chkMaterialFixedSafePosition: YesNo;        // 13. Material yang akan dilas/dipotong/dibengkokkan berada pada posisi aman dan tidak mudah bergeser
  chkPpePrepared: YesNo;                      // 14. Pekerja memakai dan mempersiapkan APD yang sesuai
  chkWorkersCompetent: YesNo;                 // 15. Pekerja berpengalaman dan kompeten melakukan pekerjaan ini
  chkFireExtinguisherAvailable: YesNo;        // 16. Alat pemadam kebakaran (CO2/powder) tersedia dan memadai
  chkEmergencyProcedureUnderstood: YesNo;     // 17. Prosedur keadaan darurat dimengerti & pekerja telah diberi pelatihan pemadaman api
  chkChemicalB3SafeMsds: YesNo;               // 18. Bahan kimia B3 aman (bebas potensi bocor), dilengkapi MSDS, dan diberi label jelas

  // APD (sesuai kotak di bawah pada form)
  apdGasMask: boolean;                // Masker gas
  apdLeatherGloves: boolean;          // Sarung tangan kulit
  apdWeldingGogglesElectric: boolean; // Kacamata las listrik
  apdNormalGoggles: boolean;          // Kacamata las biasa
  apdSafetyShoes: boolean;            // Safety shoes
  apdOthers: string;                  // APD lain (misalnya pelindung pendengaran, rompi reflektif, dll.)

  // Catatan tambahan
  notes: string;
}
