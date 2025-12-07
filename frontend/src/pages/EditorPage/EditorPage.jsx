import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Layout, Button, Space, Dropdown, InputNumber, Tooltip, message } from 'antd'
import {
  SaveOutlined,
  DownloadOutlined,
  SettingOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  BackwardOutlined,
  PrinterOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'
import FormPanel from './components/FormPanel'
import PreviewPanel from './components/PreviewPanel'
import { ResumeManagerProvider } from '../../components/ResumeManager/context/ResumeManagerContext'
import { ResumeManagerUniversal } from '../../components/ResumeManager/ResumeManagerUniversal'
import styles from './EditorPage.module.css'
import html2pdf from 'html2pdf.js'

const { Header, Content } = Layout

export default function EditorPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [zoom, setZoom] = useState(100)
  const [resumeName, setResumeName] = useState('My Resume')
  const [templateId, setTemplateId] = useState(1)
  const [sectionOrder, setSectionOrder] = useState(['experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'volunteering', 'publications'])
  const [managerModalVisible, setManagerModalVisible] = useState(false)
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      photoUrl: '',
    },
    experience: [],
    education: [],
    skills: {
      categories: [],
    },
    certifications: [],
    projects: [],
    languages: [],
    volunteering: [],
    publications: [],
  })

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const templateIdParam = searchParams.get('templateId')
    const templateNameParam = searchParams.get('templateName')

    if (templateIdParam) setTemplateId(parseInt(templateIdParam))
    if (templateNameParam) setResumeName(templateNameParam)

    // Sync with extension if available
    if (window.__EXTENSION_BRIDGE__) {
      window.__EXTENSION_BRIDGE__.requestData().then((data) => {
        if (data && Object.keys(data).length > 0) {
          setResumeData(data)
        }
      })

      // Listen for updates from extension
      window.__EXTENSION_BRIDGE__.onDataUpdate((newData) => {
        setResumeData(newData)
        message.info('Resume updated from extension')
      })
    }
  }, [searchParams])

  const handleInputChange = (section, field, value) => {
    setResumeData(prev => {
      if (field === null) {
        return {
          ...prev,
          [section]: value,
        }
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }
    })
  }

  const handleSave = () => {
    message.success('Resume saved successfully!')

    // Sync with extension if available
    if (window.__EXTENSION_BRIDGE__) {
      window.__EXTENSION_BRIDGE__.sendData(resumeData)
    }

    console.log('Saved resume:', { resumeName, resumeData, templateId, sectionOrder })
  }

  const handleDownload = () => {
    const element = document.getElementById('resume-preview-content')
    if (!element) {
      message.error('Resume preview not found')
      return
    }

    const opt = {
      margin: 0,
      filename: `${resumeName.replace(/\s+/g, '_') || 'resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }

    message.loading('Generating PDF...', 1)

    html2pdf().set(opt).from(element).save().then(() => {
      message.success('PDF Downloaded!')
    }).catch(err => {
      console.error('PDF generation error:', err)
      message.error('Failed to generate PDF')
    })
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

  return (
    <ResumeManagerProvider>
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
            <span className={styles.template}>Template: {templateId}</span>
          </div>

          <Space className={styles.headerActions} size="small">
            <Tooltip title="Manage Sections">
              <Button
                icon={<UnorderedListOutlined />}
                onClick={() => setManagerModalVisible(true)}
              >
                Manage
              </Button>
            </Tooltip>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>
              Download
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

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <Space>
            <span className={styles.zoomLabel}>Zoom:</span>
            <Button
              icon={<ZoomOutOutlined />}
              onClick={() => handleZoom(zoom - 10)}
              disabled={zoom <= 50}
            />
            <InputNumber
              min={50}
              max={200}
              value={zoom}
              onChange={handleZoom}
              step={10}
              className={styles.zoomInput}
            />
            <span>{zoom}%</span>
            <Button
              icon={<ZoomInOutlined />}
              onClick={() => handleZoom(zoom + 10)}
              disabled={zoom >= 200}
            />
          </Space>
          <span className={styles.pageIndicator}>1/1</span>
        </div>

        {/* Content */}
        <Content className={styles.content}>
          <FormPanel data={resumeData} onInputChange={handleInputChange} sectionOrder={sectionOrder} />
          <PreviewPanel
            data={resumeData}
            templateId={templateId}
            zoom={zoom}
            sectionOrder={sectionOrder}
          />
        </Content>

        {/* Resume Manager Modal - Now Universal */}
        <ResumeManagerUniversal
          visible={managerModalVisible}
          onClose={() => setManagerModalVisible(false)}
          resumeData={resumeData}
          onUpdateData={setResumeData}
          onSave={handleSave}
          mode="modal"
          sectionOrder={sectionOrder}
          onOrderChange={setSectionOrder}
        />
      </Layout>
    </ResumeManagerProvider>
  )
}