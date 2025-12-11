/**
 * SnapResume Extension Popup (Demo mode)
 * - Removes Cognito dependency
 * - Uses local demo resumes and mock recommendations
 */

const COPY = {
  heading: 'SnapResume Assistant',
  subheading: 'Select a resume, paste JD, get AI recommendations.',
  emptyJD: 'Please paste a job description.',
  emptyResume: 'Please select a resume.'
};

class DemoPopup {
  constructor() {
    this.state = {
      user: { email: 'Dev' },
      resumes: [],
      recommendations: [], // latest AI suggestions
      currentResume: null, // raw resume data (if loaded)
      previewSections: [], // sections visible in preview pane
      isLoading: false
    };
  }

  async init() {
    const root = document.getElementById('root');
    if (!root) {
      console.error('[Popup] Root element not found');
      return;
    }

    try {
      await this.loadUser();
      await this.loadResumes();
      this.renderMainUI(root);
      this.attachMainEventListeners(root);
    } catch (error) {
      console.error('[Popup] Init error:', error);
      this.renderErrorUI(root, error.message || 'Unable to start demo');
    }
  }

  loadUser() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_TOKEN' }, (response) => {
        this.state.user = response?.user || { email: 'demo@snapresume.com' };
        resolve();
      });
    });
  }

  loadResumes() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'GET_RESUMES' }, (response) => {
        if (response?.success) {
          this.state.resumes = response.data || [];
          resolve();
        } else {
          reject(new Error(response?.error || 'Failed to load demo resumes'));
        }
      });
    });
  }

  async loadResumeData(resumeId) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'GET_RESUME_DATA', resumeId }, (response) => {
        if (response?.data) {
          this.state.currentResume = response.data;
          // Seed preview with a simple default layout from resume data
          this.state.previewSections = this.buildPreviewFromResume(response.data);
          resolve(response.data);
        } else if (response?.success === false) {
          reject(new Error(response.error || 'Failed to load resume data'));
        } else {
          resolve(null);
        }
      });
    });
  }

  getRecommendations(resumeId, jobDescription) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'GET_RECOMMENDATIONS', resumeId, jobDescription },
        (response) => {
          if (response?.success === false) {
            reject(new Error(response.error || 'Failed to generate recommendations'));
            return;
          }

          const recs = response?.data?.recommendations || [];
          const sorted = recs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
          resolve(sorted);
        }
      );
    });
  }

  renderMainUI(root) {
    const userEmail = this.state.user?.email || 'Demo User';
    const resumeOptions = this.state.resumes
      .map((r) => `<option value="${r.resumeId || r.id}">${r.title || r.name}</option>`)
      .join('');

    root.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;background:white;overflow:hidden;">
        <div style="
          padding: 12px 16px;
          background: linear-gradient(135deg, #1a2a4a 0%, #0f1a2e 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          border-bottom: 1px solid #0a0f1a;
        ">
          <div>
            <h2 style="margin: 0; font-size: 14px; font-weight: 600;">✨ ${COPY.heading}</h2>
            <p style="margin: 2px 0 0 0; font-size: 11px; opacity: 0.9;">${userEmail}</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; opacity: 0.9;">${COPY.subheading}</p>
          </div>
          <button id="reset-btn" style="
            padding: 6px 12px;
            background: rgba(212, 165, 116, 0.2);
            color: white;
            border: 1px solid rgba(212, 165, 116, 0.4);
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.3s ease;
          "
          onmouseover="this.style.background='rgba(212, 165, 116, 0.3)'"
          onmouseout="this.style.background='rgba(212, 165, 116, 0.2)'"
          >
            Reset demo data
          </button>
        </div>

        <!-- Main content: left (JD + AI), right (Resume Preview) -->
        <div style="flex:1;display:flex;gap:16px;padding:16px;overflow:hidden;background:white;">
          <!-- Left column: Resume selector + JD + AI recommendations -->
          <div style="flex:1;display:flex;flex-direction:column;gap:12px;min-width:0;">
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#1a1a1a;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">
                📄 Select Resume
              </label>
              <select id="resume-selector" style="width:100%;padding:8px;border:1px solid #e0e0e0;border-radius:4px;font-size:13px;background:white;cursor:pointer;color:#333;transition:all 0.3s ease;"
                onmouseover="this.style.borderColor='#d4a574'"
                onmouseout="this.style.borderColor='#e0e0e0'"
              >
                <option value="">-- Choose Resume --</option>
                ${resumeOptions}
              </select>
            </div>

            <div style="flex:1;display:flex;flex-direction:column;min-height:0;">
              <label style="display:block;font-size:12px;font-weight:600;color:#1a1a1a;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">
                📋 Job Description
              </label>
              <textarea 
                id="job-description" 
                placeholder="Paste job description here..."
                style="width:100%;flex:1;min-height:120px;padding:10px;border:1px solid #e0e0e0;border-radius:4px;font-size:12px;font-family:'Courier New',monospace;resize:none;background:#f9f9f9;box-sizing:border-box;transition:all 0.3s ease;"
                onmouseover="this.style.borderColor='#d4a574'; this.style.background='#fff'"
                onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='#f9f9f9'"
              >We're looking for a product-minded leader with experience shipping user-facing features, running experiments, and collaborating with design and engineering.</textarea>
            </div>

            <div id="recommendations-container" style="display:none;">
              <label style="display:block;font-size:12px;font-weight:600;color:#1a1a1a;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
                🤖 AI Recommendations (drag into preview →)
              </label>
              <div id="recommendations-list" style="display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto;"></div>
            </div>
          </div>

          <!-- Right column: Live Resume Preview + drop zone -->
          <div style="flex:1.1;display:flex;flex-direction:column;min-width:0;">
            <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#1a1a1a;">
                  🧾 Resume Preview
                </div>
                <div style="font-size:11px;color:#777;">Drag sections from AI list on the left into this preview.</div>
              </div>
            </div>

            <div id="preview-container" style="flex:1;border:1px solid #e0e0e0;border-radius:6px;padding:12px;overflow-y:auto;background:#fafafa;">
              <div id="preview-list" style="display:flex;flex-direction:column;gap:8px;min-height:80px;">
                <!-- preview cards injected here -->
              </div>
              <div id="preview-empty" style="font-size:12px;color:#999;margin-top:8px;display:none;">
                Drop AI-recommended sections here to customize your resume layout.
              </div>
            </div>
          </div>
        </div>

        <div style="
          padding: 12px 16px;
          border-top: 1px solid #e0e0e0;
          background: #f9f9f9;
          flex-shrink: 0;
          display: flex;
          gap: 8px;
        ">
          <button id="analyze-btn" style="
            flex: 1;
            padding: 10px;
            background: #000;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          "
          onmouseover="this.style.background='#333'"
          onmouseout="this.style.background='#000'"
          >
            🔍 Analyze & Match
          </button>
          <button id="clear-btn" style="
            padding: 10px 12px;
            background: #e0e0e0;
            color: #333;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          "
          onmouseover="this.style.background='#d0d0d0'"
          onmouseout="this.style.background='#e0e0e0'"
          >
            Clear
          </button>
          <button id="export-btn" style="
            padding: 10px 12px;
            background: white;
            color: #1a1a1a;
            border: 1px solid #d4a574;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          "
          onmouseover="this.style.background='#fff7ec'"
          onmouseout="this.style.background='white'"
          >
            ⬇️ Export as PDF
          </button>
        </div>
      </div>
    `;

    this.renderPreviewSections();
  }

  attachMainEventListeners(root) {
    const resetBtn = document.getElementById('reset-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const clearBtn = document.getElementById('clear-btn');
    const exportBtn = document.getElementById('export-btn');
    const jobDescInput = document.getElementById('job-description');
    const resumeSelector = document.getElementById('resume-selector');

    resetBtn.addEventListener('click', async () => {
      await this.resetDemoData();
      await this.loadResumes();
      this.renderMainUI(root);
      this.attachMainEventListeners(root);
    });

    clearBtn.addEventListener('click', () => {
      jobDescInput.value = '';
      document.getElementById('recommendations-container').style.display = 'none';
      this.state.recommendations = [];
      this.state.previewSections = this.buildPreviewFromResume(this.state.currentResume);
      this.renderPreviewSections();
      this.setupDragAndDrop();
    });

    exportBtn.addEventListener('click', () => {
      if (!this.state.previewSections || this.state.previewSections.length === 0) {
        alert('Please drag at least one section into the preview before exporting.');
        return;
      }
      this.exportAsPdf();
    });

    resumeSelector.addEventListener('change', async () => {
      const resumeId = resumeSelector.value;
      if (resumeId) {
        await this.loadResumeData(resumeId);
        this.renderPreviewSections();
        this.setupDragAndDrop();
      }
    });

    analyzeBtn.addEventListener('click', async () => {
      const resumeId = resumeSelector.value;
      const jobDescription = jobDescInput.value.trim();

      if (!resumeId) {
        alert(COPY.emptyResume);
        return;
      }

      if (!jobDescription) {
        alert(COPY.emptyJD);
        return;
      }

      try {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = '⏳ Analyzing...';

        const recommendations = await this.getRecommendations(resumeId, jobDescription);
        this.displayRecommendations(recommendations);
      } catch (error) {
        console.error('[Popup] Error:', error);
        alert('Error: ' + error.message);
      } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🔍 Analyze & Match';
      }
    });
  }

  displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations-container');
    const list = document.getElementById('recommendations-list');

    if (!recommendations || recommendations.length === 0) {
      container.style.display = 'none';
      alert('No matching sections found.');
      return;
    }

    container.style.display = 'block';
    this.state.recommendations = recommendations;

    const html = recommendations.map((rec, idx) => `
      <div class="rec-item" data-index="${idx}" draggable="true" style="
        padding: 10px;
        background: #f9f9f9;
        border: 1px solid #e0e0e0;
        border-left: 3px solid #d4a574;
        border-radius: 4px;
        cursor: grab;
        transition: all 0.2s ease;
        font-size: 12px;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <div style="font-weight:600;color:#1a1a1a;">
            #${idx + 1} ${rec.section?.title || rec.sectionType || 'Section'}
          </div>
          <div style="background:#d4a574;color:white;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;">
            ${Math.round(rec.matchScore || 0)}%
          </div>
        </div>
        <div style="color:#666;line-height:1.4;">
          ${rec.reasoning || 'Relevant to this job'}
        </div>
      </div>
    `).join('');

    list.innerHTML = html;
    this.setupDragAndDrop();
  }

  /**
   * Build a simple preview model from raw resume data
   */
  buildPreviewFromResume(resumeData) {
    if (!resumeData) return [];

    const sections = [];

    // Personal Info
    if (resumeData.personalInfo?.fullName || resumeData.personalInfo?.email) {
      sections.push({
        title: 'Personal Info',
        subtitle: resumeData.personalInfo.fullName || '',
        body: [
          resumeData.personalInfo.email,
          resumeData.personalInfo.phone,
          resumeData.personalInfo.location
        ]
          .filter(Boolean)
          .join(' • ')
      });
    }

    // Experience
    if (Array.isArray(resumeData.experience) && resumeData.experience.length) {
      resumeData.experience.forEach((exp) => {
        sections.push({
          title: 'Experience',
          subtitle: `${exp.jobTitle || ''} @ ${exp.company || ''}`.trim(),
          body: (exp.description || exp.achievements || [])
            .slice(0, 3)
            .map((b) => (typeof b === 'string' ? b : b?.text))
            .filter(Boolean)
            .join(' • ')
        });
      });
    }

    // Education
    if (Array.isArray(resumeData.education) && resumeData.education.length) {
      resumeData.education.forEach((edu) => {
        sections.push({
          title: 'Education',
          subtitle: edu.degree || edu.major || edu.institution || '',
          body: [edu.institution, edu.graduationYear].filter(Boolean).join(' • ')
        });
      });
    }

    // Skills
    if (resumeData.skills?.categories?.length) {
      resumeData.skills.categories.forEach((cat) => {
        sections.push({
          title: 'Skills',
          subtitle: cat.name,
          body: (cat.skills || []).slice(0, 8).join(', ')
        });
      });
    }

    // Projects
    if (Array.isArray(resumeData.projects) && resumeData.projects.length) {
      resumeData.projects.forEach((proj) => {
        sections.push({
          title: 'Project',
          subtitle: proj.title || proj.name || '',
          body: proj.description || ''
        });
      });
    }

    // Certifications
    if (Array.isArray(resumeData.certifications) && resumeData.certifications.length) {
      resumeData.certifications.forEach((cert) => {
        sections.push({
          title: 'Certification',
          subtitle: cert.name || '',
          body: cert.issuer || ''
        });
      });
    }

    return sections;
  }

  /**
   * Render preview cards from state.previewSections
   */
  renderPreviewSections() {
    const list = document.getElementById('preview-list');
    const empty = document.getElementById('preview-empty');
    if (!list || !empty) return;

    const sections = this.state.previewSections || [];
    if (!sections.length) {
      list.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    list.innerHTML = sections
      .map(
        (sec, idx) => `
      <div class="preview-item" data-index="${idx}" style="
        padding: 10px 12px;
        background:white;
        border-radius:4px;
        border:1px solid #e0e0e0;
        box-shadow:0 1px 2px rgba(0,0,0,0.03);
        font-size:12px;
        position: relative;
      ">
        <button class="preview-delete" data-index="${idx}" style="
          position:absolute;right:8px;top:8px;
          border:none;background:transparent;cursor:pointer;
          color:#999;font-size:12px;
        " title="Remove section">✕</button>
        <div style="font-weight:600;margin-bottom:4px;color:#1a1a1a;">${sec.title}</div>
        ${sec.subtitle ? `<div style="font-size:11px;color:#555;margin-bottom:2px;">${sec.subtitle}</div>` : ''}
        ${sec.body ? `<div style="font-size:11px;color:#777;">${sec.body}</div>` : ''}
      </div>
    `
      )
      .join('');

    this.setupDragAndDrop();
    this.setupDeletePreview();
  }

  /**
   * Wire up drag & drop from AI recommendations into preview pane
   * (append-only for simplicity)
   */
  setupDragAndDrop() {
    const recItems = document.querySelectorAll('.rec-item');
    const previewList = document.getElementById('preview-list');
    if (!previewList) return;

    recItems.forEach((el) => {
      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', el.getAttribute('data-index') || '');
        e.dataTransfer.effectAllowed = 'copy';
      });
    });

    previewList.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    previewList.addEventListener('drop', (e) => {
      e.preventDefault();
      const idxStr = e.dataTransfer.getData('text/plain');
      const idx = parseInt(idxStr, 10);
      if (Number.isNaN(idx) || !this.state.recommendations[idx]) return;

      const rec = this.state.recommendations[idx];
      const newSection = {
        title: rec.section?.title || rec.sectionType || 'Section',
        subtitle: `Match score: ${Math.round(rec.matchScore || 0)}%`,
        body: rec.reasoning || ''
      };

      const existing = (this.state.previewSections || []).some(
        (s) => s.title === newSection.title && s.subtitle === newSection.subtitle && s.body === newSection.body
      );
      if (existing) {
        return;
      }

      this.state.previewSections = [...(this.state.previewSections || []), newSection];
      this.renderPreviewSections();
    });
  }

  /**
   * Allow removing preview sections
   */
  setupDeletePreview() {
    const deleteButtons = document.querySelectorAll('.preview-delete');
    deleteButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (Number.isNaN(idx)) return;
        this.state.previewSections = (this.state.previewSections || []).filter((_, i) => i !== idx);
        this.renderPreviewSections();
      });
    });
  }

  resetDemoData() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'LOGOUT_REQUEST' }, () => resolve());
    });
  }

  renderErrorUI(root, message) {
    root.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 24px;
        background: #fff2f0;
        justify-content: center;
        align-items: center;
        text-align: center;
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <h2 style="color: #d4380d; margin: 0 0 8px 0; font-size: 16px;">Error</h2>
        <p style="color: #666; margin: 0 0 16px 0; font-size: 13px; line-height: 1.5;">${message}</p>
        <button id="retry-btn" style="
          padding: 10px 20px;
          background: #d4380d;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        "
        onmouseover="this.style.background='#b71c1c'"
        onmouseout="this.style.background='#d4380d'"
        >
          Retry
        </button>
      </div>
    `;

    document.getElementById('retry-btn').addEventListener('click', () => {
      this.init();
    });
  }

  /**
   * Naive PDF export: opens a new window with preview HTML and triggers print()
   */
  exportAsPdf() {
    const sections = this.state.previewSections || [];
    const userEmail = this.state.user?.email || 'demo@snapresume.com';

    const contentHtml = sections
      .map(
        (sec) => `
      <section style="margin-bottom:16px;">
        <h2 style="margin:0 0 4px 0;font-size:16px;">${sec.title}</h2>
        ${sec.subtitle ? `<div style="font-size:12px;color:#555;margin-bottom:2px;">${sec.subtitle}</div>` : ''}
        ${sec.body ? `<div style="font-size:12px;color:#333;line-height:1.5;">${sec.body}</div>` : ''}
      </section>
    `
      )
      .join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>SnapResume Export</title>
          <style>
            @page { margin: 24mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #111827;
              font-size: 13px;
              line-height: 1.5;
            }
            h1 {
              font-size: 20px;
              margin: 0 0 16px 0;
            }
            h2 {
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <h1>SnapResume Preview – ${userEmail}</h1>
          ${contentHtml}
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (!win) {
      alert('Popup blocked. Please allow popups for this extension to export.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    // Give the browser a moment to render before printing
    setTimeout(() => {
      win.print();
    }, 300);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DemoPopup().init();
  });
} else {
  new DemoPopup().init();
}

