import api from './api.js';

const resumeService = {
  getResumes: async () => {
    return api.get('/api/resumes', { useAuth: true });
  },

  getResume: async (resumeId) => {
    return api.get(`/api/resumes/${resumeId}`, { useAuth: true });
  },

  getResumeFull: async (resumeId) => {
    return api.get(`/api/resumes/${resumeId}/full`, { useAuth: true });
  },

  createResume: async (resumeData) => {
    return api.post('/api/resumes', resumeData, { useAuth: true });
  },

  updateResume: async (resumeId, resumeData) => {
    return api.put(`/api/resumes/${resumeId}`, resumeData, { useAuth: true });
  },

  deleteResume: async (resumeId) => {
    return api.delete(`/api/resumes/${resumeId}`, { useAuth: true });
  },
};

export default resumeService;