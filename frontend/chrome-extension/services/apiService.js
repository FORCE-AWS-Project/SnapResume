/**
 * Extension API Service
 * Handles all communication with SnapResume Backend API
 * 
 * Features:
 * - Centralized API configuration
 * - Token management
 * - Error handling and retry logic
 * - Request/response logging
 */

class ExtensionAPIService {
  constructor() {
    this.baseURL = 'http://localhost:3005/api';
    this.timeout = 30000;
    this.debug = true;
  }

  /**
   * Get stored authentication token
   */
  async getToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['snapresume_access_token', 'snapresume_id_token'], (result) => {
        const token = result.snapresume_access_token || result.snapresume_id_token;
        resolve(token || null);
      });
    });
  }

  /**
   * Make authenticated API request
   * @param {string} endpoint - API endpoint (e.g., /resumes)
   * @param {object} options - Fetch options
   * @returns {Promise<object>} Response data
   */
  async request(endpoint, options = {}) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }

      const url = `${this.baseURL}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      };

      const config = {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.timeout)
      };

      this.log('API Request:', { url, method: options.method || 'GET' });

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `API Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      this.log('API Response:', { status: response.status, data });
      
      return data;
    } catch (error) {
      this.error('API Request Failed:', error);
      throw error;
    }
  }

  /**
   * Get all resumes for current user
   * @returns {Promise<object>} { data: Resume[] }
   */
  async getResumes() {
    return this.request('/resumes');
  }

  /**
   * Get specific resume with metadata
   * @param {string} resumeId - Resume ID
   * @returns {Promise<object>} { data: Resume }
   */
  async getResume(resumeId) {
    if (!resumeId) {
      throw new Error('Resume ID is required');
    }
    return this.request(`/resumes/${resumeId}`);
  }

  /**
   * Get full resume with all section data
   * @param {string} resumeId - Resume ID
   * @returns {Promise<object>} { data: FullResume }
   */
  async getFullResume(resumeId) {
    if (!resumeId) {
      throw new Error('Resume ID is required');
    }
    return this.request(`/resumes/${resumeId}/full`);
  }

  /**
   * Get AI-powered section recommendations
   * @param {string} resumeId - Resume ID to get recommendations for
   * @param {string} jobDescription - Job description to analyze
   * @returns {Promise<object>} { data: { recommendations: Recommendation[] } }
   */
  async getRecommendations(resumeId, jobDescription) {
    if (!resumeId || !jobDescription) {
      throw new Error('Resume ID and job description are required');
    }

    return this.request('/recommendations/sections', {
      method: 'POST',
      body: JSON.stringify({
        resumeId,
        jobDescription
      })
    });
  }

  /**
   * Update a section
   * @param {string} sectionId - Section ID
   * @param {object} data - Updated section data
   * @returns {Promise<object>} { data: Section }
   */
  async updateSection(sectionId, data) {
    if (!sectionId) {
      throw new Error('Section ID is required');
    }

    return this.request(`/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Get list of available templates
   * Public endpoint - no auth required
   * @returns {Promise<object>} { data: { templates: Template[] } }
   */
  async getTemplates() {
    try {
      const response = await fetch(`${this.baseURL}/templates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.error('Failed to fetch templates:', error);
      throw error;
    }
  }

  /**
   * Logging utilities
   */
  log(...args) {
    if (this.debug) {
      console.log('[SnapResume Extension]', ...args);
    }
  }

  error(...args) {
    console.error('[SnapResume Extension ERROR]', ...args);
  }
}

// Export singleton instance
const apiService = new ExtensionAPIService();

// For debugging in popup
if (typeof window !== 'undefined') {
  window.__SNAPRESUME_API__ = apiService;
}

// Support both browser and module contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiService;
}

export default apiService;
