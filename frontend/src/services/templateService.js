import api from './api.js';

const templateService = {
  getTemplates: async (category = null) => {
    const endpoint = category ? `/api/templates?category=${category}` : '/api/templates';
    return api.get(endpoint, { useAuth: false });
  },

  getTemplateById: async (templateId) => {
    return api.get(`/api/templates/${templateId}`, { useAuth: false });
  },

  getTemplateFile: async (templateUrl) => {
    try {
      const response = await fetch(templateUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error fetching template file:', error);
      throw error;
    }
  },
};

export default templateService;