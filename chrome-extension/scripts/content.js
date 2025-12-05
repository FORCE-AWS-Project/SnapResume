/**
 * Content Script
 * Runs on the web page to bridge communication between
 * the extension and the web app
 */

console.log('SnapResume content script loaded')

// Listen for messages from the extension background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message.type)

  if (message.type === 'RESUME_UPDATED' || message.type === 'RESUME_SYNCED') {
    // Notify the web app of resume updates
    window.postMessage({
      type: 'RESUME_UPDATED_FROM_EXTENSION',
      data: message.data
    }, '*')
  }

  if (message.type === 'GET_PAGE_DATA') {
    // Get data from the web page
    const pageData = window.__SNAPRESUME_DATA__ || {}
    sendResponse({ data: pageData })
  }
})

// Listen for messages from the web page
window.addEventListener('message', (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return

  console.log('Content script received from page:', event.data.type)

  if (event.data.type === 'RESUME_UPDATED_FROM_PAGE') {
    // Send update to extension background
    chrome.runtime.sendMessage({
      type: 'SYNC_FROM_WEB',
      data: event.data.data
    })
  }

  if (event.data.type === 'REQUEST_EXTENSION_DATA') {
    // Request data from extension
    chrome.runtime.sendMessage({ type: 'GET_RESUME_DATA' }, (response) => {
      window.postMessage({
        type: 'EXTENSION_DATA_RESPONSE',
        data: response.data
      }, '*')
    })
  }
})

// Inject a bridge script into the page context
// This allows the web app to communicate with the extension
const script = document.createElement('script')
script.textContent = `
  window.__EXTENSION_BRIDGE__ = {
    requestData() {
      return new Promise((resolve) => {
        window.addEventListener('message', function handler(event) {
          if (event.data.type === 'EXTENSION_DATA_RESPONSE') {
            window.removeEventListener('message', handler)
            resolve(event.data.data)
          }
        })
        window.postMessage({ type: 'REQUEST_EXTENSION_DATA' }, '*')
      })
    },
    
    sendData(data) {
      window.postMessage({
        type: 'RESUME_UPDATED_FROM_PAGE',
        data: data
      }, '*')
    },
    
    onDataUpdate(callback) {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'RESUME_UPDATED_FROM_EXTENSION') {
          callback(event.data.data)
        }
      })
    }
  }
`
document.documentElement.appendChild(script)
script.remove()

console.log('SnapResume extension bridge injected into page')
