export type UserRole = 'patient' | 'hospital' | 'insurance' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  policyNumber?: string;
  policyName?: string;
  sumInsured?: number;
  remainingCover?: number;
  hospitalName?: string;
  hospitalId?: string;
  department?: string;
  employeeId?: string;
  abhaId?: string;
}

export type ClaimStatus =
  | 'submitted'
  | 'ocr_extracted'
  | 'ai_verified'
  | 'under_review'
  | 'action_required'
  | 'approved'
  | 'rejected'
  | 'flagged'
  | 'paid_out';

export type DocumentType =
  | 'discharge_summary'
  | 'hospital_bill'
  | 'prescription'
  | 'diagnostic_report'
  | 'id_card'
  | 'ot_notes'
  | 'implant_invoice';

export interface ClaimDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: string;
  uploadDate: string;
  ocrConfidence: number; // e.g. 98.5
  status: 'uploaded' | 'parsing' | 'verified' | 'warning';
  extractedTextSnippet?: string;
  fileUrl?: string;
}

export interface ItemizedCharge {
  category: string;
  description: string;
  claimedAmount: number;
  eligibleAmount: number;
  isCovered: boolean;
  deductionReason?: string;
}

export interface PolicyClauseMatch {
  clauseId: string;
  clauseTitle: string;
  excerpt: string;
  isCompliant: boolean;
  statusText: string;
  impactExplanation: string;
}

export interface ValidationCheck {
  id: string;
  name: string;
  category: 'identity' | 'policy' | 'medical' | 'billing' | 'fraud';
  status: 'passed' | 'warning' | 'failed';
  detail: string;
}

export interface AIAnalysisResult {
  overallRiskScore: number; // 0-100
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number; // percentage
  aiRecommendation: 'APPROVE' | 'FLAG_FRAUD' | 'REQUEST_INFO' | 'REJECT';
  aiReasoningSummary: string;
  matchedClauses: PolicyClauseMatch[];
  validationChecks: ValidationCheck[];
  missingDocuments: string[];
  riskFlags: string[];
  suggestedApprovedAmount: number;
}

export interface ClaimTimelineEvent {
  step: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole | 'system';
  note: string;
  status: 'done' | 'active' | 'pending' | 'warning' | 'rejected';
}

export interface ClaimItem {
  id: string;
  claimNumber: string; // e.g. CLM-2025-8841
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  patientEmail: string;
  abhaId?: string;
  digilockerVerified: boolean;

  // Policy Details
  policyNumber: string;
  policyName: string;
  insurerName: string;
  sumInsured: number;
  remainingCover: number;
  policyExpiry: string;

  // Hospital & Treatment
  hospitalId: string;
  hospitalName: string;
  hospitalCity: string;
  isNetworkHospital: boolean;
  admissionDate: string;
  dischargeDate: string;
  admissionType: 'Emergency' | 'Planned' | 'Day Care';
  treatingDoctor: string;
  doctorRegistrationNo: string;
  diagnosis: string;
  icdCode: string; // e.g. K35.80

  // Financials
  claimedAmount: number;
  eligibleAmount: number;
  roomRentDeduction: number;
  copayAmount: number;
  nonMedicalDeduction: number;
  approvedAmount: number;

  // State & AI Data
  status: ClaimStatus;
  submissionChannel: 'Patient Web' | 'Hospital TPA Desk' | 'DigiLocker Direct';
  submittedAt: string;
  updatedAt: string;
  documents: ClaimDocument[];
  itemizedCharges: ItemizedCharge[];
  aiAnalysis: AIAnalysisResult;
  timeline: ClaimTimelineEvent[];
  
  // Adjudication Details
  adjudicatorNotes?: string;
  rejectionReason?: string;
  requestedDocumentsList?: string[];
  adjudicatedBy?: string;
  adjudicatedAt?: string;

  // Blockchain Ledger & Compliance
  blockchainTxHash: string;
  blockNumber: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'danger';
  targetRole: UserRole | 'all';
  claimId?: string;
}

export interface BlockchainBlock {
  blockNumber: number;
  timestamp: string;
  claimNumber: string;
  action: string;
  actor: string;
  txHash: string;
  previousHash: string;
  verificationProof: string;
}
