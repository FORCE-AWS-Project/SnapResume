/**
 * Context Provider for Resume Manager
 * Supports both web app and Chrome extension environments
 */

import React, { createContext, useContext, useEffect, useState } from 'react'

const ResumeManagerContext = createContext()

// Hook is separated for ESLint compliance
// eslint-disable-next-line react-refresh/only-export-components
export function useResumeManagerContext() {
  const context = useContext(ResumeManagerContext)
  if (!context) {
    throw new Error('useResumeManagerContext must be used within ResumeManagerProvider')
  }
  return context
}

/**
 * Detect environment (web app vs extension)
 */
function detectEnvironment() {
  // Check if chrome.runtime is available (extension context)
  // eslint-disable-next-line no-undef
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return 'extension'
  }
  return 'webapp'
}

/**
 * Storage abstraction layer - works in both contexts
 */
const createStorageAdapter = (environment) => {
  if (environment === 'extension') {
    // Extension storage using Chrome API
    return {
      async get(key, defaultValue) {
        return new Promise((resolve) => {
          // eslint-disable-next-line no-undef
          chrome.storage.local.get([key], (result) => {
            resolve(result[key] ?? defaultValue)
          })
        })
      },
      async set(key, value) {
        return new Promise((resolve) => {
          // eslint-disable-next-line no-undef
          chrome.storage.local.set({ [key]: value }, resolve)
        })
      },
      async remove(key) {
        return new Promise((resolve) => {
          // eslint-disable-next-line no-undef
          chrome.storage.local.remove([key], resolve)
        })
      },
      onChanged(callback) {
        // eslint-disable-next-line no-undef
        chrome.storage.onChanged.addListener((changes, areaName) => {
          if (areaName === 'local') {
            callback(changes)
          }
        })
      }
    }
  } else {
    // Web app storage using IndexedDB + localStorage
    const DB_NAME = 'SnapResume'
    const STORE_NAME = 'resumeData'

    return {
      async get(key, defaultValue) {
        try {
          // Try IndexedDB first
          const db = await this._openDB()
          return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly')
            const store = tx.objectStore(STORE_NAME)
            const request = store.get(key)

            request.onsuccess = () => {
              if (request.result) {
                resolve(request.result.value)
              } else {
                // Fallback to localStorage
                const stored = localStorage.getItem(`snapresume_${key}`)
                resolve(stored ? JSON.parse(stored) : defaultValue)
              }
            }

            request.onerror = () => {
              const stored = localStorage.getItem(`snapresume_${key}`)
              resolve(stored ? JSON.parse(stored) : defaultValue)
            }
          })
        } catch {
          const stored = localStorage.getItem(`snapresume_${key}`)
          return stored ? JSON.parse(stored) : defaultValue
        }
      },

      async set(key, value) {
        try {
          // Save to both IndexedDB and localStorage
          const db = await this._openDB()
          const tx = db.transaction(STORE_NAME, 'readwrite')
          const store = tx.objectStore(STORE_NAME)
          store.put({ key, value, timestamp: Date.now() })

          localStorage.setItem(`snapresume_${key}`, JSON.stringify(value))

          // Broadcast to other tabs via localStorage event
          window.dispatchEvent(
            new StorageEvent('storage', {
              key: `snapresume_${key}`,
              newValue: JSON.stringify(value),
              url: window.location.href
            })
          )
        } catch {
          localStorage.setItem(`snapresume_${key}`, JSON.stringify(value))
        }
      },

      async remove(key) {
        try {
          const db = await this._openDB()
          const tx = db.transaction(STORE_NAME, 'readwrite')
          const store = tx.objectStore(STORE_NAME)
          store.delete(key)

          localStorage.removeItem(`snapresume_${key}`)
        } catch {
          localStorage.removeItem(`snapresume_${key}`)
        }
      },

      onChanged(callback) {
        window.addEventListener('storage', (event) => {
          if (event.key && event.key.startsWith('snapresume_')) {
            const key = event.key.replace('snapresume_', '')
            callback({
              [key]: {
                newValue: event.newValue ? JSON.parse(event.newValue) : null,
                oldValue: event.oldValue ? JSON.parse(event.oldValue) : null
              }
            })
          }
        })
      },

      _openDB() {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(DB_NAME, 1)

          request.onupgradeneeded = (e) => {
            const db = e.target.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'key' })
            }
          }

          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })
      }
    }
  }
}

/**
 * Messaging abstraction - handles communication between contexts
 */
const createMessagingAdapter = (environment) => {
  if (environment === 'extension') {
    return {
      send(message) {
        return new Promise((resolve, reject) => {
          // eslint-disable-next-line no-undef
          chrome.runtime.sendMessage(message, (response) => {
            // eslint-disable-next-line no-undef
            if (chrome.runtime.lastError) {
              // eslint-disable-next-line no-undef
              reject(chrome.runtime.lastError)
            } else {
              resolve(response)
            }
          })
        })
      },

      onMessage(callback) {
        // eslint-disable-next-line no-undef
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
          callback(message, sender, sendResponse)
          return true // Keep channel open for async response
        })
      },

      broadcastToTabs(message) {
        // eslint-disable-next-line no-undef
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            try {
              // eslint-disable-next-line no-undef
              chrome.tabs.sendMessage(tab.id, message)
            } catch {
              // Tab might not be accessible
            }
          })
        })
      }
    }
  } else {
    return {
      send(message) {
        // For web app, use custom events or fetch API
        window.dispatchEvent(
          new CustomEvent('resumeManagerMessage', { detail: message })
        )
        return Promise.resolve({ success: true })
      },

      onMessage(callback) {
        window.addEventListener('resumeManagerMessage', (event) => {
          callback(event.detail, null, (response) => {
            window.dispatchEvent(
              new CustomEvent('resumeManagerResponse', { detail: response })
            )
          })
        })
      },

      broadcastToTabs(message) {
        // Broadcast to other tabs via localStorage
        localStorage.setItem(
          'snapresume_broadcast',
          JSON.stringify({ message, timestamp: Date.now() })
        )
      }
    }
  }
}

/**
 * Main Provider Component
 */
export function ResumeManagerProvider({ children }) {
  const [context, setContext] = useState({
    environment: 'webapp',
    storage: null,
    messaging: null,
    isExtension: false,
    isWebApp: true
  })

  useEffect(() => {
    // Detect environment and initialize adapters
    const env = detectEnvironment()
    const storageAdapter = createStorageAdapter(env)
    const messagingAdapter = createMessagingAdapter(env)

    // Set all state together to avoid cascading renders
    setContext({
      environment: env,
      storage: storageAdapter,
      messaging: messagingAdapter,
      isExtension: env === 'extension',
      isWebApp: env !== 'extension'
    })

    // Set up cross-tab/cross-context communication
    if (env === 'extension') {
      // Extension: listen for messages from content script
      messagingAdapter.onMessage((message, sender, sendResponse) => {
        if (message.type === 'RESUME_SYNC_REQUEST') {
          storageAdapter.get('currentResume', null).then((data) => {
            sendResponse({ data })
          })
        }
      })
    } else {
      // Web app: listen for storage changes from other tabs
      storageAdapter.onChanged((changes) => {
        Object.keys(changes).forEach((key) => {
          window.dispatchEvent(
            new CustomEvent('resumeDataUpdated', {
              detail: { key, change: changes[key] }
            })
          )
        })
      })
    }
  }, [])

  return (
    <ResumeManagerContext.Provider value={context}>
      {children}
    </ResumeManagerContext.Provider>
  )
}

export default ResumeManagerContext
