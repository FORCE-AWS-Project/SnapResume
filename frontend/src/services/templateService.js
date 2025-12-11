import api from './api.js';

const templateService = {
  getTemplates: async (category = null) => {
    const endpoint = category ? `/templates?category=${category}` : '/templates';
    return api.get(endpoint);
  },

  getTemplateById: async (templateId) => {
    return api.get(`/templates/${templateId}`);
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