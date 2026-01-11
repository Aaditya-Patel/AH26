import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Log API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_URL);
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details for debugging
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors (CORS, connection refused, etc.)
    if (!error.response) {
      console.error('🚫 Network Error - Check if backend is running and CORS is configured:', {
        baseURL: API_URL,
        message: error.message,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Auth API
export const authAPI = {
  register: (data: any) => apiClient.post('/api/auth/register', data),
  login: (data: any) => apiClient.post('/api/auth/login', data),
  me: () => apiClient.get('/api/auth/me'),
};

// Education API
export const educationAPI = {
  chat: (question: string) => apiClient.post('/api/education/chat', { question }),
  chatStream: async function* (question: string) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/education/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ question }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('Response body is not readable');
    }
    
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          yield data;
        }
      }
    }
    
    // Process remaining buffer
    if (buffer.startsWith('data: ')) {
      yield buffer.slice(6);
    }
  },
};

// Calculator API
export const calculatorAPI = {
  getQuestions: (sector: string) => 
    apiClient.get(`/api/calculator/questions/${sector}`),
  calculate: (sector: string, answers: any) => 
    apiClient.post('/api/calculator/calculate', { sector, answers }),
  chatStream: async function* (question: string, conversationState?: any) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/calculator/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ question, conversation_state: conversationState }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('Response body is not readable');
    }
    
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          yield data;
        }
      }
    }
    
    // Process remaining buffer
    if (buffer.startsWith('data: ')) {
      yield buffer.slice(6);
    }
  },
};

// Matching API
export const matchingAPI = {
  find: (data: any) => apiClient.post('/api/matching/find', data),
};

// Marketplace API
export const marketplaceAPI = {
  getListings: (params?: any) => apiClient.get('/api/marketplace/listings', { params }),
  createListing: (data: any) => apiClient.post('/api/marketplace/listings', data),
  getListing: (id: string) => apiClient.get(`/api/marketplace/listings/${id}`),
  updateListing: (id: string, data: any) => apiClient.patch(`/api/marketplace/listings/${id}`, data),
  deleteListing: (id: string) => apiClient.delete(`/api/marketplace/listings/${id}`),
  getMyListings: (params?: any) => apiClient.get('/api/marketplace/my-listings', { params }),
};

// Formalities API
export const formalitiesAPI = {
  getSteps: (workflowType: string) => 
    apiClient.get(`/api/formalities/steps/${workflowType}`),
  chat: (question: string, conversationState?: any) =>
    apiClient.post('/api/formalities/chat', { question, conversation_state: conversationState }),
  chatStream: async function* (question: string, conversationState?: any) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/formalities/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ question, conversation_state: conversationState }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('Response body is not readable');
    }
    
    let buffer = '';
    let multilineBuffer: string[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          // Accumulate multiline data
          multilineBuffer.push(line.slice(6));
        } else if (line === '' && multilineBuffer.length > 0) {
          // Empty line ends multiline event - join with newlines and yield
          yield multilineBuffer.join('\n');
          multilineBuffer = [];
        } else if (multilineBuffer.length > 0) {
          // Non-data line while we have buffered data - yield accumulated content
          yield multilineBuffer.join('\n');
          multilineBuffer = [];
        }
      }
    }
    
    // Process remaining buffer and any buffered multiline content
    if (buffer.startsWith('data: ')) {
      multilineBuffer.push(buffer.slice(6));
    }
    if (multilineBuffer.length > 0) {
      yield multilineBuffer.join('\n');
    }
  },
};

// Transactions API
export const transactionsAPI = {
  // Orders
  createOrder: (data: { listing_id: string; quantity: number; price_per_credit: number }) =>
    apiClient.post('/api/transactions/orders', data),
  getOrders: (params?: { status?: string; order_type?: string }) =>
    apiClient.get('/api/transactions/orders', { params }),
  cancelOrder: (orderId: string) =>
    apiClient.delete(`/api/transactions/orders/${orderId}`),
  
  // Transactions
  buyCredits: (data: { listing_id: string; quantity: number }) =>
    apiClient.post('/api/transactions/buy', data),
  getTransactions: (params?: { status?: string; role?: 'buyer' | 'seller' }) =>
    apiClient.get('/api/transactions/transactions', { params }),
  getTransaction: (transactionId: string) =>
    apiClient.get(`/api/transactions/transactions/${transactionId}`),
  cancelTransaction: (transactionId: string) =>
    apiClient.post(`/api/transactions/transactions/${transactionId}/cancel`),
  getTransactionSummary: () =>
    apiClient.get('/api/transactions/transactions/summary/me'),
};

// Payments API
export const paymentsAPI = {
  initiatePayment: (transactionId: string) =>
    apiClient.post('/api/payments/initiate', { transaction_id: transactionId }),
  verifyPayment: (data: {
    transaction_id: string;
    gateway_payment_id: string;
    gateway_order_id: string;
    gateway_signature: string;
  }) => apiClient.post('/api/payments/verify', data),
  simulateComplete: (transactionId: string) =>
    apiClient.post(`/api/payments/simulate-complete/${transactionId}`),
  refundPayment: (transactionId: string, reason: string) =>
    apiClient.post('/api/payments/refund', { transaction_id: transactionId, reason }),
  getPaymentStatus: (transactionId: string) =>
    apiClient.get(`/api/payments/${transactionId}`),
};

// Credit Registry API
export const registryAPI = {
  // Account
  getAccount: () => apiClient.get('/api/registry/account'),
  
  // Credit Transactions
  getCreditTransactions: (params?: { transaction_type?: string; limit?: number; offset?: number }) =>
    apiClient.get('/api/registry/transactions', { params }),
  
  // Transfer
  transferCredits: (data: { recipient_email: string; amount: number; description?: string }) =>
    apiClient.post('/api/registry/transfer', data),
  
  // Retirement
  retireCredits: (data: {
    amount: number;
    purpose: 'compliance' | 'voluntary' | 'surrender';
    compliance_period?: string;
    beneficiary?: string;
  }) => apiClient.post('/api/registry/retire', data),
  getRetirements: (params?: { purpose?: string; compliance_period?: string }) =>
    apiClient.get('/api/registry/retirements', { params }),
  getRetirement: (retirementId: string) =>
    apiClient.get(`/api/registry/retirements/${retirementId}`),
  
  // Issuances
  getIssuances: (params?: { status?: string }) =>
    apiClient.get('/api/registry/issuances', { params }),
  
  // Demo endpoint
  issueCredits: (amount: number, projectType?: string, vintage?: number) =>
    apiClient.post('/api/registry/demo/issue-credits', null, {
      params: { amount, project_type: projectType, vintage }
    }),
};

// Verification API
export const verificationAPI = {
  create: (data: { verification_type: string; verifier_agency?: string }) =>
    apiClient.post('/api/verification/create', data),
  get: (verificationId: string) =>
    apiClient.get(`/api/verification/${verificationId}`),
  update: (verificationId: string, data: any) =>
    apiClient.patch(`/api/verification/${verificationId}`, data),
  submitDocuments: (verificationId: string) =>
    apiClient.post(`/api/verification/${verificationId}/submit-documents`),
  approveDemo: (verificationId: string) =>
    apiClient.post(`/api/verification/demo/approve/${verificationId}`),
  requestListingVerification: (listingId: string, verifierAgency?: string) =>
    apiClient.post(`/api/verification/listings/${listingId}/request-verification`, null, {
      params: { verifier_agency: verifierAgency }
    }),
  uploadDocument: (data: {
    document_type: string;
    filename: string;
    file_url: string;
    file_size?: number;
    mime_type?: string;
  }, verificationId?: string, projectId?: string) =>
    apiClient.post('/api/verification/documents', data, {
      params: { verification_id: verificationId, project_id: projectId }
    }),
  getDocuments: (params?: { document_type?: string; verification_id?: string }) =>
    apiClient.get('/api/verification/documents', { params }),
  // OCR endpoints
  extractOCR: (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/verification/documents/ocr', formData, {
      params: { document_type: documentType },
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  // Verification assistant endpoints
  assistantChat: (question: string) =>
    apiClient.post('/api/verification/assistant/chat', { question }),
  getChecklist: (userType: 'buyer' | 'seller') =>
    apiClient.get('/api/verification/assistant/checklist', { params: { user_type: userType } }),
  validateDocuments: () =>
    apiClient.post('/api/verification/assistant/validate'),
  // Document validation endpoint
  validateDocumentsFull: () =>
    apiClient.post('/api/verification/documents/validate'),
  // Credit verification endpoint
  verifyCredits: () =>
    apiClient.post('/api/verification/credits/verify'),
};

// Compliance API
export const complianceAPI = {
  createRecord: (data: {
    compliance_period: string;
    sector: string;
    target_emission_intensity?: number;
    baseline_emission_intensity?: number;
    deadline?: string;
  }) => apiClient.post('/api/compliance/records', data),
  getRecords: (params?: { compliance_period?: string; status?: string }) =>
    apiClient.get('/api/compliance/records', { params }),
  getRecord: (recordId: string) =>
    apiClient.get(`/api/compliance/records/${recordId}`),
  submitData: (recordId: string, data: { actual_emissions: number; actual_production: number }) =>
    apiClient.post(`/api/compliance/records/${recordId}/submit`, data),
  surrenderCredits: (recordId: string, amount: number) =>
    apiClient.post(`/api/compliance/records/${recordId}/surrender-credits`, null, {
      params: { amount }
    }),
  getSummary: () =>
    apiClient.get('/api/compliance/summary'),
  getSectorTargets: () =>
    apiClient.get('/api/compliance/sectors'),
};

// Market Data API
export const marketDataAPI = {
  getOverview: () =>
    apiClient.get('/api/market/overview'),
  getPriceHistory: (params?: { days?: number; project_type?: string; vintage?: number }) =>
    apiClient.get('/api/market/price-history', { params }),
  getPriceChart: (params?: { days?: number; project_type?: string }) =>
    apiClient.get('/api/market/price-chart', { params }),
  getStats: (date?: string) =>
    apiClient.get('/api/market/stats', { params: { date_str: date } }),
  getListingsSummary: () =>
    apiClient.get('/api/market/listings-summary'),
};

// Projects API
export const projectsAPI = {
  create: (data: {
    project_name: string;
    project_type: string;
    methodology: string;
    description?: string;
    location?: string;
    state?: string;
    coordinates?: string;
    start_date?: string;
    crediting_period_start?: string;
    crediting_period_end?: string;
    expected_annual_credits?: number;
  }) => apiClient.post('/api/projects/', data),
  getAll: (params?: { status?: string }) =>
    apiClient.get('/api/projects/', { params }),
  get: (projectId: string) =>
    apiClient.get(`/api/projects/${projectId}`),
  update: (projectId: string, data: any) =>
    apiClient.patch(`/api/projects/${projectId}`, data),
  submit: (projectId: string) =>
    apiClient.post(`/api/projects/${projectId}/submit`),
  validateDemo: (projectId: string, validatorAgency?: string) =>
    apiClient.post(`/api/projects/demo/validate/${projectId}`, null, {
      params: { validator_agency: validatorAgency }
    }),
  getMethodologies: () =>
    apiClient.get('/api/projects/methodologies/list'),
};
