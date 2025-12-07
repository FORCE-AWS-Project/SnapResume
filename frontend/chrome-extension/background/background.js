/**
 * Background Service Worker
 * Runs continuously in the background
 * Handles:
 * - Authentication token management
 * - Cross-component messaging
 * - Resume data synchronization
 */

// Import extension auth service functions
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'snapresume_access_token',
  ID_TOKEN: 'snapresume_id_token',
  REFRESH_TOKEN: 'snapresume_refresh_token',
  USER: 'snapresume_user',
  RESUME_DATA: 'snapresume_resume_data'
};

const MESSAGE_TYPES = {
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_RESPONSE: 'LOGIN_RESPONSE',
  LOGOUT_REQUEST: 'LOGOUT_REQUEST',
  GET_TOKEN: 'GET_TOKEN',
  TOKEN_RESPONSE: 'TOKEN_RESPONSE',
  GET_RESUME_DATA: 'GET_RESUME_DATA',
  SAVE_RESUME_DATA: 'SAVE_RESUME_DATA',
  RESUME_UPDATED: 'RESUME_UPDATED'
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('SnapResume Manager extension installed');

  // Set default storage
  chrome.storage.local.get([STORAGE_KEYS.RESUME_DATA], (result) => {
    if (!result[STORAGE_KEYS.RESUME_DATA]) {
      chrome.storage.local.set({
        [STORAGE_KEYS.RESUME_DATA]: {
          personalInfo: {},
          experience: [],
          education: [],
          skills: { categories: [] },
          certifications: [],
          projects: [],
          languages: [],
          volunteering: [],
          publications: []
        }
      });
    }
  });
});

/**
 * Message handler for popup, content script, and page communication
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Message received:', message.type, message);

  // Handle token requests
  if (message.type === MESSAGE_TYPES.GET_TOKEN) {
    chrome.storage.local.get(
      [STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.ID_TOKEN, STORAGE_KEYS.USER],
      (result) => {
        const token = result[STORAGE_KEYS.ACCESS_TOKEN] || result[STORAGE_KEYS.ID_TOKEN];
        const user = result[STORAGE_KEYS.USER];

        sendResponse({
          token,
          user,
          isAuthenticated: !!token
        });
      }
    );
    return true; // Keep channel open for async response
  }

  // Handle login
  if (message.type === MESSAGE_TYPES.LOGIN_REQUEST) {
    chrome.storage.local.set({
      [STORAGE_KEYS.ACCESS_TOKEN]: message.payload.accessToken,
      [STORAGE_KEYS.ID_TOKEN]: message.payload.idToken,
      [STORAGE_KEYS.REFRESH_TOKEN]: message.payload.refreshToken,
      [STORAGE_KEYS.USER]: message.payload.user,
      snapresume_token_timestamp: Date.now()
    }, () => {
      sendResponse({ success: true, message: 'Tokens saved' });
      notifyAllTabs({
        type: 'USER_AUTHENTICATED',
        user: message.payload.user
      });
    });
    return true;
  }

  // Handle logout
  if (message.type === MESSAGE_TYPES.LOGOUT_REQUEST) {
    chrome.storage.local.remove(
      [STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.ID_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER],
      () => {
        sendResponse({ success: true, message: 'User logged out' });
        notifyAllTabs({
          type: 'USER_LOGGED_OUT'
        });
      }
    );
    return true;
  }

  // Handle resume data retrieval
  if (message.type === MESSAGE_TYPES.GET_RESUME_DATA) {
    chrome.storage.local.get([STORAGE_KEYS.RESUME_DATA], (result) => {
      sendResponse({
        data: result[STORAGE_KEYS.RESUME_DATA] || {}
      });
    });
    return true;
  }

  // Handle resume data save
  if (message.type === MESSAGE_TYPES.SAVE_RESUME_DATA) {
    chrome.storage.local.set(
      { [STORAGE_KEYS.RESUME_DATA]: message.data },
      () => {
        sendResponse({ success: true });
        notifyAllTabs({
          type: MESSAGE_TYPES.RESUME_UPDATED,
          data: message.data
        });
      }
    );
    return true;
  }

  // Handle sync from web
  if (message.type === 'SYNC_FROM_WEB') {
    chrome.storage.local.set(
      { [STORAGE_KEYS.RESUME_DATA]: message.data },
      () => {
        sendResponse({ success: true });
      }
    );
    return true;
  }

  // Handle resume list retrieval
  if (message.type === 'GET_RESUMES') {
    const token = message.token;
    
    // Fetch resumes from backend API
    fetch('http://localhost:3005/api/resumes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        sendResponse({
          success: true,
          data: data.data || data
        });
      })
      .catch(error => {
        console.error('[Background] Error fetching resumes:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });
    return true;
  }

  // Handle single resume data retrieval
  if (message.type === 'GET_RESUME_DATA') {
    const { resumeId, token } = message;
    
    // Fetch resume from backend API
    fetch(`http://localhost:3005/api/resumes/${resumeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        sendResponse({
          success: true,
          data: data.data || data
        });
      })
      .catch(error => {
        console.error('[Background] Error fetching resume:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });
    return true;
  }
});

/**
 * Notify all tabs of state changes
 */
function notifyAllTabs(message) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      try {
        chrome.tabs.sendMessage(tab.id, message);
      } catch (error) {
        // Tab might not be accessible
        console.log('[Background] Could not send message to tab:', error);
      }
    });
  });
}

/**
 * Monitor storage changes
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes[STORAGE_KEYS.RESUME_DATA]) {
      notifyAllTabs({
        type: MESSAGE_TYPES.RESUME_UPDATED,
        data: changes[STORAGE_KEYS.RESUME_DATA].newValue
      });
    }

    if (changes[STORAGE_KEYS.ACCESS_TOKEN] || changes[STORAGE_KEYS.USER]) {
      // Token or user changed
      const hasToken = changes[STORAGE_KEYS.ACCESS_TOKEN]?.newValue;
      notifyAllTabs({
        type: hasToken ? 'USER_AUTHENTICATED' : 'USER_LOGGED_OUT'
      });
    }
  }
});
