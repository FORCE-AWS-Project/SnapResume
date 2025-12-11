/**
 * Background Service Worker
 * Runs continuously in the background
 * Handles:
 * - Cross-component messaging
 * - Resume/section/recommendation API calls against backend
 * - Lightweight storage for cached resume data
 */

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

const API_BASE = 'http://localhost:3005/api';
const BASIC_AUTH_HEADER = `Basic ${btoa('Dev:2xw6lK4_')}`;

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('SnapResume Manager extension installed');
});

/**
 * Message handler for popup, content script, and page communication
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Message received:', message.type, message);

  // Handle token requests
  if (message.type === MESSAGE_TYPES.GET_TOKEN) {
    sendResponse({
      token: null,
      user: null,
      isAuthenticated: false
    });
    return true; // Keep channel open for async response
  }

  // Handle logout (clear cached state)
  if (message.type === MESSAGE_TYPES.LOGOUT_REQUEST) {
    chrome.storage.local.remove(
      [STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.ID_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER],
      () => {
        sendResponse({ success: true, message: 'State cleared' });
        notifyAllTabs({ type: 'USER_LOGGED_OUT' });
      }
    );
    return true;
  }

  // Handle resume data save
  if (message.type === MESSAGE_TYPES.SAVE_RESUME_DATA) {
    const resumeId = message.resumeId;
    if (!resumeId) {
      sendResponse({ success: false, error: 'resumeId is required' });
      return true;
    }
    saveResumeData(resumeId, message.data).then(() => {
      sendResponse({ success: true });
      notifyAllTabs({
        type: MESSAGE_TYPES.RESUME_UPDATED,
        data: message.data
      });
    });
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
    fetch(`${API_BASE}/resumes`, {
      headers: {
        Authorization: BASIC_AUTH_HEADER
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const resumes = data?.data?.resumes || data?.data || data || [];
        sendResponse({ success: true, data: resumes });
      })
      .catch((error) => {
        console.error('[Background] Error fetching resumes:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  // Handle single resume data retrieval (full resume preferred)
  if (message.type === 'GET_RESUME_DATA') {
    const { resumeId } = message;
    if (!resumeId) {
      sendResponse({ success: false, error: 'resumeId is required' });
      return true;
    }

    fetch(`${API_BASE}/resumes/${resumeId}/full`, {
      headers: {
        Authorization: BASIC_AUTH_HEADER
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const payload = data?.data || data;
        saveResumeData(resumeId, payload);
        sendResponse({ success: true, data: payload });
      })
      .catch((error) => {
        console.error('[Background] Error loading resume:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  // Recommendations via backend AI
  if (message.type === 'GET_RECOMMENDATIONS') {
    const { resumeId, jobDescription } = message;
    if (!resumeId || !jobDescription) {
      sendResponse({ success: false, error: 'resumeId and jobDescription are required' });
      return true;
    }

    fetch(`${API_BASE}/recommendations/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: BASIC_AUTH_HEADER
      },
      body: JSON.stringify({ resumeId, jobDescription })
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        sendResponse({ success: true, data: data?.data || data });
      })
      .catch((error) => {
        console.error('[Background] Error fetching recommendations:', error);
        sendResponse({ success: false, error: error.message });
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
  }
});

/**
 * Save resume data to storage keyed by resumeId (cache)
 */
function saveResumeData(resumeId, data) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [resumeId]: data, [STORAGE_KEYS.RESUME_DATA]: data },
      () => resolve()
    );
  });
}
