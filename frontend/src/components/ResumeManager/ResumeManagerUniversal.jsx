/**
 * Universal Resume Manager Component
 * Works in both web app modal and Chrome extension popup contexts
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Button } from 'antd'
import { useResumeManagerContext } from './context/ResumeManagerContext'
import { useResume } from '../../contexts/ResumeContext'
import SectionsList from './SectionsList'
import PreviewPanel from '../../pages/EditorPage/components/PreviewPanel'
import styles from './ResumeManagerUniversal.module.css'

export function ResumeManagerUniversal({
  visible,
  onClose,
  resumeData: externalResumeData,
  onUpdateData: externalOnUpdateData,
  onSave,
  mode = 'auto', // 'auto', 'modal', 'extension'
  sectionOrder,
  onOrderChange
}) {
  const context = useResumeManagerContext()
  const { template } = useResume()
  const [resumeData, setResumeData] = useState(externalResumeData || {})
  const [selectedSection, setSelectedSection] = useState(null)
  const [zoom, setZoom] = useState(100)
  const [sections, setSections] = useState([])
  const [hasChanges, setHasChanges] = useState(false)

  // Determine if running in extension or web app
  const isExtensionMode = mode === 'extension' || (mode === 'auto' && context?.isExtension)

  // Parse resume data into displayable sections
  const parseResumeSections = useCallback((data) => {
    const availableSections = []

    if (data.personalInfo?.name || data.personalInfo?.fullName) {
      availableSections.push({
        id: 'personal',
        title: 'Personal Information',
        icon: '??',
        completed: !!(data.personalInfo.name || data.personalInfo.fullName),
        count: 1,
        data: data.personalInfo
      })
    }


    if (data.experience && data.experience.length > 0) {
      availableSections.push({
        id: 'experience',
        title: 'Work Experience',
        icon: '💼',
        completed: true,
        count: data.experience.length,
        data: data.experience
      })
    }

    if (data.education && data.education.length > 0) {
      availableSections.push({
        id: 'education',
        title: 'Education',
        icon: '🎓',
        completed: true,
        count: data.education.length,
        data: data.education
      })
    }

    if (data.skills && (data.skills.categories?.length > 0 || Array.isArray(data.skills))) {
      availableSections.push({
        id: 'skills',
        title: 'Skills',
        icon: '⚡',
        completed: true,
        count: Array.isArray(data.skills) ? data.skills.length : data.skills.categories.length,
        data: data.skills
      })
    }

    if (data.certifications && data.certifications.length > 0) {
      availableSections.push({
        id: 'certifications',
        title: 'Certifications',
        icon: '📜',
        completed: true,
        count: data.certifications.length,
        data: data.certifications
      })
    }

    if (data.projects && data.projects.length > 0) {
      availableSections.push({
        id: 'projects',
        title: 'Projects',
        icon: '🚀',
        completed: true,
        count: data.projects.length,
        data: data.projects
      })
    }

    if (data.languages && data.languages.length > 0) {
      availableSections.push({
        id: 'languages',
        title: 'Languages',
        icon: '🗣️',
        completed: true,
        count: data.languages.length,
        data: data.languages
      })
    }

    if (data.volunteering && data.volunteering.length > 0) {
      availableSections.push({
        id: 'volunteering',
        title: 'Volunteering',
        icon: '🤝',
        completed: true,
        count: data.volunteering.length,
        data: data.volunteering
      })
    }

    if (data.publications && data.publications.length > 0) {
      availableSections.push({
        id: 'publications',
        title: 'Publications',
        icon: '📚',
        completed: true,
        count: data.publications.length,
        data: data.publications
      })
    }

    // Sort sections based on sectionOrder if available
    if (sectionOrder && sectionOrder.length > 0) {
      availableSections.sort((a, b) => {
        const indexA = sectionOrder.indexOf(a.id)
        const indexB = sectionOrder.indexOf(b.id)
        // If both are in the order list, sort by index
        if (indexA !== -1 && indexB !== -1) return indexA - indexB
        // If only A is in list, it comes first
        if (indexA !== -1) return -1
        if (indexB !== -1) return 1
        // Keep original order for others
        return 0
      })
    }

    setSections(availableSections)
    if (availableSections.length > 0 && !selectedSection) {
      setSelectedSection(availableSections[0].id)
    }
  }, [selectedSection, sectionOrder])

  // Load resume data from storage on mount
  useEffect(() => {
    if (!context?.storage) return

    const loadData = async () => {
      const savedData = await context.storage.get('currentResume', externalResumeData || {})
      setResumeData(savedData)
      parseResumeSections(savedData)
    }

    loadData()
  }, [context?.storage, externalResumeData, parseResumeSections])

  // Listen for external resume data changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (externalResumeData && JSON.stringify(externalResumeData) !== JSON.stringify(resumeData)) {
      setResumeData(externalResumeData)
      parseResumeSections(externalResumeData)
    }
  }, [externalResumeData, resumeData, parseResumeSections])

  // Listen for updates from other tabs/extension
  useEffect(() => {
    if (!context?.isWebApp) return

    const handleUpdate = (event) => {
      if (event.detail?.key === 'currentResume') {
        const newData = event.detail.change.newValue
        setResumeData(newData)
        parseResumeSections(newData)
      }
    }

    window.addEventListener('resumeDataUpdated', handleUpdate)
    return () => window.removeEventListener('resumeDataUpdated', handleUpdate)
  }, [context?.isWebApp, parseResumeSections])

  // Handle section reordering
  const handleSectionReorder = (newSections) => {
    setSections(newSections)
    setHasChanges(true)
  }

  // Handle section deletion
  const handleDeleteSection = (sectionId) => {
    const updatedSections = sections.filter((s) => s.id !== sectionId)
    setSections(updatedSections)

    if (selectedSection === sectionId) {
      setSelectedSection(updatedSections.length > 0 ? updatedSections[0].id : null)
    }

    const newResumeData = { ...resumeData }
    switch (sectionId) {

      case 'experience':
        newResumeData.experience = []
        break
      case 'education':
        newResumeData.education = []
        break
      case 'skills':
        newResumeData.skills = []
        break
      case 'certifications':
        newResumeData.certifications = []
        break
      case 'projects':
        newResumeData.projects = []
        break
      case 'languages':
        newResumeData.languages = []
        break
      case 'volunteering':
        newResumeData.volunteering = []
        break
      case 'publications':
        newResumeData.publications = []
        break
      default:
        break
    }

    setResumeData(newResumeData)
    setHasChanges(true)
  }

  // Handle zoom changes
  const handleZoom = (value) => {
    setZoom(Math.min(Math.max(value, 50), 200))
  }

  // Handle save
  const handleSaveChanges = async () => {
    if (context?.storage) {
      await context.storage.set('currentResume', resumeData)
    }

    // Broadcast to other tabs if web app
    if (context?.isWebApp && context?.messaging) {
      context.messaging.broadcastToTabs({
        type: 'RESUME_UPDATED',
        data: resumeData
      })
    }

    // Call external handlers
    if (externalOnUpdateData) {
      externalOnUpdateData(resumeData)
    }

    // Update section order on save
    if (onOrderChange && sections.length > 0) {
      onOrderChange(sections.map(s => s.id))
    }

    if (onSave) {
      onSave()
    }

    setHasChanges(false)
    if (onClose) {
      onClose()
    }
  }

  // For extension mode, render without modal wrapper
  if (isExtensionMode) {
    return (
      <div className={styles.extensionContainer}>
        <div className={styles.container}>
          {/* Left Panel */}
          <div className={styles.leftPanel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Sections</h3>
              <span className={styles.sectionCount}>{sections.length} sections</span>
            </div>

            <SectionsList
              sections={sections}
              selectedSection={selectedSection}
              onSectionSelect={setSelectedSection}
              onSectionReorder={handleSectionReorder}
              onSectionDelete={handleDeleteSection}
            />
          </div>

          {/* Right Panel */}
          <div className={styles.rightPanel}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Preview</h3>
              <div className={styles.previewControls}>
                <button
                  className={styles.zoomBtn}
                  onClick={() => handleZoom(zoom - 10)}
                  disabled={zoom <= 50}
                >
                  -
                </button>
                <span className={styles.zoomLevel}>{zoom}%</span>
                <button
                  className={styles.zoomBtn}
                  onClick={() => handleZoom(zoom + 10)}
                  disabled={zoom >= 200}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.previewContainer}>
              <PreviewPanel data={resumeData} template={template} zoom={zoom} />
              <ResumePreviewPanel
                data={resumeData}
                zoom={zoom}
                sectionOrder={sections.map(s => s.id)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.extensionFooter}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSaveChanges}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    )
  }

  // For modal mode (web app), render within modal
  return (
    <Modal
      title="Resume Manager"
      open={visible}
      onCancel={onClose}
      width="90vw"
      style={{ maxWidth: "1600px" }}
      styles={{ body: { padding: 0, height: "80vh" } }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSaveChanges}
          disabled={!hasChanges}
        >
          Save Changes
        </Button>,
      ]}
      className={styles.modal}
    >
      <div className={styles.container}>
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Sections</h3>
            <span className={styles.sectionCount}>{sections.length} sections</span>
          </div>

          <SectionsList
            sections={sections}
            selectedSection={selectedSection}
            onSectionSelect={setSelectedSection}
            onSectionReorder={handleSectionReorder}
            onSectionDelete={handleDeleteSection}
          />
        </div>

        {/* Divider */}
        <div className={styles.panelDivider}></div>

        {/* Right Panel */}
        <div className={styles.rightPanel}>
          {/* Preview top container */}
          <div className={styles.previewContainer}>
            <PreviewPanel data={resumeData} template={template} zoom={zoom} />
          </div>

          {/* Preview header */}
          <div className={styles.previewHeader}>
            <h3 className={styles.previewTitle}>Preview</h3>
            <div className={styles.previewControls}>
              <button
                className={styles.zoomBtn}
                onClick={() => handleZoom(zoom - 10)}
                disabled={zoom <= 50}
              >
                -
              </button>
              <span className={styles.zoomLevel}>{zoom}%</span>
              <button
                className={styles.zoomBtn}
                onClick={() => handleZoom(zoom + 10)}
                disabled={zoom >= 200}
              >
                +
              </button>
            </div>
          </div>

          {/* Resume Preview Panel */}
          <div className={styles.previewContainer}>
            <PreviewPanel
              data={resumeData}
              zoom={zoom}
              sectionOrder={sections.map((s) => s.id)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}