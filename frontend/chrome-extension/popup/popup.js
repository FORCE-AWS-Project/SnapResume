/**
 * Extension Popup - Plain JavaScript Version
 * No JSX, no imports - works directly in extension context
 * 
 * This version loads resume data from chrome.storage.local 
 * and renders a simple UI without requiring transpilation
 */

console.log('SnapResume Extension Popup loaded')

// Initialize popup when DOM is ready
async function initPopup() {
  const root = document.getElementById('root')
  
  if (!root) {
    console.error('Root element not found')
    return
  }

  try {
    // Load resume data from Chrome storage
    const resumeData = await loadResumeData()
    
    // Render the UI
    renderPopupUI(root, resumeData)
  } catch (error) {
    console.error('Error initializing popup:', error)
    root.innerHTML = `
      <div style="
        padding: 20px;
        color: red;
        font-family: system-ui;
        font-size: 14px;
      ">
        <strong>Error loading Resume Manager</strong>
        <p style="margin-top: 10px; font-size: 12px; color: #666;">
          ${error.message}
        </p>
      </div>
    `
  }
}

// Load resume data from Chrome storage
function loadResumeData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['currentResume'], (result) => {
      if (result.currentResume) {
        resolve(result.currentResume)
      } else {
        // Default empty resume structure
        const defaultResume = {
          personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            summary: '',
            photoUrl: ''
          },
          experience: [],
          education: [],
          skills: [],
          certifications: [],
          projects: []
        }
        resolve(defaultResume)
      }
    })
  })
}

// Parse sections from resume data
function parseSections(data) {
  const sections = []

  // Personal Info
  if (data.personalInfo?.fullName) {
    sections.push({
      id: 'personal',
      title: 'Personal Information',
      icon: '??',
      completed: !!data.personalInfo.fullName,
      count: 1
    })
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    sections.push({
      id: 'experience',
      title: 'Work Experience',
      icon: '??',
      completed: true,
      count: data.experience.length
    })
  }

  // Education
  if (data.education && data.education.length > 0) {
    sections.push({
      id: 'education',
      title: 'Education',
      icon: '??',
      completed: true,
      count: data.education.length
    })
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    sections.push({
      id: 'skills',
      title: 'Skills',
      icon: '?',
      completed: true,
      count: data.skills.length
    })
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    sections.push({
      id: 'certifications',
      title: 'Certifications',
      icon: '??',
      completed: true,
      count: data.certifications.length
    })
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    sections.push({
      id: 'projects',
      title: 'Projects',
      icon: '??',
      completed: true,
      count: data.projects.length
    })
  }

  return sections
}

// Render the popup UI
function renderPopupUI(container, resumeData) {
  const sections = parseSections(resumeData)

  const html = `
    <div style="
      display: grid;
      grid-template-columns: 1fr 1px 1.5fr;
      height: 100%;
      overflow: hidden;
      background: white;
    ">
      <!-- Left Panel: Sections List -->
      <div style="
        padding: 16px;
        overflow-y: auto;
        background: white;
        border-right: 1px solid #e8e8e8;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        ">
          <h3 style="
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #333;
          ">
            Sections
          </h3>
          <span style="
            font-size: 12px;
            color: #999;
            background: #f5f5f5;
            padding: 2px 8px;
            border-radius: 3px;
          ">
            ${sections.length}
          </span>
        </div>

        <div id="sections-list" style="
          display: flex;
          flex-direction: column;
          gap: 8px;
        ">
          ${sections.length === 0 ? `
            <div style="
              padding: 16px;
              text-align: center;
              color: #999;
              font-size: 13px;
              background: #fafafa;
              border-radius: 4px;
              border: 1px dashed #e0e0e0;
            ">
              No sections yet. Start by adding personal information.
            </div>
          ` : sections.map((section, idx) => `
            <div style="
              padding: 12px;
              border: 1px solid #e8e8e8;
              border-radius: 4px;
              background: #fafafa;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              gap: 12px;
            " 
            onmouseover="this.style.background='#f5f5f5'; this.style.borderColor='#d0d0d0'"
            onmouseout="this.style.background='#fafafa'; this.style.borderColor='#e8e8e8'"
            >
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                font-size: 16px;
                background: white;
                border-radius: 3px;
                border: 1px solid #e0e0e0;
              ">
                ${section.icon}
              </div>
              
              <div style="flex: 1; min-width: 0;">
                <div style="
                  font-weight: 600;
                  font-size: 13px;
                  color: #333;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                ">
                  ${section.title}
                </div>
                <div style="
                  font-size: 12px;
                  color: #999;
                  margin-top: 2px;
                ">
                  ${section.count ? section.count + ' item' + (section.count !== 1 ? 's' : '') : 'Empty'}
                </div>
              </div>

              ${section.completed ? `
                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 20px;
                  height: 20px;
                  background: #4CAF50;
                  color: white;
                  border-radius: 50%;
                  font-size: 12px;
                  font-weight: bold;
                ">
                  ?
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Divider -->
      <div style="background: #e8e8e8;"></div>

      <!-- Right Panel: Preview -->
      <div style="
        padding: 16px;
        overflow-y: auto;
        background: #f5f5f5;
      ">
        <h3 style="
          margin: 0 0 16px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        ">
          Preview
        </h3>

        <div style="
          background: white;
          padding: 16px;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
          font-size: 12px;
          line-height: 1.6;
          color: #333;
        ">
          <!-- Name & Contact -->
          ${resumeData.personalInfo?.fullName ? `
            <div style="margin-bottom: 12px;">
              <h4 style="
                margin: 0;
                font-size: 14px;
                font-weight: 700;
              ">
                ${resumeData.personalInfo.fullName}
              </h4>
              ${resumeData.personalInfo.email || resumeData.personalInfo.phone ? `
                <p style="margin: 4px 0 0 0; color: #666; font-size: 11px;">
                  ${[resumeData.personalInfo.email, resumeData.personalInfo.phone]
                    .filter(Boolean)
                    .join(' | ')}
                </p>
              ` : ''}
            </div>
          ` : `
            <div style="
              padding: 16px;
              background: #fafafa;
              border: 1px dashed #d0d0d0;
              border-radius: 3px;
              text-align: center;
              color: #999;
              font-size: 12px;
            ">
              ?? No resume data yet
            </div>
          `}

          <!-- Experience -->
          ${resumeData.experience && resumeData.experience.length > 0 ? `
            <div style="margin-top: 12px;">
              <h5 style="
                margin: 0 0 4px 0;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                color: #666;
                letter-spacing: 0.5px;
              ">
                Experience
              </h5>
              <div style="border-left: 2px solid #4CAF50; padding-left: 8px;">
                ${resumeData.experience.slice(0, 2).map(exp => `
                  <div style="margin-bottom: 8px; font-size: 11px;">
                    <strong>${exp.title || 'Position'}</strong>
                    <br>
                    <span style="color: #666;">${exp.company || 'Company'}</span>
                  </div>
                `).join('')}
                ${resumeData.experience.length > 2 ? `
                  <div style="color: #999; font-size: 11px; font-style: italic;">
                    ... and ${resumeData.experience.length - 2} more
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <!-- Education -->
          ${resumeData.education && resumeData.education.length > 0 ? `
            <div style="margin-top: 12px;">
              <h5 style="
                margin: 0 0 4px 0;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                color: #666;
                letter-spacing: 0.5px;
              ">
                Education
              </h5>
              <div style="border-left: 2px solid #2196F3; padding-left: 8px;">
                ${resumeData.education.slice(0, 2).map(edu => `
                  <div style="margin-bottom: 8px; font-size: 11px;">
                    <strong>${edu.degree || 'Degree'}</strong>
                    <br>
                    <span style="color: #666;">${edu.school || 'School'}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Skills -->
          ${resumeData.skills && resumeData.skills.length > 0 ? `
            <div style="margin-top: 12px;">
              <h5 style="
                margin: 0 0 4px 0;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                color: #666;
                letter-spacing: 0.5px;
              ">
                Skills
              </h5>
              <div style="
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
              ">
                ${resumeData.skills.slice(0, 6).map(skill => `
                  <span style="
                    display: inline-block;
                    background: #e8f5e9;
                    color: #2e7d32;
                    padding: 2px 6px;
                    border-radius: 2px;
                    font-size: 10px;
                  ">
                    ${skill}
                  </span>
                `).join('')}
                ${resumeData.skills.length > 6 ? `
                  <span style="
                    display: inline-block;
                    color: #999;
                    font-size: 10px;
                    padding: 2px 6px;
                  ">
                    +${resumeData.skills.length - 6} more
                  </span>
                ` : ''}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Footer Note -->
        <div style="
          margin-top: 12px;
          padding: 8px;
          background: #e3f2fd;
          border: 1px solid #90caf9;
          border-radius: 3px;
          font-size: 11px;
          color: #1565c0;
          text-align: center;
        ">
          ?? Edit resume on SnapResume.com
        </div>
      </div>
    </div>
  `

  container.innerHTML = html
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPopup)
} else {
  initPopup()
}
