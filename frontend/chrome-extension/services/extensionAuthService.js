/**
 * Extension Authentication Service
 * Handles token storage and communication between:
 * - Extension Popup (React UI)
 * - Content Script
 * - Background Service Worker
 * - Backend API
 */

// Constants for message types
export const MESSAGE_TYPES = {
  // Auth messages
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_RESPONSE: 'LOGIN_RESPONSE',
  LOGOUT_REQUEST: 'LOGOUT_REQUEST',
  LOGOUT_RESPONSE: 'LOGOUT_RESPONSE',
  GET_TOKEN: 'GET_TOKEN',
  TOKEN_RESPONSE: 'TOKEN_RESPONSE',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  TOKEN_REFRESH_RESPONSE: 'TOKEN_REFRESH_RESPONSE',

  // Data messages
  GET_RESUME_DATA: 'GET_RESUME_DATA',
  RESUME_DATA_RESPONSE: 'RESUME_DATA_RESPONSE',
  SAVE_RESUME_DATA: 'SAVE_RESUME_DATA',
  RESUME_DATA_SAVED: 'RESUME_DATA_SAVED',
  RESUME_DATA_UPDATE: 'RESUME_DATA_UPDATE',

  // Bridge messages
  BRIDGE_READY: 'BRIDGE_READY',
  BRIDGE_REQUEST_DATA: 'BRIDGE_REQUEST_DATA',
  BRIDGE_SEND_DATA: 'BRIDGE_SEND_DATA',
  BRIDGE_DATA_UPDATE: 'BRIDGE_DATA_UPDATE'
};

class ExtensionAuthService {
  constructor() {
    this.tokens = null;
    this.user = null;
    this.listeners = [];
  }

  /**
   * Initialize storage keys
   */
  static get STORAGE_KEYS() {
    return {
      ACCESS_TOKEN: 'snapresume_access_token',
      ID_TOKEN: 'snapresume_id_token',
      REFRESH_TOKEN: 'snapresume_refresh_token',
      USER: 'snapresume_user',
      RESUME_DATA: 'snapresume_resume_data'
    };
  }

  /**
   * Save tokens to Chrome storage
   */
  async saveTokens(tokens) {
    return new Promise((resolve, reject) => {
      const storageData = {
        [ExtensionAuthService.STORAGE_KEYS.ACCESS_TOKEN]: tokens.accessToken,
        [ExtensionAuthService.STORAGE_KEYS.ID_TOKEN]: tokens.idToken,
        [ExtensionAuthService.STORAGE_KEYS.REFRESH_TOKEN]: tokens.refreshToken,
        [ExtensionAuthService.STORAGE_KEYS.USER]: {
          email: tokens.user?.email,
          userId: tokens.user?.userId
        },
        snapresume_token_timestamp: Date.now()
      };

      chrome.storage.local.set(storageData, (error) => {
        if (error) {
          reject(error);
        } else {
          this.tokens = tokens;
          this.user = tokens.user;
          resolve(tokens);
        }
      });
    });
  }

  /**
   * Get tokens from Chrome storage
   */
  async getTokens() {
    return new Promise((resolve) => {
      const keys = Object.values(ExtensionAuthService.STORAGE_KEYS);
      chrome.storage.local.get(keys, (result) => {
        if (result[ExtensionAuthService.STORAGE_KEYS.ACCESS_TOKEN]) {
          resolve({
            accessToken: result[ExtensionAuthService.STORAGE_KEYS.ACCESS_TOKEN],
            idToken: result[ExtensionAuthService.STORAGE_KEYS.ID_TOKEN],
            refreshToken: result[ExtensionAuthService.STORAGE_KEYS.REFRESH_TOKEN],
            user: result[ExtensionAuthService.STORAGE_KEYS.USER]
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Clear all stored tokens
   */
  async clearTokens() {
    return new Promise((resolve) => {
      const keys = Object.values(ExtensionAuthService.STORAGE_KEYS);
      chrome.storage.local.remove(keys, () => {
        this.tokens = null;
        this.user = null;
        resolve();
      });
    });
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    const tokens = await this.getTokens();
    return !!tokens && !!tokens.accessToken;
  }

  /**
   * Save resume data to Chrome storage
   */
  async saveResumeData(resumeData) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(
        { [ExtensionAuthService.STORAGE_KEYS.RESUME_DATA]: resumeData },
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(resumeData);
          }
        }
      );
    });
  }

  /**
   * Get resume data from Chrome storage
   */
  async getResumeData() {
    return new Promise((resolve) => {
      chrome.storage.local.get([ExtensionAuthService.STORAGE_KEYS.RESUME_DATA], (result) => {
        resolve(result[ExtensionAuthService.STORAGE_KEYS.RESUME_DATA] || null);
      });
    });
  }

  /**
   * Send message to background script
   */
  sendMessageToBackground(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Send message to content script
   */
  sendMessageToContent(tabId, message) {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Add listener for messages
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  /**
   * Broadcast message to all listeners
   */
  broadcastMessage(message) {
    this.listeners.forEach(callback => callback(message));
  }
}

// Export singleton instance
export const extensionAuthService = new ExtensionAuthService();
export default ExtensionAuthService;
