import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, Button, Space, Dropdown, InputNumber, Tooltip, message, Spin } from 'antd'
import {
  SaveOutlined,
  SettingOutlined,
  BackwardOutlined,
  PrinterOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'
import PreviewPanel from './components/PreviewPanel'
import { ResumeManagerUniversal } from '../../components/ResumeManager/ResumeManagerUniversal'
import { useResume } from '../../contexts/ResumeContext'
import TemplateSelectionModal from '../../components/TemplateSelectionModal/TemplateSelectionModal'
import SectionPanel from '../../components/SectionPanel/SectionPanel'
import DynamicSectionForm from '../../components/DynamicSectionForm/DynamicSectionForm'
import resumeService from '../../services/resumeService'
import sectionService from '../../services/sectionService'
import { ApiError } from '../../services/api'
import toast from 'react-hot-toast'
import styles from './EditorPage.module.css'

const { Header, Content } = Layout

function EditorPageContent() {
  const navigate = useNavigate()
  const [zoom, setZoom] = useState(100)
  const [resumeName, setResumeName] = useState('My Resume')
  const [managerModalVisible, setManagerModalVisible] = useState(false)
  const [templateModalVisible, setTemplateModalVisible] = useState(false)

  const {
    template,
    resumeData,
    loading,
    saving,
    setTemplate,
    setSaving
  } = useResume()

  useEffect(() => {
    // If no template is selected, show the template selection modal
    if (!loading && !template) {
      setTemplateModalVisible(true)
    }
  }, [template, loading])

  
  const handleTemplateSelect = (selectedTemplate) => {
    setTemplate(selectedTemplate)
    setTemplateModalVisible(false)
    setResumeName(selectedTemplate.name || 'My Resume')
  }

  const handleTemplateModalCancel = () => {
    setTemplateModalVisible(false)
  }

  const handleSave = async () => {
    if (!template) {
      toast.error('Please select a template first')
      return
    }

    try {
      setSaving(true)

      // Prepare resume data
      const resumePayload = {
        name: resumeName,
        templateId: template.templateId,
        data: resumeData,
        metadata: {
          lastSaved: new Date().toISOString(),
          templateName: template.name
        }
      }

      // Save resume metadata
      const savedResume = await resumeService.createResume(resumePayload)

      // Save sections individually (for arrays)
      const sectionPromises = []
      Object.entries(resumeData).forEach(([sectionType, data]) => {
        const schema = template.inputDataSchema[sectionType]
        if (schema?.type === 'array' && Array.isArray(data)) {
          data.forEach(item => {
            // Only save items that have data (not empty)
            if (Object.values(item).some(val => val !== '' && val !== 0 && val !== false)) {
              const sectionPayload = {
                title: `${schema.title || sectionType} - ${item.position || item.name || item.title || 'Untitled'}`,
                sectionType,
                tags: item.tags || [],
                data: item,
                resumeId: savedResume.resumeId
              }
              sectionPromises.push(sectionService.createSection(sectionPayload))
            }
          })
        }
      })

      if (sectionPromises.length > 0) {
        await Promise.all(sectionPromises)
      }

      toast.success(`Resume "${resumeName}" saved successfully!`)

      // Sync with extension if available
      if (window.__EXTENSION_BRIDGE__) {
        window.__EXTENSION_BRIDGE__.sendData(resumeData)
      }

      console.log('Saved resume:', { resumeName, resumeId: savedResume.resumeId, template })
    } catch (error) {
      console.error('Save error:', error)
      if (error instanceof ApiError) {
        // Error is already handled by the API service
        if (!error.data || !error.data.isOk) {
          toast.error(error.message || 'Failed to save resume')
        }
      } else {
        toast.error('Failed to save resume: ' + (error.message || 'Unknown error'))
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async () => {
    if (!template || !resumeData) {
      toast.error('No data to download')
      return
    }

  }

  const handlePrint = () => {
    window.print()
  }

  const handleZoom = (value) => {
    setZoom(Math.min(Math.max(value, 50), 200))
  }

  const zoomMenuItems = [
    { key: '50', label: '50%' },
    { key: '75', label: '75%' },
    { key: '100', label: '100%' },
    { key: '125', label: '125%' },
    { key: '150', label: '150%' },
    { key: '200', label: '200%' },
  ]

  if (loading) {
    return (
      <Layout className={styles.layout}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout className={styles.layout}>
      {/* Header */}
      <Header className={styles.header}>
        <div className={styles.headerLeft}>
          <Tooltip title="Back to templates">
            <Button
              type="text"
              icon={<BackwardOutlined />}
              onClick={() => navigate('/templates')}
              className={styles.backBtn}
            />
          </Tooltip>
          <div className={styles.logoContainer} onClick={() => navigate('/')}>
            <span className={styles.logoIcon}>📄</span>
            <h1 className={styles.logoText}>SnapResume</h1>
          </div>
        </div>

        <div className={styles.resumeInfo}>
          <input
            type="text"
            value={resumeName}
            onChange={(e) => setResumeName(e.target.value)}
            className={styles.resumeNameInput}
            placeholder="Resume name"
          />
          <span className={styles.template}>
            Template: {template?.name || 'Not selected'}
          </span>
        </div>

        <Space className={styles.headerActions} size="small">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
          >
            Save
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            Print
          </Button>
          <Dropdown
            menu={{ items: zoomMenuItems, onClick: (e) => handleZoom(parseInt(e.key)) }}
          >
            <Button icon={<SettingOutlined />} />
          </Dropdown>
        </Space>
      </Header>

      <Content className={styles.contentNewLayout}>
        <div className={styles.sectionPanel}>
          <SectionPanel />
        </div>

        {/* Center: Dynamic Form */}
        <div className={styles.formPanel}>
          <DynamicSectionForm />
        </div>

        {/* Right: Preview Panel */}
        <div className={styles.previewPanel}>
          <PreviewPanel
            data={resumeData}
            template={template}
            zoom={zoom}
          />
        </div>
      </Content>

      <TemplateSelectionModal
        visible={templateModalVisible}
        onSelect={handleTemplateSelect}
        onCancel={handleTemplateModalCancel}
      />

      {/* Resume Manager Modal */}
      <ResumeManagerUniversal
        visible={managerModalVisible}
        onClose={() => setManagerModalVisible(false)}
        resumeData={resumeData}
        onUpdateData={() => {}} // Handled by context now
        onSave={handleSave}
        mode="modal"
      />
    </Layout>
  )
}

export default EditorPageContent