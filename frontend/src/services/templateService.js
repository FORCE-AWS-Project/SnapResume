import api from './api.js';

const templateService = {
  getTemplates: async (category = null) => {
    return api.get("/api/templates");
  },

  getTemplateById: async (templateId) => {
    return api.get(`/api/templates/${templateId}`);
  },
};

export default templateService;