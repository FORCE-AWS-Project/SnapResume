import { useState, useEffect } from 'react'
import { Modal, Row, Col, Divider, Button, Space, Empty, Tooltip, Badge } from 'antd'
import { 
  DragOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons'
import SectionsList from './SectionsList'
import ResumePreviewPanel from './ResumePreviewPanel'
import styles from './ResumeManagerModal.module.css'

export default function ResumeManagerModal({ 
  visible, 
  onClose, 
  resumeData, 
  onUpdateData,
  onSave 
}) {
  const [sections, setSections] = useState([])
  const [zoom, setZoom] = useState(100)
  const [selectedSection, setSelectedSection] = useState(null)

  useEffect(() => {
    if (resumeData) {
      const availableSections = []
      
      if (resumeData.personalInfo?.fullName) {
        availableSections.push({
          id: 'personal',
          title: 'Personal Information',
          icon: '??',
          completed: !!resumeData.personalInfo.fullName,
          data: resumeData.personalInfo
        })
      }

      if (resumeData.experience && resumeData.experience.length > 0) {
        availableSections.push({
          id: 'experience',
          title: 'Work Experience',
          icon: '??',
          completed: true,
          count: resumeData.experience.length,
          data: resumeData.experience
        })
      }

      if (resumeData.education && resumeData.education.length > 0) {
        availableSections.push({
          id: 'education',
          title: 'Education',
          icon: '??',
          completed: true,
          count: resumeData.education.length,
          data: resumeData.education
        })
      }

      if (resumeData.skills && resumeData.skills.categories && resumeData.skills.categories.length > 0) {
        availableSections.push({
          id: 'skills',
          title: 'Skills',
          icon: '??',
          completed: true,
          count: resumeData.skills.categories.length,
          data: resumeData.skills
        })
      }

      if (resumeData.certifications && resumeData.certifications.length > 0) {
        availableSections.push({
          id: 'certifications',
          title: 'Certifications',
          icon: '??',
          completed: true,
          count: resumeData.certifications.length,
          data: resumeData.certifications
        })
      }

      if (resumeData.projects && resumeData.projects.length > 0) {
        availableSections.push({
          id: 'projects',
          title: 'Projects',
          icon: '??',
          completed: true,
          count: resumeData.projects.length,
          data: resumeData.projects
        })
      }

      setSections(availableSections)
      if (availableSections.length > 0 && !selectedSection) {
        setSelectedSection(availableSections[0].id)
      }
    }
  }, [resumeData, visible])

  const handleSectionReorder = (newSections) => {
    setSections(newSections)
  }

  const handleDeleteSection = (sectionId) => {
    const updatedSections = sections.filter(s => s.id !== sectionId)
    setSections(updatedSections)
    
    if (selectedSection === sectionId) {
      setSelectedSection(updatedSections.length > 0 ? updatedSections[0].id : null)
    }

    const newResumeData = { ...resumeData }
    switch (sectionId) {
      case 'personal':
        newResumeData.personalInfo = {}
        break
      case 'experience':
        newResumeData.experience = []
        break
      case 'education':
        newResumeData.education = []
        break
      case 'skills':
        newResumeData.skills = { categories: [] }
        break
      case 'certifications':
        newResumeData.certifications = []
        break
      case 'projects':
        newResumeData.projects = []
        break
      default:
        break
    }
    onUpdateData(newResumeData)
  }

  const handleZoom = (value) => {
    setZoom(Math.min(Math.max(value, 50), 200))
  }

  return (
    <Modal
      title={
        <div className={styles.modalHeader}>
          <span>Resume Manager</span>
          <Badge count={sections.length} className={styles.badge} />
        </div>
      }
      visible={visible}
      onCancel={onClose}
      width="90vw"
      style={{ maxWidth: '1600px' }}
      styles={{ body: { padding: 0, height: '80vh' } }}
      footer={null}
      className={styles.modal}
    >
      <div className={styles.container}>
        {/* Left Panel - Sections List */}
        <div className={styles.leftPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Sections</h3>
            <span className={styles.sectionCount}>{sections.length} sections</span>
          </div>

          <Divider className={styles.divider} />

          {sections.length > 0 ? (
            <SectionsList
              sections={sections}
              selectedSection={selectedSection}
              onSectionSelect={setSelectedSection}
              onSectionReorder={handleSectionReorder}
              onSectionDelete={handleDeleteSection}
            />
          ) : (
            <Empty 
              description="No sections yet" 
              style={{ marginTop: '2rem' }}
            />
          )}
        </div>

        {/* Divider */}
        <div className={styles.panelDivider}></div>

        {/* Right Panel - Preview */}
        <div className={styles.rightPanel}>
          <div className={styles.previewHeader}>
            <h3 className={styles.previewTitle}>Preview</h3>
            <div className={styles.previewControls}>
              <Tooltip title="Zoom Out">
                <Button
                  type="text"
                  icon={<ZoomOutOutlined />}
                  onClick={() => handleZoom(zoom - 10)}
                  disabled={zoom <= 50}
                  className={styles.controlBtn}
                />
              </Tooltip>
              <span className={styles.zoomLevel}>{zoom}%</span>
              <Tooltip title="Zoom In">
                <Button
                  type="text"
                  icon={<ZoomInOutlined />}
                  onClick={() => handleZoom(zoom + 10)}
                  disabled={zoom >= 200}
                  className={styles.controlBtn}
                />
              </Tooltip>
              <Divider type="vertical" />
              <Tooltip title="Print">
                <Button
                  type="text"
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                  className={styles.controlBtn}
                />
              </Tooltip>
            </div>
          </div>

          <Divider className={styles.divider} />

          <div className={styles.previewContainer}>
            {sections.length > 0 ? (
              <ResumePreviewPanel 
                data={resumeData}
                zoom={zoom}
              />
            ) : (
              <Empty description="Start adding sections to preview" />
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className={styles.footer}>
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="primary" 
            onClick={() => {
              onUpdateData(resumeData)
              onSave && onSave()
              onClose()
            }}
          >
            Save Changes
          </Button>
        </Space>
      </div>
    </Modal>
  )
}
