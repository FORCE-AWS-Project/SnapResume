import api from './api.js';

const resumeService = {
  getResumes: async () => {
    return api.get('/resumes');
  },

  getResume: async (resumeId) => {
    return api.get(`/resumes/${resumeId}`);
  },

  getResumeFull: async (resumeId) => {
    return api.get(`/resumes/${resumeId}/full`);
  },

  createResume: async (resumeData) => {
    return api.post('/resumes', resumeData);
  },

  updateResume: async (resumeId, resumeData) => {
    return api.put(`/resumes/${resumeId}`, resumeData);
  },

  deleteResume: async (resumeId) => {
    return api.delete(`/resumes/${resumeId}`);
  },
};

export default resumeService;