import api from './api.js';

const sectionService = {
  getSections: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.resumeId) params.append('resumeId', filters.resumeId);
    if (filters.sectionType) params.append('sectionType', filters.sectionType);
    if (filters.tags) params.append('tags', filters.tags.join(','));
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const endpoint = `/api/sections${params.toString() ? `?${params.toString()}` : ''}`;
    return api.get(endpoint);
  },

  getSection: async (sectionId) => {
    return api.get(`/api/sections/${sectionId}`);
  },

  createSection: async (sectionData) => {
    return api.post('/api/sections', sectionData);
  },

  updateSection: async (sectionId, sectionData) => {
    return api.put(`/api/sections/${sectionId}`, sectionData);
  },

  deleteSection: async (sectionId) => {
    return api.delete(`/api/sections/${sectionId}`);
  },
};

export default sectionService;