export enum ClaimStatus {
  APPROVED = 'Layak Bayar (Approved/Clear)',
  PENDING = 'Pending (Tertunda)',
  DENIED = 'Gagal Bayar (Denied/Ditolak)',
}

export enum IssueCategory {
  TECHNICAL = 'Kendala Teknis E-Klaim Error',
  CODING = 'Ketidaksesuaian Koding (ICD-10/ICD 9-CM)',
  DOCS = 'Dokumen Medis/Resume Tidak Lengkap',
  NON_COVERED = 'Klaim Tidak Ditanggung',
  NONE = 'Tidak Ada Kendala',
}

export interface FormData {
  transactionId: string;
  amount: number;
  status: ClaimStatus;
  issueCategory: IssueCategory;
  deadlineDays: number;
}

export interface JournalEntry {
  debit: string;
  credit: string;
  amount: number;
  description: string;
}

export interface FinancialImpact {
  balanceSheet: string[];
  operationalReport: string[];
  note: string;
}

export interface SpiDiagnosis {
  riskAnalysis: string;
  correctiveActions: string[];
  responsibleUnit: string;
}

export interface AnalysisResult {
  diagnosis: SpiDiagnosis;
  journalEntries: JournalEntry[];
  uncollectibleEntry?: JournalEntry; 
  financialImpact: FinancialImpact;
}