/**
 * ClaimEase AI - Centralized REST API Service
 * Connects frontend directly to PEC Django backend (/api/...)
 */

const API_BASE = '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
  [key: string]: any;
}

// Helper to make fetch calls
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // If body is FormData, delete Content-Type to allow browser to set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, error);
    return {
      success: false,
      error: error.message || 'Network request failed',
      code: 'NETWORK_ERROR',
    };
  }
}

export const ApiService = {
  // ====================
  // AUTHENTICATION & RBAC
  // ====================
  auth: {
    login: async (payload: { username: string; password: string }) => {
      return request<{ user: any; session_id: string }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    register: async (payload: {
      username: string;
      email: string;
      password: string;
      role: string;
      organization?: string;
      phone_number?: string;
    }) => {
      return request<{ user: any; profile: any }>('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    getUser: async () => {
      return request<{ username: string; role: string; profile: any }>('/auth/user/');
    },

    logout: async () => {
      return request('/auth/logout/', { method: 'POST' });
    },
  },

  // ====================
  // CLAIMS MANAGEMENT
  // ====================
  claims: {
    list: async (params?: { status?: string; hospital_id?: string; patient_id?: string }) => {
      const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      return request<{ count: number; data: any[] }>(`/claims/${query}`);
    },

    get: async (claimId: string | number) => {
      return request<any>(`/claims/${claimId}/`);
    },

    create: async (claimData: {
      patient_name: string;
      patient_age?: number;
      patient_gender?: string;
      hospital_name?: string;
      hospital_id?: string;
      doctor_id?: string;
      diagnosis?: string;
      procedure?: string;
      amount: number | string;
      admission_date?: string;
      discharge_date?: string;
      days_admitted?: number;
      insurance_type?: string;
      previous_claims?: number;
      previous_claim_amount?: number | string;
      duplicate_claim?: boolean;
      diagnosis_procedure_match?: boolean;
      notes?: string;
    }) => {
      return request<{ id: number; data: any }>('/claims/', {
        method: 'POST',
        body: JSON.stringify(claimData),
      });
    },

    submit: async (claimId: string | number) => {
      return request<{ status: string }>(`/claims/${claimId}/submit/`, {
        method: 'POST',
      });
    },

    process: async (claimId: string | number) => {
      return request<{ status: string; validation: any; fraud_analysis: any }>(
        `/claims/${claimId}/process/`,
        { method: 'POST' }
      );
    },

    update: async (claimId: string | number, updateData: any) => {
      return request<any>(`/claims/${claimId}/`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    },

    uploadDocument: async (claimId: string | number, file: File, documentType: string = 'bill') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);

      return request<{ data: any; ocr_result: any }>(`/claims/${claimId}/documents/`, {
        method: 'POST',
        body: formData,
      });
    },

    getDocuments: async (claimId: string | number) => {
      return request<any[]>(`/claims/${claimId}/documents/`);
    },
  },

  // ====================
  // OCR INTELLIGENCE
  // ====================
  ocr: {
    triggerOCR: async (documentId: string | number) => {
      return request<any>(`/documents/${documentId}/ocr/`, {
        method: 'POST',
      });
    },
  },

  // ====================
  // AI FRAUD RADAR & ANALYTICS
  // ====================
  fraud: {
    getStats: async () => {
      return request<{
        total_claims: number;
        total_amount: number;
        high_risk_count: number;
        medium_risk_count: number;
        low_risk_count: number;
        pending_review_count: number;
        average_risk_score: number;
      }>('/fraud/stats/');
    },

    analyze: async (payload: {
      claim_id?: number;
      patient_name?: string;
      hospital_name?: string;
      procedure?: string;
      amount?: number;
      previous_claims?: number;
      previous_claim_amount?: number;
      duplicate_claim?: boolean;
      diagnosis_procedure_match?: boolean;
      documents_verified?: boolean;
      hospital_claim_count?: number;
    }) => {
      return request<{
        risk_score: number;
        risk_level: 'low' | 'medium' | 'high';
        fraud_detected: boolean;
        reasons: string[];
        recommended_action: string;
      }>('/fraud/analyze/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    getAnalysisDetail: async (claimId: string | number) => {
      return request<any>(`/fraud/analysis/${claimId}/`);
    },
  },

  // ====================
  // PATIENT REPOSITORY
  // ====================
  patients: {
    list: async () => {
      return request<{ count: number; data: any[] }>('/patients/');
    },

    get: async (patientId: string) => {
      return request<any>(`/patients/${patientId}/`);
    },

    getRecords: async (patientId: string) => {
      return request<{ patient: string; records: any[] }>(`/patients/${patientId}/records/`);
    },
  },

  // ====================
  // SYSTEM HEALTH
  // ====================
  system: {
    getHealth: async () => {
      return request<{
        status: string;
        service: string;
        database: string;
        version: string;
      }>('/health/');
    },
  },
};
