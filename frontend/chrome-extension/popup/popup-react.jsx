/**
 * Extension Popup - React UI Component
 * Handles authentication and resume data display
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './popup.css';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'snapresume_access_token',
  ID_TOKEN: 'snapresume_id_token',
  USER: 'snapresume_user',
  RESUME_DATA: 'snapresume_resume_data'
};

const MESSAGE_TYPES = {
  GET_TOKEN: 'GET_TOKEN',
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGOUT_REQUEST: 'LOGOUT_REQUEST',
  GET_RESUME_DATA: 'GET_RESUME_DATA',
  SAVE_RESUME_DATA: 'SAVE_RESUME_DATA'
};

// Popup Component
function SnapResumePopup() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userResumes, setUserResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStep, setCurrentStep] = useState('auth'); // 'auth', 'resumeSelection', 'editor'

  // Check authentication and load data on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const result = await sendMessageToBackground({
        type: MESSAGE_TYPES.GET_TOKEN
      });

      if (result && result.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(result.user);
        setCurrentStep('resumeSelection');
        
        // Load user's resumes from backend
        try {
          const resumesResult = await sendMessageToBackground({
            type: 'GET_RESUMES',
            token: result.accessToken
          });
          
          if (resumesResult && resumesResult.data) {
            setUserResumes(resumesResult.data);
          }
        } catch (error) {
          console.error('Error loading resumes:', error);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentStep('auth');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setCurrentStep('auth');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
    setCurrentStep('editor');
    
    // Load resume data from backend
    try {
      sendMessageToBackground({
        type: 'GET_RESUME_DATA',
        resumeId: resume.id,
        token: result.accessToken
      }).then(result => {
        if (result && result.data) {
          setResumeData(result.data);
        }
      });
    } catch (error) {
      console.error('Error loading resume:', error);
    }
  };

  const handleCreateNewResume = () => {
    // Open web app for creating new resume
    chrome.tabs.create({ url: 'http://localhost:5173/templates' });
  };

  const handleLogout = async () => {
    try {
      await sendMessageToBackground({
        type: MESSAGE_TYPES.LOGOUT_REQUEST
      });
      setIsAuthenticated(false);
      setUser(null);
      setUserResumes([]);
      setSelectedResume(null);
      setResumeData(null);
      setCurrentStep('auth');
      setActiveTab('overview');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleOpenWebApp = () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
  };

  const handleBackToResumes = () => {
    setSelectedResume(null);
    setResumeData(null);
    setCurrentStep('resumeSelection');
    setActiveTab('overview');
  };

  const sendMessageToBackground = (message) => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Step 1: Authentication Required
  if (currentStep === 'auth') {
    return (
      <div className="popup-container">
        <div className="auth-section">
          <div className="auth-header">
            <h2>SnapResume Manager</h2>
            <p>Please log in to manage your resume</p>
          </div>

          <div className="auth-actions">
            <button 
              className="btn btn-primary"
              onClick={handleOpenWebApp}
            >
              Open SnapResume.com
            </button>
            <p className="auth-note">
              ?? Sign in on the website, then return to this extension
            </p>
          </div>

          <div className="auth-info">
            <h4>How it works:</h4>
            <ol>
              <li>Visit SnapResume.com in your browser</li>
              <li>Sign in with your account</li>
              <li>Return to this extension popup</li>
              <li>Your resume data will be automatically synced</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Resume Selection
  if (currentStep === 'resumeSelection') {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <div className="user-info">
            <span className="user-icon">??</span>
            <span className="user-email">{user?.name || user?.email || 'User'}</span>
          </div>
          <button 
            className="btn btn-logout"
            onClick={handleLogout}
            title="Logout"
          >
            ?
          </button>
        </div>

        <div className="resume-selection">
          <h3>Select a Resume to Edit</h3>
          
          {userResumes && userResumes.length > 0 ? (
            <div className="resumes-list">
              {userResumes.map((resume) => (
                <div 
                  key={resume.id}
                  className="resume-item"
                  onClick={() => handleSelectResume(resume)}
                >
                  <div className="resume-item-header">
                    <span className="resume-name">{resume.name}</span>
                    <span className="resume-template">{resume.templateName}</span>
                  </div>
                  <p className="resume-date">
                    Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No resumes created yet</p>
            </div>
          )}

          <button 
            className="btn btn-primary"
            onClick={handleCreateNewResume}
          >
            + Create New Resume
          </button>
        </div>

        <div className="popup-footer">
          <a href="http://localhost:5173/templates" target="_blank" rel="noopener noreferrer" className="link">
            Go to Full Editor ?
          </a>
        </div>
      </div>
    );
  }

  // Step 3: Editor / Resume Editing
  if (currentStep === 'editor' && selectedResume) {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <div className="user-info">
            <button 
              className="btn btn-back"
              onClick={handleBackToResumes}
              title="Back to Resume List"
            >
              ? Back
            </button>
            <span className="user-email">{selectedResume.name}</span>
          </div>
          <button 
            className="btn btn-logout"
            onClick={handleLogout}
            title="Logout"
          >
            ?
          </button>
        </div>

        {/* Tab navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'sections' ? 'active' : ''}`}
            onClick={() => setActiveTab('sections')}
          >
            Sections
          </button>
        </div>

        {/* Content */}
        <div className="popup-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {resumeData ? (
                <>
                  <div className="resume-preview">
                    {resumeData.personalInfo?.fullName && (
                      <div className="personal-info">
                        <h3>{resumeData.personalInfo.fullName}</h3>
                        {resumeData.personalInfo.email && (
                          <p className="email">{resumeData.personalInfo.email}</p>
                        )}
                        {resumeData.personalInfo.phone && (
                          <p className="phone">{resumeData.personalInfo.phone}</p>
                        )}
                        {resumeData.personalInfo.location && (
                          <p className="location">{resumeData.personalInfo.location}</p>
                        )}
                      </div>
                    )}

                    {resumeData.experience && resumeData.experience.length > 0 && (
                      <div className="section">
                        <h4>Experience</h4>
                        <ul className="section-list">
                          {resumeData.experience.slice(0, 2).map((exp, idx) => (
                            <li key={idx}>
                              <strong>{exp.jobTitle || 'Position'}</strong>
                              <span className="secondary">at {exp.company || 'Company'}</span>
                            </li>
                          ))}
                          {resumeData.experience.length > 2 && (
                            <li className="more-item">+{resumeData.experience.length - 2} more</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {resumeData.education && resumeData.education.length > 0 && (
                      <div className="section">
                        <h4>Education</h4>
                        <ul className="section-list">
                          {resumeData.education.slice(0, 2).map((edu, idx) => (
                            <li key={idx}>
                              <strong>{edu.degree || 'Degree'}</strong>
                              <span className="secondary">{edu.institution || 'School'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {resumeData.skills?.categories && resumeData.skills.categories.length > 0 && (
                      <div className="section">
                        <h4>Skills</h4>
                        <div className="skills-list">
                          {resumeData.skills.categories.slice(0, 2).map((cat, idx) => (
                            <div key={idx} className="skill-category">
                              <strong>{cat.name}</strong>
                              <div className="skill-tags">
                                {cat.skills?.slice(0, 4).map((skill, sidx) => (
                                  <span key={sidx} className="skill-tag">{skill}</span>
                                ))}
                                {cat.skills?.length > 4 && (
                                  <span className="skill-tag more">+{cat.skills.length - 4}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>Loading resume data...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="sections-tab">
              {resumeData ? (
                <div className="sections-grid">
                  {getSectionsList(resumeData).map((section, idx) => (
                    <div key={idx} className="section-card">
                      <span className="section-icon">{section.icon}</span>
                      <h5>{section.title}</h5>
                      <p className="section-count">
                        {section.count > 0 ? `${section.count} item${section.count !== 1 ? 's' : ''}` : 'Empty'}
                      </p>
                      {section.completed && <span className="badge-completed">?</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Loading sections...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="popup-footer">
          <a href="http://localhost:5173/editor" target="_blank" rel="noopener noreferrer" className="link">
            Open Full Editor ?
          </a>
        </div>
      </div>
    );
  }
}

// Helper function to get sections list
function getSectionsList(resumeData) {
  const sections = [];

  if (resumeData.personalInfo?.fullName) {
    sections.push({
      icon: '??',
      title: 'Personal Info',
      count: 1,
      completed: true
    });
  }

  if (resumeData.experience?.length > 0) {
    sections.push({
      icon: '??',
      title: 'Experience',
      count: resumeData.experience.length,
      completed: true
    });
  }

  if (resumeData.education?.length > 0) {
    sections.push({
      icon: '??',
      title: 'Education',
      count: resumeData.education.length,
      completed: true
    });
  }

  if (resumeData.skills?.categories?.length > 0) {
    sections.push({
      icon: '??',
      title: 'Skills',
      count: resumeData.skills.categories.length,
      completed: true
    });
  }

  if (resumeData.certifications?.length > 0) {
    sections.push({
      icon: '??',
      title: 'Certifications',
      count: resumeData.certifications.length,
      completed: true
    });
  }

  if (resumeData.projects?.length > 0) {
    sections.push({
      icon: '??',
      title: 'Projects',
      count: resumeData.projects.length,
      completed: true
    });
  }

  return sections;
}

// Render React app
const root = document.getElementById('root');
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <SnapResumePopup />
  </React.StrictMode>
);

console.log('SnapResume Extension Popup Loaded');
