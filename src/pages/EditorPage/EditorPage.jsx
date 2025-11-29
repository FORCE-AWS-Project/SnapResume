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
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined
} from '@ant-design/icons'
import FormPanel from './components/FormPanel'
import PreviewPanel from './components/PreviewPanel'
import { downloadJSON, exportToPDF, exportToDOCX, validateATS } from '../../utils/exportResume'
import styles from './EditorPage.module.css'

const { Header, Content } = Layout

export default function EditorPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [zoom, setZoom] = useState(100)
  const [resumeName, setResumeName] = useState('My Resume')
  const [templateId, setTemplateId] = useState(1)
  const [sectionOrder, setSectionOrder] = useState([
    'experience',
    'education', 
    'skills',
    'projects',
    'certifications',
    'languages',
    'volunteering',
    'publications'
  ])
  
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      roleTitle: '',
      pronouns: '',
      email: '',
      phone: '',
      location: {
        city: '',
        state: '',
        country: '',
      },
      links: {
        linkedin: '',
        github: '',
        portfolio: '',
        website: '',
      },
      summary: '',
      photoUrl: '',
      showPhoto: false,
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

  useEffect(() => {
    const templateIdParam = searchParams.get('templateId')
    const templateNameParam = searchParams.get('templateName')
    if (templateIdParam) setTemplateId(parseInt(templateIdParam))
    if (templateNameParam) setResumeName(templateNameParam)
  }, [searchParams])

  const handleInputChange = (section, field, value) => {
    if (field === null) {
      // For array sections (experience, education, etc.)
      setResumeData(prev => ({
        ...prev,
        [section]: value,
      }))
    } else {
      // For nested object sections (personalInfo)
      setResumeData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }))
    }
  }

  const handleSave = () => {
    // Validate ATS compliance
    const validation = validateATS(resumeData)
    if (validation.issues.length > 0) {
      const warningCount = validation.issues.filter(i => i.severity === 'warning').length
      const errorCount = validation.issues.length - warningCount
      
      if (errorCount > 0) {
        message.warning(`Resume saved with ${errorCount} ATS issue(s). Check the console for details.`)
        console.warn('ATS Issues:', validation.issues)
      }
    }
    
    message.success('Resume saved successfully!')
    console.log('Saved resume:', { resumeName, resumeData, templateId })
  }

  const handleDownload = (format) => {
    switch (format) {
      case 'pdf':
        exportToPDF()
        message.success('Opening print dialog for PDF export...')
        break
      case 'json':
        downloadJSON(resumeData, `${resumeName.replace(/\s+/g, '_')}.json`)
        message.success('Resume downloaded as JSON!')
        break
      case 'docx':
        exportToDOCX(resumeData)
        break
      default:
        message.info('Please select a format')
    }
  }

  const downloadMenuItems = [
    {
      key: 'pdf',
      label: 'Export as PDF',
      icon: <FilePdfOutlined />,
      onClick: () => handleDownload('pdf'),
    },
    {
      key: 'json',
      label: 'Export as JSON',
      icon: <FileTextOutlined />,
      onClick: () => handleDownload('json'),
    },
    {
      key: 'docx',
      label: 'Export as DOCX',
      icon: <FileWordOutlined />,
      onClick: () => handleDownload('docx'),
    },
  ]

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
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            Save
          </Button>
          <Dropdown menu={{ items: downloadMenuItems }}>
            <Button icon={<DownloadOutlined />}>
              Download
            </Button>
          </Dropdown>
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
        <FormPanel 
          data={resumeData} 
          onInputChange={handleInputChange}
          sectionOrder={sectionOrder}
        />
        <PreviewPanel 
          data={resumeData} 
          templateId={templateId}
          zoom={zoom}
          sectionOrder={sectionOrder}
        />
      </Content>
    </Layout>
  )
}