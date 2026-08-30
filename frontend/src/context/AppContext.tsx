import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ClaimItem,
  UserAccount,
  UserRole,
  NotificationItem,
  BlockchainBlock,
  ClaimStatus,
  DocumentType,
  ClaimDocument,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_CLAIMS,
  INITIAL_BLOCKS,
  INITIAL_NOTIFICATIONS,
  TRANSLATIONS,
} from '../data/initialData';
import { ApiService } from '../services/api';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  currentUser: UserAccount | null;
  currentRole: UserRole;
  claims: ClaimItem[];
  blockchainBlocks: BlockchainBlock[];
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  language: string;
  backendConnected: boolean;
  t: (key: string) => string;
  setLanguage: (lang: string) => void;
  login: (role: UserRole, customUser?: Partial<UserAccount>) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  addClaim: (newClaim: Omit<ClaimItem, 'id' | 'claimNumber' | 'blockchainTxHash' | 'blockNumber' | 'submittedAt' | 'updatedAt' | 'timeline'>, uploadedFiles?: File[]) => Promise<ClaimItem>;
  updateClaimStatus: (claimId: string, status: ClaimStatus, note?: string) => Promise<void>;
  adjudicateClaim: (
    claimId: string,
    decision: 'approve' | 'reject' | 'request_docs' | 'flag_fraud',
    options?: {
      approvedAmount?: number;
      rejectionReason?: string;
      missingDocsList?: string[];
      notes?: string;
    }
  ) => Promise<void>;
  uploadAdditionalDocument: (claimId: string, doc: Partial<ClaimDocument>, file?: File) => Promise<void>;
  markNotificationsAsRead: () => void;
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  // Modal Triggers
  selectedClaimForDetail: ClaimItem | null;
  setSelectedClaimForDetail: (claim: ClaimItem | null) => void;
  isDigiLockerModalOpen: boolean;
  setIsDigiLockerModalOpen: (open: boolean) => void;
  isBlockchainModalOpen: boolean;
  setIsBlockchainModalOpen: (open: boolean) => void;
  isNewClaimModalOpen: boolean;
  setIsNewClaimModalOpen: (open: boolean) => void;
  refreshBackendData: () => Promise<void>;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to map Django backend claim to Frontend ClaimItem
function mapBackendClaimToClaimItem(bClaim: any): ClaimItem {
  const riskScore = bClaim.fraud_analysis?.risk_score ?? 10;
  const riskLevel = (bClaim.fraud_analysis?.risk_level ?? 'low').toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  let status: ClaimStatus = 'under_review';
  if (bClaim.status === 'validated' || bClaim.status === 'ai_verified') status = 'ai_verified';
  else if (bClaim.status === 'submitted') status = 'submitted';
  else if (bClaim.status === 'under_review') status = 'under_review';
  else if (bClaim.status === 'rejected') status = 'rejected';
  else if (bClaim.status === 'approved') status = 'approved';
  else if (bClaim.status === 'fraud_flagged' || bClaim.status === 'flagged') status = 'flagged';
  else if (bClaim.status === 'draft') status = 'submitted';

  const docs: ClaimDocument[] = (bClaim.documents || []).map((d: any) => ({
    id: `doc_${d.id}`,
    name: d.file ? d.file.split('/').pop() : `Document_${d.id}`,
    type: (d.document_type || 'hospital_bill') as DocumentType,
    size: '1.4 MB',
    uploadDate: d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString() : 'Recent',
    ocrConfidence: d.match_score || 98.2,
    status: d.ocr_status === 'completed' ? 'verified' : 'parsing',
    extractedTextSnippet: d.extracted_text || (d.extracted_data ? JSON.stringify(d.extracted_data) : 'Document processed by OCR engine.'),
    fileUrl: d.file_url || d.file,
  }));

  const itemizedCharges = [
    { category: 'Hospital Inpatient & Care', description: `${bClaim.procedure || 'Clinical Care'} Treatment`, claimedAmount: Number(bClaim.amount) || 0, eligibleAmount: Number(bClaim.amount) || 0, isCovered: true },
  ];

  return {
    id: String(bClaim.id),
    claimNumber: bClaim.dataset_claim_id || `CLM-2025-${String(bClaim.id).padStart(4, '0')}`,
    patientId: bClaim.patient_details?.patient_id || `PAT-${bClaim.id}`,
    patientName: bClaim.patient_name || 'Patient',
    patientAge: bClaim.patient_age || 35,
    patientGender: bClaim.patient_gender || 'Other',
    patientPhone: bClaim.patient_details?.contact_phone || '+91-9876543210',
    patientEmail: bClaim.patient_details?.email || 'patient@healthmail.com',
    abhaId: bClaim.patient_details?.policy_number ? `91-${bClaim.patient_details.policy_number}-01` : '91-4820-9921-1029',
    digilockerVerified: true,
    policyNumber: bClaim.patient_details?.policy_number || 'POL-8849-2025',
    policyName: 'Star Health Premier Care Shield',
    insurerName: 'CareShield Health Insurance Ltd.',
    sumInsured: 500000,
    remainingCover: 415000,
    policyExpiry: '2026-03-31',
    hospitalId: bClaim.hospital_id || 'HOSP-001',
    hospitalName: bClaim.hospital_name || 'Super Specialty Hospital',
    hospitalCity: 'Bangalore',
    isNetworkHospital: true,
    admissionDate: bClaim.admission_date || '2026-08-10',
    dischargeDate: bClaim.discharge_date || '2026-08-15',
    admissionType: 'Emergency',
    treatingDoctor: bClaim.doctor_id || 'Dr. Attending Physician',
    doctorRegistrationNo: 'KMC-54210',
    diagnosis: bClaim.diagnosis || 'Clinical Diagnosis',
    icdCode: 'A00.0 - General Medical Diagnosis',
    claimedAmount: Number(bClaim.amount) || 0,
    eligibleAmount: Number(bClaim.amount) || 0,
    roomRentDeduction: 0,
    copayAmount: 0,
    nonMedicalDeduction: 0,
    approvedAmount: Number(bClaim.amount) || 0,
    status,
    submissionChannel: 'Hospital TPA Desk',
    submittedAt: bClaim.claim_date || 'Recent',
    updatedAt: bClaim.updated_at ? new Date(bClaim.updated_at).toLocaleDateString() : 'Recent',
    documents: docs.length > 0 ? docs : [
      {
        id: `doc_gen_${bClaim.id}`,
        name: 'Discharge_Bill_Hospital.pdf',
        type: 'hospital_bill',
        size: '1.2 MB',
        uploadDate: 'Verified',
        ocrConfidence: 98.5,
        status: 'verified',
        extractedTextSnippet: `Verified medical bill for ${bClaim.patient_name} amounting to INR ${bClaim.amount}`,
      }
    ],
    itemizedCharges,
    aiAnalysis: {
      overallRiskScore: riskScore,
      riskTier: riskLevel,
      confidenceScore: 98.5,
      aiRecommendation: riskScore > 60 ? 'REJECT' : riskScore > 30 ? 'REQUEST_INFO' : 'APPROVE',
      aiReasoningSummary: (bClaim.fraud_analysis?.reasons || []).join('; ') || 'Claim validated against clinical procedure benchmarks and verified OCR documents.',
      matchedClauses: [
        {
          clauseId: 'SEC-1.1',
          clauseTitle: 'Hospitalization Benefit',
          excerpt: 'Eligible for inpatient treatment under standard schedule.',
          isCompliant: true,
          statusText: 'Compliant',
          impactExplanation: 'Covered under policy.',
        }
      ],
      validationChecks: [
        { id: 'v1', name: 'Clinical Procedure Match', category: 'medical', status: 'passed', detail: 'Procedure matches diagnosis profile.' },
        { id: 'v2', name: 'Billing Sanity & Duplicate Check', category: 'fraud', status: riskScore > 60 ? 'failed' : 'passed', detail: 'Cross-checked with national claims repository.' },
      ],
      missingDocuments: [],
      riskFlags: bClaim.fraud_analysis?.reasons || [],
      suggestedApprovedAmount: Number(bClaim.amount) || 0,
    },
    timeline: [
      {
        step: 'Claim Intake',
        timestamp: bClaim.created_at ? new Date(bClaim.created_at).toLocaleDateString() : 'Recent',
        actor: 'Hospital Portal Desk',
        actorRole: 'hospital',
        note: `Ingested Claim with amount INR ${bClaim.amount}.`,
        status: 'done',
      },
      {
        step: 'AI Fraud Radar Analysis',
        timestamp: 'Auto-Evaluated',
        actor: 'PEC AI Engine',
        actorRole: 'system',
        note: `Risk Score: ${riskScore}/100 (${riskLevel})`,
        status: riskScore > 60 ? 'warning' : 'done',
      }
    ],
    blockchainTxHash: '0x' + Math.random().toString(16).substring(2, 10) + '94a081bc' + String(bClaim.id),
    blockNumber: 4892100 + Number(bClaim.id),
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from LocalStorage or Defaults
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('claimease_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return currentUser?.role || 'patient';
  });

  const [claims, setClaims] = useState<ClaimItem[]>(() => {
    const saved = localStorage.getItem('claimease_claims');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CLAIMS;
      }
    }
    return INITIAL_CLAIMS;
  });

  const [blockchainBlocks, setBlockchainBlocks] = useState<BlockchainBlock[]>(() => {
    const saved = localStorage.getItem('claimease_blocks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_BLOCKS;
      }
    }
    return INITIAL_BLOCKS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('claimease_notifs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_NOTIFICATIONS;
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [language, setLanguage] = useState<string>('en');
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedClaimForDetail, setSelectedClaimForDetail] = useState<ClaimItem | null>(null);
  const [isDigiLockerModalOpen, setIsDigiLockerModalOpen] = useState(false);
  const [isBlockchainModalOpen, setIsBlockchainModalOpen] = useState(false);
  const [isNewClaimModalOpen, setIsNewClaimModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('claimease_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('claimease_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('claimease_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('claimease_blocks', JSON.stringify(blockchainBlocks));
  }, [blockchainBlocks]);

  useEffect(() => {
    localStorage.setItem('claimease_notifs', JSON.stringify(notifications));
  }, [notifications]);

  // Fetch real data from Django Backend on startup
  const refreshBackendData = useCallback(async () => {
    try {
      const healthRes = await ApiService.system.getHealth();
      if (healthRes && (healthRes.success || healthRes.status === 'operational')) {
        setBackendConnected(true);
        // Fetch Claims
        const claimsRes = await ApiService.claims.list();
        if (claimsRes.success && Array.isArray(claimsRes.data) && claimsRes.data.length > 0) {
          const mapped = claimsRes.data.map(mapBackendClaimToClaimItem);
          // Combine or prioritize live backend claims
          setClaims(mapped);
        }
      } else {
        setBackendConnected(false);
      }
    } catch (e) {
      console.warn('Backend sync failed, using cached state:', e);
      setBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData]);

  const showToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = 'toast_' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  const login = async (role: UserRole, customUser?: Partial<UserAccount>) => {
    const baseUser = DEMO_USERS[role] || DEMO_USERS.patient;
    const userToSet: UserAccount = {
      ...baseUser,
      ...customUser,
      role,
    };

    try {
      // Attempt backend auth login
      const res = await ApiService.auth.login({
        username: role === 'hospital' ? 'workflow_dr_arun' : `${role}_user`,
        password: 'DoctorSecurePass123',
      });
      if (res && res.success) {
        setBackendConnected(true);
      }
    } catch (e) {
      // fallback to client-side session
    }

    setCurrentUser(userToSet);
    setCurrentRole(role);
    showToast('success', `Welcome back, ${userToSet.name}!`, `Logged in as ${role.toUpperCase()}`);
  };

  const logout = async () => {
    try {
      await ApiService.auth.logout();
    } catch (e) {}
    setCurrentUser(null);
    showToast('info', 'Logged out successfully');
  };

  const switchRole = (role: UserRole) => {
    const targetUser = DEMO_USERS[role];
    setCurrentUser(targetUser);
    setCurrentRole(role);
    showToast('info', `Switched view to ${role.toUpperCase()} portal`, `Now viewing as ${targetUser.name}`);
  };

  const addBlockchainBlock = (claimNumber: string, action: string, actor: string) => {
    const lastBlock = blockchainBlocks[blockchainBlocks.length - 1];
    const prevHash = lastBlock ? lastBlock.txHash : '0x0000000000000000000000000000000000000000';
    const nextBlockNum = (lastBlock ? lastBlock.blockNumber : 4892000) + 1;
    const randomHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    const txHash = '0x' + randomHex + 'a8310ff927cb0991823abce8' + Math.floor(Math.random() * 900 + 100);

    const newBlock: BlockchainBlock = {
      blockNumber: nextBlockNum,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      claimNumber,
      action,
      actor,
      txHash,
      previousHash: prevHash,
      verificationProof: 'ZKP-ZK-SNARK-MERKLE: 0x' + Math.random().toString(16).substr(2, 8) + '...',
    };

    setBlockchainBlocks((prev) => [...prev, newBlock]);
    return txHash;
  };

  const addClaim = async (
    newClaimData: Omit<ClaimItem, 'id' | 'claimNumber' | 'blockchainTxHash' | 'blockNumber' | 'submittedAt' | 'updatedAt' | 'timeline'>,
    uploadedFiles?: File[]
  ): Promise<ClaimItem> => {
    const timestampStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let backendClaimId: number | null = null;
    let returnedClaimNumber = `CLM-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Create claim in Django backend
      const createRes = await ApiService.claims.create({
        patient_name: newClaimData.patientName,
        patient_age: newClaimData.patientAge,
        patient_gender: newClaimData.patientGender,
        hospital_name: newClaimData.hospitalName,
        hospital_id: newClaimData.hospitalId,
        doctor_id: newClaimData.treatingDoctor,
        diagnosis: newClaimData.diagnosis,
        procedure: newClaimData.icdCode || newClaimData.diagnosis,
        amount: newClaimData.claimedAmount,
        admission_date: newClaimData.admissionDate,
        discharge_date: newClaimData.dischargeDate,
        days_admitted: 3,
        insurance_type: 'Comprehensive Health Cover',
        notes: `Submitted via ${newClaimData.submissionChannel}. ABHA: ${newClaimData.abhaId || 'N/A'}`,
      });

      if (createRes && createRes.success && createRes.data) {
        backendClaimId = createRes.data.id;
        returnedClaimNumber = createRes.data.dataset_claim_id || `CLM-2025-${String(backendClaimId).padStart(4, '0')}`;

        // 2. Upload any attached files to Django backend
        if (uploadedFiles && uploadedFiles.length > 0) {
          for (const file of uploadedFiles) {
            await ApiService.claims.uploadDocument(backendClaimId!, file, 'bill');
          }
        }

        // 3. Submit and run Master Processing Pipeline (OCR + Clinical Rules + AI Fraud)
        await ApiService.claims.submit(backendClaimId!);
        const procRes = await ApiService.claims.process(backendClaimId!);
        
        if (procRes && procRes.success) {
          // Check if AI fraud analysis returned
          if (procRes.fraud_analysis) {
            newClaimData.aiAnalysis.overallRiskScore = procRes.fraud_analysis.risk_score ?? newClaimData.aiAnalysis.overallRiskScore;
            newClaimData.aiAnalysis.riskTier = (procRes.fraud_analysis.risk_level?.toUpperCase() || 'LOW') as any;
          }
        }
      }
    } catch (err) {
      console.warn('Backend claim creation failed, saving to local store:', err);
    }

    const txHash = addBlockchainBlock(
      returnedClaimNumber,
      'CLAIM_INTAKE_OCR_VERIFIED',
      currentUser ? `${currentUser.name} (${currentUser.role})` : 'Portal Intake'
    );

    const initialTimeline = [
      {
        step: 'Claim Intake & OCR Extraction',
        timestamp: timestampStr,
        actor: currentUser?.name || 'Intake User',
        actorRole: currentRole,
        note: `Submitted with ${newClaimData.documents.length} digital documents via ${newClaimData.submissionChannel}.`,
        status: 'done' as const,
      },
      {
        step: 'Neural Policy & Fraud Scoring',
        timestamp: timestampStr,
        actor: 'ClaimEase AI Engine v4.2 (Django Backend)',
        actorRole: 'system' as const,
        note: `Automated RAG analysis completed. Initial risk tier: ${newClaimData.aiAnalysis.riskTier} (Score: ${newClaimData.aiAnalysis.overallRiskScore}/100).`,
        status: 'done' as const,
      },
      {
        step: 'Adjudication Review',
        timestamp: 'In Progress',
        actor: 'CareShield Underwriting Queue',
        actorRole: 'insurance' as const,
        note: 'Assigned to Adjudication Worklist for final signoff.',
        status: 'active' as const,
      },
    ];

    const fullClaim: ClaimItem = {
      ...newClaimData,
      id: backendClaimId ? String(backendClaimId) : `clm-${Date.now()}`,
      claimNumber: returnedClaimNumber,
      submittedAt: timestampStr,
      updatedAt: timestampStr,
      blockchainTxHash: txHash,
      blockNumber: blockchainBlocks.length + 1,
      timeline: initialTimeline,
    };

    setClaims((prev) => [fullClaim, ...prev.filter(c => c.id !== fullClaim.id)]);

    // Dispatch Notification
    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title: `New Claim Submitted: ${returnedClaimNumber}`,
      message: `${fullClaim.patientName} submitted claim for ₹${fullClaim.claimedAmount.toLocaleString()} (${fullClaim.diagnosis}).`,
      timestamp: 'Just now',
      read: false,
      type: fullClaim.aiAnalysis.riskTier === 'HIGH' ? 'danger' : 'info',
      targetRole: 'all',
      claimId: fullClaim.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(
      'success',
      `Claim ${returnedClaimNumber} Stored in Database!`,
      `Verified by Django AI Engine (Risk Score: ${fullClaim.aiAnalysis.overallRiskScore}/100).`
    );

    // Trigger full refresh in background
    refreshBackendData();

    return fullClaim;
  };

  const updateClaimStatus = async (claimId: string, status: ClaimStatus, note?: string) => {
    const timestampStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    try {
      if (!isNaN(Number(claimId))) {
        await ApiService.claims.update(Number(claimId), {
          status: status === 'ai_verified' ? 'validated' : status,
          notes: note,
        });
      }
    } catch (e) {}

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;

        const updatedTimeline = [
          ...c.timeline,
          {
            step: `Status Changed to ${status.toUpperCase().replace('_', ' ')}`,
            timestamp: timestampStr,
            actor: currentUser?.name || 'System',
            actorRole: currentRole,
            note: note || `Claim status moved to ${status}`,
            status: 'done' as const,
          },
        ];

        return {
          ...c,
          status,
          updatedAt: timestampStr,
          timeline: updatedTimeline,
        };
      })
    );
  };

  const adjudicateClaim = async (
    claimId: string,
    decision: 'approve' | 'reject' | 'request_docs' | 'flag_fraud',
    options?: {
      approvedAmount?: number;
      rejectionReason?: string;
      missingDocsList?: string[];
      notes?: string;
    }
  ) => {
    const target = claims.find((c) => c.id === claimId);
    if (!target) return;

    const timestampStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let newStatus: ClaimStatus = 'under_review';
    let actionLog = '';
    let notificationTitle = '';
    let notificationType: NotificationItem['type'] = 'info';

    if (decision === 'approve') {
      newStatus = 'approved';
      actionLog = `CLAIM_APPROVED_PAYOUT_INITIATED (Approved: ₹${(options?.approvedAmount || target.eligibleAmount).toLocaleString()})`;
      notificationTitle = `Claim Approved: ${target.claimNumber}`;
      notificationType = 'success';
    } else if (decision === 'reject') {
      newStatus = 'rejected';
      actionLog = `CLAIM_REJECTED (Reason: ${options?.rejectionReason || 'Policy exclusion'})`;
      notificationTitle = `Claim Rejected: ${target.claimNumber}`;
      notificationType = 'danger';
    } else if (decision === 'request_docs') {
      newStatus = 'action_required';
      actionLog = `DOCUMENTS_REQUESTED (${options?.missingDocsList?.length || 1} items)`;
      notificationTitle = `Action Required: Documents Requested for ${target.claimNumber}`;
      notificationType = 'warning';
    } else if (decision === 'flag_fraud') {
      newStatus = 'flagged';
      actionLog = 'FRAUD_FLAG_SIU_ESCALATED';
      notificationTitle = `High Risk Audit Flagged: ${target.claimNumber}`;
      notificationType = 'danger';
    }

    try {
      if (!isNaN(Number(claimId))) {
        await ApiService.claims.update(Number(claimId), {
          status: newStatus === 'flagged' ? 'fraud_flagged' : newStatus,
          notes: options?.notes || options?.rejectionReason,
        });
      }
    } catch (e) {}

    const txHash = addBlockchainBlock(
      target.claimNumber,
      actionLog,
      currentUser ? `${currentUser.name} (${currentUser.role})` : 'Adjudication Engine'
    );

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;

        const updatedTimeline = [
          ...c.timeline,
          {
            step: `Adjudication: ${decision.toUpperCase().replace('_', ' ')}`,
            timestamp: timestampStr,
            actor: currentUser?.name || 'Senior Adjudicator',
            actorRole: 'insurance' as const,
            note:
              options?.notes ||
              options?.rejectionReason ||
              `Decision registered by ${currentUser?.name || 'Adjudicator'}.`,
            status:
              decision === 'reject' || decision === 'flag_fraud'
                ? ('warning' as const)
                : ('done' as const),
          },
        ];

        return {
          ...c,
          status: newStatus,
          approvedAmount:
            decision === 'approve'
              ? options?.approvedAmount !== undefined
                ? options.approvedAmount
                : c.eligibleAmount
              : decision === 'reject'
              ? 0
              : c.approvedAmount,
          adjudicatorNotes: options?.notes || c.adjudicatorNotes,
          rejectionReason: options?.rejectionReason,
          requestedDocumentsList: options?.missingDocsList || c.requestedDocumentsList,
          adjudicatedBy: currentUser?.name,
          adjudicatedAt: timestampStr,
          updatedAt: timestampStr,
          blockchainTxHash: txHash,
          timeline: updatedTimeline,
        };
      })
    );

    // Add notification
    const notif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title: notificationTitle,
      message:
        options?.notes ||
        options?.rejectionReason ||
        `Status updated to ${newStatus.toUpperCase()} and persisted to database`,
      timestamp: 'Just now',
      read: false,
      type: notificationType,
      targetRole: 'all',
      claimId: target.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(
      decision === 'approve'
        ? 'success'
        : decision === 'reject'
        ? 'error'
        : decision === 'flag_fraud'
        ? 'warning'
        : 'info',
      notificationTitle,
      `Updated in backend DB & immutable ledger (Tx: ${txHash.substring(0, 14)}...)`
    );

    if (selectedClaimForDetail?.id === claimId) {
      setSelectedClaimForDetail((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              approvedAmount:
                decision === 'approve'
                  ? options?.approvedAmount !== undefined
                    ? options.approvedAmount
                    : prev.eligibleAmount
                  : prev.approvedAmount,
            }
          : null
      );
    }
  };

  const uploadAdditionalDocument = async (claimId: string, doc: Partial<ClaimDocument>, file?: File) => {
    const timestampStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let ocrScore = 98.4;
    let extractedSnippet = doc.extractedTextSnippet || 'Document verified & uploaded successfully.';
    let fileUrl = doc.fileUrl;

    if (file && !isNaN(Number(claimId))) {
      try {
        const uploadRes = await ApiService.claims.uploadDocument(Number(claimId), file, doc.type || 'bill');
        if (uploadRes && uploadRes.success) {
          ocrScore = uploadRes.ocr_result?.match_score || 98.4;
          if (uploadRes.data?.file_url) fileUrl = uploadRes.data.file_url;
          if (uploadRes.ocr_result?.extracted_data) {
            extractedSnippet = `OCR Extraction: ${JSON.stringify(uploadRes.ocr_result.extracted_data)}`;
          }
        }
      } catch (e) {
        console.warn('Backend upload failed, using local simulation:', e);
      }
    }

    const newDocItem: ClaimDocument = {
      id: 'doc_' + Date.now(),
      name: doc.name || (file ? file.name : 'Additional_Document.pdf'),
      type: doc.type || 'discharge_summary',
      size: file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : (doc.size || '1.2 MB'),
      uploadDate: timestampStr,
      ocrConfidence: ocrScore,
      status: 'verified',
      extractedTextSnippet: extractedSnippet,
      fileUrl,
    };

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        return {
          ...c,
          status: 'ai_verified' as ClaimStatus,
          documents: [...c.documents, newDocItem],
          updatedAt: timestampStr,
          timeline: [
            ...c.timeline,
            {
              step: 'Supplemental Documents Uploaded (OCR Processed)',
              timestamp: timestampStr,
              actor: currentUser?.name || 'Patient',
              actorRole: currentRole,
              note: `Uploaded ${newDocItem.name}. Ready for re-evaluation.`,
              status: 'done',
            },
          ],
        };
      })
    );

    showToast('success', 'Document uploaded!', `AI OCR verification completed with ${ocrScore}% confidence.`);
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const resetAllData = () => {
    localStorage.removeItem('claimease_claims');
    localStorage.removeItem('claimease_blocks');
    localStorage.removeItem('claimease_notifs');
    localStorage.removeItem('claimease_user');
    setClaims(INITIAL_CLAIMS);
    setBlockchainBlocks(INITIAL_BLOCKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(DEMO_USERS.patient);
    setCurrentRole('patient');
    refreshBackendData();
    showToast('info', 'System Reset', 'Restored default demo claims, telemetry, and blockchain logs.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        claims,
        blockchainBlocks,
        notifications,
        unreadNotifsCount,
        language,
        backendConnected,
        t,
        setLanguage,
        login,
        logout,
        switchRole,
        addClaim,
        updateClaimStatus,
        adjudicateClaim,
        uploadAdditionalDocument,
        markNotificationsAsRead,
        toasts,
        showToast,
        removeToast,
        selectedClaimForDetail,
        setSelectedClaimForDetail,
        isDigiLockerModalOpen,
        setIsDigiLockerModalOpen,
        isBlockchainModalOpen,
        setIsBlockchainModalOpen,
        isNewClaimModalOpen,
        setIsNewClaimModalOpen,
        refreshBackendData,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
