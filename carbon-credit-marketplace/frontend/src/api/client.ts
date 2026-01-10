import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
};

// Calculator API
export const calculatorAPI = {
  calculate: (sector: string, answers: any) => 
    apiClient.post('/api/calculator/calculate', { sector, answers }),
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
};

// Formalities API
export const formalitiesAPI = {
  getSteps: (workflowType: string) => 
    apiClient.get(`/api/formalities/steps/${workflowType}`),
};
