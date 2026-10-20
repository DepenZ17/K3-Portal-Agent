// src/types/workPermit.ts

/** ==========================================
 *  1. ENUMS & BASIC TYPES
 *  ========================================== */

/** Jenis izin kerja yang didukung dalam sistem */
export type PermitType = "working_at_height";

/** Status alur kerja (workflow) dari sebuah izin kerja */
export type WorkPermitStatus =
  | "draft"
  | "pending_supervisor"
  | "pending_officer"
  | "pending_pm"
  | "pending_mk"
  | "approved"
  | "rejected"
  | "pending_close"
  | "closed"
  | "cancelled";

/** Kategori tingkat risiko keselamatan kerja */
export type RiskCategory = "R" | "M" | "T" | "E";

/** ==========================================
 *  2. SAFETY CHECKLIST STRUCTURE
 *  ========================================== */

/** Struktur 14 Checklist Keselamatan untuk Working at Height (Key "1" s.d "14") */
export interface HeightChecklist {
  "1": boolean; // SPK/kontrak ditandatangani
  "2": boolean; // Penanggung jawab ditentukan
  "3": boolean; // Cuaca cerah & tidak mendung
  "4": boolean; // Pekerja memakai & menyiapkan APD sesuai
  "5": boolean; // Sudah mendapat pengarahan K3 (Safety Induction)
  "6": boolean; // Punya pengalaman & kompeten
  "7": boolean; // Tidak punya penyakit ayan, rabun senja, gangguan keseimbangan
  "8": boolean; // Prosedur keadaan darurat dimengerti
  "9": boolean; // Rambu-rambu dipasang
  "10": boolean; // Safety line / safety net / safety deck terpasang
  "11": boolean; // Climbing terpasang (pekerjaan corewall)
  "12": boolean; // Area kerja & bawahnya bersih & bebas lalu lintas orang
  "13": boolean; // Peralatan diinspeksi & layak pakai
  "14": boolean; // Bahan kimia B3 aman, ada MSDS & label jelas
  [key: string]: boolean; // Indeks dinamis tambahan jika diperlukan
}

/** ==========================================
 *  3. PAYLOAD INTERFACES (CREATE / UPDATE)
 *  ========================================== */

/** Payload data yang dikirim ke backend untuk Create / Update Work Permit */
export interface WorkPermitPayload {
  project: number;
  hira_activity: number;
  permit_type: PermitType;
  work_date: string;       // Format: "YYYY-MM-DD"
  work_start: string;      // Format: "HH:MM"
  work_end: string;        // Format: "HH:MM"
  work_location: string;
  gps_location?: string;   // Koordinat GPS opsional (Lat, Lng)
  photo?: File | null;     // Berkas foto (kamera / galeri)
  work_description: string;
  equipment_used?: string;
  person_in_charge: string;
  worker_count: number;
  safety_areas: string[];  // Contoh: ["A", "C"]
  checklist: HeightChecklist;
  ppe: string[];           // Contoh: ["body_harness", "sepatu"]
  ppe_other?: string[];    // Contoh: ["Helm khusus"]
}

/** ==========================================
 *  4. APPROVAL & WORKFLOW INTERFACES
 *  ========================================== */

/** Interface untuk item stepper rantai persetujuan (approval chain) */
export interface ApprovalChainItem {
  step: "supervisor" | "hse_officer" | "project_manager" | "mk";
  state: "approved" | "rejected" | "pending" | "waiting";
}

/** Interface untuk mencatat histori keputusan approval */
export interface WorkPermitApprovalHistory {
  id?: number;
  step: string;
  decision: string;
  decided_by?: {
    id: number;
    full_name: string;
    role: string;
  };
  decided_by_name?: string;
  remarks?: string;
  submission_round: number;
  decided_at?: string;
}

/** ==========================================
 *  5. DETAIL RESPONSE INTERFACE
 *  ========================================== */

/** Struktur lengkap data Work Permit yang diterima dari server (Detail View) */
export interface WorkPermitDetail extends Omit<WorkPermitPayload, "photo"> {
  id: number;                   
  project: number;                 
  project_name: string;               
  permit_type: PermitType;                
  document_number?: string;           
  work_date: string;                  
  work_location: string;              
  gps_location?: string;          // Koordinat GPS dari server
  photo?: string | null;          // URL string foto dari server
  work_description: string;           
  status: WorkPermitStatus;           
  risk_category: RiskCategory;        
  submission_round: number;           
  created_by?: {
    id: number;
    full_name: string;
    role: string;
  };                        
  created_at: string;                 
  updated_at: string;                 

  hira_activity: number;               
  hira_document: number;               
  hira_activity_name: string;          
  hira_initial_category: RiskCategory; 
  work_start: string;                  
  work_end: string;                    
  equipment_used?: string;             
  person_in_charge: string;            
  worker_count: number;                
  safety_areas: string[];              
  checklist: HeightChecklist;  
  ppe: string[];                       
  ppe_other: string[];                 

  approvals?: WorkPermitApprovalHistory[]; 
  approval_chain?: ApprovalChainItem[];    

  cancelled_by?: {
    id: number;
    full_name: string;
    role: string;
  };                        
  cancelled_at?: string;               
  cancel_reason?: string;              
  post_work_evaluation?: string;       
  close_requested_at?: string;         
  closed_by?: {
    id: number;
    full_name: string;
    role: string;
  };                        
  closed_at?: string;                  

  form?: {
    code: string;
    revision: string;
  };                        
  allowed_actions?: Record<string, boolean> | string[]; 
}

/** ==========================================
 *  6. QUERY PARAMS & PERMISSIONS
 *  ========================================== */

/** Parameter query filter untuk mengambil daftar Work Permits */
export interface WorkPermitListParams {
  project?: number | string;
  status?: WorkPermitStatus;
  risk_category?: RiskCategory;
  permit_type?: PermitType;
}

/** Kunci aksi yang diizinkan (allowed actions) pada suatu dokumen izin kerja */
export type WorkPermitAllowedAction =
  | "can_edit"
  | "can_submit"
  | "can_decide"
  | "can_cancel"
  | "can_request_close"
  | "can_confirm_close"
  | "can_set_number";