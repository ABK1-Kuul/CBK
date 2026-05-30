const BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('vula_jwt_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Central Auth Fetch interceptor to handle auto logout on 401 token invalidation
const authorizedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('vula_jwt_token');
  const headers = (options.headers || {}) as Record<string, string>;
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  options.headers = headers;

  const response = await fetch(url, options);
  
  if (response.status === 401) {
    console.warn('Unauthorized context detected (401). Performing auto-logout...');
    localStorage.removeItem('vula_jwt_token');
    localStorage.removeItem('vula_user_id');
    localStorage.removeItem('vula_business_id');
    localStorage.removeItem('sme_profile');
    localStorage.removeItem('sme_transactions');
    window.location.reload(); // Instantly boots them back to the login screen!
    throw new Error('Session expired. Please sign in again.');
  }

  return response;
};

export const registerUser = async (name: string, email: string, phone: string, password: string, role?: string) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password, role })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Registration failed');
  }
  return response.json();
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Login failed');
  }
  return response.json();
};

export const getMe = async () => {
  const response = await authorizedFetch(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Unauthorized');
  }
  return response.json();
};

export const createBusinessProfile = async (businessName: string, businessType: string, location: string, startDate: string) => {
  const response = await authorizedFetch(`${BASE_URL}/business`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessName, businessType, location, startDate })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to create business profile');
  }
  return response.json();
};

export const getBusinessByUserId = async (userId: number) => {
  const response = await authorizedFetch(`${BASE_URL}/business/user/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Failed to load businesses');
  }
  return response.json();
};

export const getTransactionsByBusiness = async (businessId: number) => {
  const response = await authorizedFetch(`${BASE_URL}/transactions/business/${businessId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Failed to load transactions');
  }
  return response.json();
};

export const createTransactionManual = async (txData: {
  businessId: number;
  type: string;
  amount: number;
  category: string;
  vendor: string;
  description: string;
  transactionDate: string;
  transactionReference?: string;
  proofSource?: string;
}) => {
  const response = await authorizedFetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...txData, source: 'MANUAL' })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to create transaction');
  }
  return response.json();
};

export const uploadReceiptOcr = async (businessId: number, file: File, typeOverride?: string) => {
  const formData = new FormData();
  formData.append('businessId', businessId.toString());
  formData.append('file', file);
  if (typeOverride) {
    formData.append('type', typeOverride.toUpperCase());
  }

  const url = typeOverride 
    ? `${BASE_URL}/receipts/upload?businessId=${businessId}&type=${typeOverride.toUpperCase()}`
    : `${BASE_URL}/receipts/upload?businessId=${businessId}`;

  const response = await authorizedFetch(url, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'AI OCR Receipt upload failed');
  }
  return response.json();
};

export const getFinancialSummary = async (businessId: number) => {
  const response = await authorizedFetch(`${BASE_URL}/financial/summary/${businessId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch financial summary');
  }
  return response.json();
};

export const getCreditScore = async (businessId: number) => {
  const response = await authorizedFetch(`${BASE_URL}/credit-score/${businessId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to calculate credit score');
  }
  return response.json();
};

export const recalculateCreditScore = async (businessId: number) => {
  const response = await authorizedFetch(`${BASE_URL}/credit-score/${businessId}/recalculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to recalculate credit score');
  }
  return response.json();
};

export const getFinancialPassport = async (businessId: number) => {
  const response = await authorizedFetch(`${BASE_URL}/passport/${businessId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Failed to load passport');
  }
  return response.json();
};

// AI Engine Endpoint Integrations
export const classifyRawTextAI = async (rawText: string) => {
  const response = await authorizedFetch(`${BASE_URL}/ai/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText })
  });
  if (!response.ok) {
    throw new Error('AI Classification failed');
  }
  return response.json();
};

export const getAIOptionalAdvice = async (financialSummary: any) => {
  const response = await authorizedFetch(`${BASE_URL}/ai/advisor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ financialData: JSON.stringify(financialSummary) })
  });
  if (!response.ok) {
    throw new Error('AI Advisor failed');
  }
  return response.json();
};
