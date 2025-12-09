import axios from 'axios';
import CognitoService from './cognito.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Add authorization header to requests
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const tokens = await CognitoService.getTokens();
      if (tokens && tokens.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    } catch (error) {
      console.error('Error getting tokens:', error);
      // Continue without token - backend will handle 401
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Handle token refresh on 401 response
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry on 401 and if not already retried
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/login') {
      originalRequest._retry = true;

      try {
        const tokens = await CognitoService.getTokens();
        if (tokens && tokens.refreshToken) {
          const newTokens = await CognitoService.refreshTokens(tokens.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth?tab=login';
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Resume API endpoints
 */
const resumeAPI = {
  // Get all resumes for current user
  getResumes: () => apiClient.get('/api/resumes'),

  // Get resume by ID
  getResume: (resumeId) => apiClient.get(`/api/resumes/${resumeId}`),

  // Create new resume
  createResume: (data) => apiClient.post('/api/resumes', data),

  // Update resume
  updateResume: (resumeId, data) => apiClient.put(`/api/resumes/${resumeId}`, data),

  // Delete resume
  deleteResume: (resumeId) => apiClient.delete(`/api/resumes/${resumeId}`),

  // Get resume sections
  getSections: (resumeId) => apiClient.get(`/api/resumes/${resumeId}/sections`),

  // Update resume section
  updateSection: (resumeId, sectionId, data) => apiClient.put(`/api/resumes/${resumeId}/sections/${sectionId}`, data),

  // Export resume
  exportResume: (resumeId, format = 'pdf') => apiClient.get(`/api/resumes/${resumeId}/export?format=${format}`)
};

/**
 * User API endpoints
 */
const userAPI = {
  // Get current user profile (GET /api/users/me)
  getProfile: () => apiClient.get('/api/users/me'),
  
  // Alias for getProfile - get authenticated user's profile
  getMe: () => apiClient.get('/api/users/me'),

  // Update user profile (PUT /api/users/me)
  updateProfile: (data) => apiClient.put('/api/users/me', data),

  // Upload profile picture
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/users/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

/**
 * Template API endpoints
 */
const templateAPI = {
  // Get all templates
  getTemplates: () => apiClient.get('/api/templates'),

  // Get template by ID
  getTemplate: (templateId) => apiClient.get(`/api/templates/${templateId}`)
};

/**
 * Recommendation API endpoints
 */
const recommendationAPI = {
  // Get recommendations for section
  getRecommendations: (resumeId, sectionType) => apiClient.get(`/api/recommendations?resumeId=${resumeId}&sectionType=${sectionType}`),

  // Update section with recommendation
  applyRecommendation: (resumeId, sectionId, recommendation) => apiClient.post(`/api/recommendations/apply`, {
    resumeId,
    sectionId,
    recommendation
  })
};

export const API = {
  client: apiClient,
  resume: resumeAPI,
  user: userAPI,
  template: templateAPI,
  recommendation: recommendationAPI
};

export default API;
