/**
 * Background Service Worker
 * Runs continuously in the background
 */

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('SnapResume Manager extension installed')

  // Set default storage
  chrome.storage.local.get(['currentResume'], (result) => {
    if (!result.currentResume) {
      chrome.storage.local.set({
        currentResume: {
          personalInfo: {},
          experience: [],
          education: [],
          skills: [],
          certifications: [],
          projects: []
        }
      })
    }
  })
})

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background:', message)

  if (message.type === 'GET_RESUME_DATA') {
    // Retrieve resume data from storage
    chrome.storage.local.get(['currentResume'], (result) => {
      sendResponse({
        data: result.currentResume || {}
      })
    })
    return true // Keep channel open for async response
  }

  if (message.type === 'SAVE_RESUME_DATA') {
    // Save resume data to storage
    chrome.storage.local.set({ currentResume: message.data }, () => {
      sendResponse({ success: true })

      // Broadcast to all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          try {
            chrome.tabs.sendMessage(tab.id, {
              type: 'RESUME_UPDATED',
              data: message.data
            })
          } catch (error) {
            // Tab might not be accessible
          }
        })
      })
    })
    return true
  }

  if (message.type === 'SYNC_FROM_WEB') {
    // Sync data from web app to extension storage
    chrome.storage.local.set({ currentResume: message.data }, () => {
      sendResponse({ success: true })
    })
    return true
  }
})

// Handle storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.currentResume) {
    // Notify all tabs of storage changes
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        try {
          chrome.tabs.sendMessage(tab.id, {
            type: 'RESUME_SYNCED',
            data: changes.currentResume.newValue
          })
        } catch (error) {
          // Tab might not be accessible
        }
      })
    })
  }
})
