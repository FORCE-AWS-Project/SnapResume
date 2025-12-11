import api from './api.js';

const resumeService = {
  getResumes: async () => {
    return api.get('/api/resumes');
  },

  getResume: async (resumeId) => {
    return api.get(`/api/resumes/${resumeId}`);
  },

  getResumeFull: async (resumeId) => {
    return api.get(`/api/resumes/${resumeId}/full`);
  },

  createResume: async (resumeData) => {
    return api.post('/api/resumes', resumeData);
  },

  updateResume: async (resumeId, resumeData) => {
    return api.put(`/api/resumes/${resumeId}`, resumeData);
  },

  deleteResume: async (resumeId) => {
    return api.delete(`/api/resumes/${resumeId}`);
  },
};

export default resumeService;