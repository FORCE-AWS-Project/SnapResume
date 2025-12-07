# Chrome Extension Build & Deployment Guide

## ?? Development Setup

### 1. Load Extension in Chrome (Development)

```bash
# Navigate to chrome://extensions/
# Enable "Developer mode" (toggle in top right)
# Click "Load unpacked"
# Select the chrome-extension/ folder from this project
```

**Result**: Extension appears in your toolbar with a red icon

### 2. Testing the Extension

```javascript
// Open DevTools for the extension:
// 1. Right-click extension icon
// 2. Click "Inspect popup"
// 3. DevTools opens for popup context

// For background service worker:
// 1. Go to chrome://extensions/
// 2. Find SnapResume Manager
// 3. Click "Inspect views: service worker"
```

### 3. Reload Changes

```javascript
// After code changes:
// 1. Go to chrome://extensions/
// 2. Find SnapResume Manager
// 3. Click reload icon (circular arrow)
// 4. Changes take effect immediately
```

---

## ?? Project Structure

```
chrome-extension/
??? manifest.json              # Configuration
??? popup/
?   ??? popup.html            # 920x750px interface
?   ??? popup.js              # React app entry point
??? background/
?   ??? background.js         # Persistent service worker
??? scripts/
?   ??? content.js            # Runs on web pages
??? images/
    ??? icon-16.png           # Toolbar icon
    ??? icon-48.png           # List icon
    ??? icon-128.png          # Web store icon
```

---

## ?? Configuration Files

### manifest.json
```json
{
  "manifest_version": 3,
  "name": "SnapResume Manager",
  "version": "1.0.0",
  "permissions": ["storage", "tabs", "scripting"],
  "host_permissions": ["https://snapresume.com/*"],
  "action": {
    "default_popup": "popup/popup.html",
    "default_title": "Open Resume Manager"
  }
}
```

**Key Fields:**
- `manifest_version`: Must be 3 (latest)
- `permissions`: What the extension can do
- `host_permissions`: Which websites it runs on
- `action`: Popup UI configuration

---

## ?? Creating Extension Icons

### Icon Requirements

```
16x16 px   - Favicon size (small)
48x48 px   - List view
128x128 px - Web store and installation dialog
```

### Where to Put Icons

```
chrome-extension/
??? images/
    ??? icon-16.png
    ??? icon-48.png
    ??? icon-128.png
```

### Icon Format
- **Format**: PNG with transparency recommended
- **Colors**: Should match your brand (use #d4a574 for SnapResume gold)
- **Design**: Simple, recognizable at small sizes

---

## ?? Data Flow in Extension

```
popup.js (User Interface)
    ?
chrome.storage.local (Data Storage)
    ?
background.js (Message Router)
    ?
content.js (Page Bridge)
    ?
Web App (__EXTENSION_BRIDGE__)
```

---

## ?? Message Passing

### Extension ? Web App
```javascript
// In popup.js:
chrome.tabs.sendMessage(tabId, {
  type: 'RESUME_UPDATED',
  data: resumeData
})

// Received in content.js:
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'RESUME_UPDATED') {
    // Forward to web app
    window.postMessage({
      type: 'RESUME_UPDATED_FROM_EXTENSION',
      data: message.data
    })
  }
})
```

### Web App ? Extension
```javascript
// In web app:
window.__EXTENSION_BRIDGE__.sendData(resumeData)

// Received in content.js:
window.addEventListener('message', (event) => {
  if (event.data.type === 'RESUME_UPDATED_FROM_PAGE') {
    // Forward to extension
    chrome.runtime.sendMessage({
      type: 'SYNC_FROM_WEB',
      data: event.data.data
    })
  }
})
```

---

## ?? Debugging

### Enable Logging
```javascript
// Add to background.js:
const debug = true

if (debug) {
  console.log('Message received:', message)
}
```

### View Logs

**For Popup:**
```
1. Right-click extension icon
2. "Inspect popup"
3. DevTools opens
4. Console shows logs from popup.js
```

**For Background:**
```
1. chrome://extensions/
2. Find SnapResume Manager
3. "Inspect views: service worker"
4. Console shows logs from background.js
```

**For Content Script:**
```
1. Open SnapResume.com in tab
2. DevTools (F12)
3. Console shows logs from content.js
```

---

## ? Pre-Release Checklist

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] Code is formatted
- [ ] Comments added for complex logic
- [ ] No sensitive data in logs

### Functionality
- [ ] Popup opens without errors
- [ ] Can save/load data
- [ ] Messages sync properly
- [ ] Works across multiple tabs
- [ ] Works with web app

### UI/UX
- [ ] Popup size is appropriate (920x750)
- [ ] No layout issues
- [ ] Buttons are clickable
- [ ] Scrolling works smoothly
- [ ] Icons display correctly

### Security
- [ ] No insecure origins (use HTTPS)
- [ ] No data sent externally
- [ ] Proper permission scoping
- [ ] User data handled securely

### Performance
- [ ] Popup loads quickly (< 2s)
- [ ] No memory leaks
- [ ] Service worker efficient
- [ ] Content script minimal

---

## ?? Publishing to Chrome Web Store

### Step 1: Developer Account
```
1. Go to https://chrome.google.com/webstore/developer/dashboard
2. Create Google account (if needed)
3. Pay $5 registration fee
4. Accept terms
```

### Step 2: Prepare Submission
```
1. Create 128x128px icon (PNG)
2. Create promotional image 1280x800px
3. Create small tile 440x280px
4. Write description (max 200 chars)
5. Create detailed description
6. Gather screenshots
```

### Step 3: Package Extension
```bash
# Create production build
# All files should be optimized
# Remove development comments
# Set version number: 1.0.0
```

### Step 4: Upload to Web Store
```
1. Go to developer dashboard
2. Click "New Item"
3. Upload zip file with all extension files
4. Fill in store listing details
5. Upload promotional images
6. Click "Submit for review"
```

### Step 5: Wait for Review
```
Typical timeline:
- 0-24h: Initial scan
- 1-3 days: Manual review
- Status updates via email
- If rejected: Fix issues and resubmit
- If approved: Live immediately!
```

---

## ?? Version Management

### Updating Existing Extension

```json
// In manifest.json, increment version:
"version": "1.0.0" ? "1.0.1"
```

**Types of updates:**
- **Major**: 1.0.0 ? 2.0.0 (big changes)
- **Minor**: 1.0.0 ? 1.1.0 (new features)
- **Patch**: 1.0.0 ? 1.0.1 (bug fixes)

### Automatic Updates
```
Users with published extensions get auto-updates
No action needed from users
Users can disable auto-updates in settings
```

---

## ?? Analytics & Monitoring

### Track Users
```
Install the extension in:
1. Development (local)
2. Testing (QA team)
3. Beta (limited users)
4. Production (all users)

Monitor feedback at each stage
```

### Collect Feedback
```
- User ratings in Web Store
- Bug reports from users
- Feature requests
- Usage analytics
```

---

## ?? Security Best Practices

### Never Store
```javascript
? Passwords in plaintext
? API keys in code
? User tokens in localStorage
? Sensitive data in logs
```

### Always Protect
```javascript
? Use chrome.storage.local (encrypted)
? HTTPS for all communications
? Validate all messages
? Sanitize user input
? Limit permissions
```

---

## ?? Key Takeaways

### For Development
1. Use `Load unpacked` in Developer Mode
2. Reload after code changes
3. Use console logs for debugging
4. Test across multiple tabs

### For Production
1. Create attractive icons
2. Write clear descriptions
3. Test thoroughly before publishing
4. Monitor user feedback
5. Plan update strategy

### For Maintenance
1. Keep dependencies updated
2. Monitor Chrome API changes
3. Respond to user feedback
4. Plan new features
5. Retire old versions eventually

---

## ?? Chrome Web Store Links

- **Developer Dashboard**: https://chrome.google.com/webstore/developer/dashboard
- **Extension FAQ**: https://support.google.com/chrome_webstore/
- **API Reference**: https://developer.chrome.com/docs/extensions/

---

## ? Sample manifest.json for Production

```json
{
  "manifest_version": 3,
  "name": "SnapResume Manager",
  "version": "1.0.0",
  "description": "Manage your resume sections with drag-and-drop organization, AI-powered suggestions, and cross-device sync. Works on any website!",
  "permissions": [
    "storage",
    "tabs",
    "scripting",
    "alarms"
  ],
  "host_permissions": [
    "https://snapresume.com/*",
    "http://localhost:*/*"
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_title": "Open SnapResume Manager",
    "default_icon": {
      "16": "images/icon-16.png",
      "48": "images/icon-48.png",
      "128": "images/icon-128.png"
    }
  },
  "background": {
    "service_worker": "background/background.js"
  },
  "content_scripts": [
    {
      "matches": [
        "https://snapresume.com/*",
        "http://localhost:*/*"
      ],
      "js": ["scripts/content.js"],
      "run_at": "document_start"
    }
  ],
  "icons": {
    "16": "images/icon-16.png",
    "48": "images/icon-48.png",
    "128": "images/icon-128.png"
  }
}
```

---

**Ready to deploy? Start with development, test thoroughly, then submit to Web Store! ??**
