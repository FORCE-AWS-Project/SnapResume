import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Row, Col, Card, Button, Badge, Space, Select, Empty, Tabs, Spin, message } from 'antd'
import { SearchOutlined, CheckCircleOutlined, FileTextOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import styles from './TemplatesPage.module.css'

// 1. DATA MOVED OUTSIDE: Prevents re-creation on every render
const TEMPLATES = [
  {
    id: 1,
    name: 'Modern Blue',
    category: 'Modern',
    description: 'Clean and professional template with blue accent',
    color: '#e6f7ff',
    accent: '#1890ff',
    features: ['ATS-Optimized', 'Modern Design', 'One Page'],
    thumbnail: '🎨',
    isPopular: true
  },
  {
    id: 2,
    name: 'Minimalist White',
    category: 'Minimal',
    description: 'Simple and elegant minimalist design',
    color: '#f5f5f5',
    accent: '#595959',
    features: ['Minimal', 'Clean', 'Professional'],
    thumbnail: '📄',
    isPopular: false
  },
  {
    id: 3,
    name: 'Creative Gold',
    category: 'Creative',
    description: 'Eye-catching creative template with gold accents',
    color: '#fff7e6',
    accent: '#fa8c16',
    features: ['Creative', 'Bold', 'Modern'],
    thumbnail: '✨',
    isPopular: true
  },
  {
    id: 4,
    name: 'Executive Pro',
    category: 'Professional',
    description: 'Professional template for executives and managers',
    color: '#f0f5ff',
    accent: '#003a8c',
    features: ['Executive', 'Professional', 'Two Page'],
    thumbnail: '💼',
    isPopular: false
  },
  {
    id: 5,
    name: 'Tech Developer',
    category: 'Tech',
    description: 'Perfect for developers and tech professionals',
    color: '#f9f0ff',
    accent: '#722ed1',
    features: ['Tech-focused', 'GitHub', 'Skills'],
    thumbnail: '💻',
    isPopular: true
  },
  {
    id: 6,
    name: 'Creative Designer',
    category: 'Creative',
    description: 'Showcase your design portfolio with this template',
    color: '#fff1f0',
    accent: '#f5222d',
    features: ['Portfolio', 'Visual', 'Creative'],
    thumbnail: '🎭',
    isPopular: false
  },
]

const CATEGORIES = [
  { label: 'All Templates', value: 'all' },
  { label: 'Modern', value: 'Modern' },
  { label: 'Professional', value: 'Professional' },
  { label: 'Creative', value: 'Creative' },
  { label: 'Tech', value: 'Tech' },
  { label: 'Minimal', value: 'Minimal' },
]

export default function TemplatesPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  
  // Mock user resumes - in real app, fetch from backend
  const [userResumes, setUserResumes] = useState([
    {
      id: 1,
      name: 'Software Engineer Resume',
      templateId: 5,
      templateName: 'Tech Developer',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: 2,
      name: 'Product Manager Resume',
      templateId: 4,
      templateName: 'Executive Pro',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    }
  ])
  const [loadingResumes, setLoadingResumes] = useState(false)

  // 2. USEMEMO: Optimizes filtering performance
  const filteredTemplates = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase().trim()
    
    if (!lowerQuery && selectedFilter === 'all') {
      return TEMPLATES
    }
    
    return TEMPLATES.filter(template => {
      const matchesSearch = !lowerQuery || 
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.category.toLowerCase().includes(lowerQuery) ||
        template.features.some(feature => feature.toLowerCase().includes(lowerQuery))
      
      const matchesFilter = selectedFilter === 'all' || template.category === selectedFilter
      
      return matchesSearch && matchesFilter
    })
  }, [searchQuery, selectedFilter])

  const handleSelectTemplate = (template) => {
    navigate(`/editor?templateId=${template.id}&templateName=${encodeURIComponent(template.name)}`)
  }

  const handleCreateNew = () => {
    navigate(`/editor?templateId=1&templateName=Modern Blue`)
  }

  const handleEditResume = (resume) => {
    navigate(`/editor?resumeId=${resume.id}&templateId=${resume.templateId}`)
  }

  const handleDeleteResume = (resumeId) => {
    setLoadingResumes(true)
    // Simulate API call
    setTimeout(() => {
      setUserResumes(userResumes.filter(r => r.id !== resumeId))
      message.success('Resume deleted successfully')
      setLoadingResumes(false)
    }, 500)
  }

  const tabItems = [
    {
      key: 'templates',
      label: 'Browse Templates',
      children: (
        <>
          {/* Search & Filter Section */}
          <section className={styles.filterSection}>
            <div className={styles.filterContainer}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={16}>
                  <Input
                    placeholder="Search by name, category, or features..."
                    prefix={<SearchOutlined className={styles.searchIcon} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="large"
                    allowClear
                    className={styles.searchInput}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Select
                    placeholder="Filter by category"
                    value={selectedFilter}
                    onChange={setSelectedFilter}
                    options={CATEGORIES}
                    size="large"
                    className={styles.filterSelect}
                    style={{ width: '100%' }}
                  />
                </Col>
              </Row>
            </div>
          </section>

          {/* Templates Grid */}
          <section className={styles.templatesGrid}>
            <div className={styles.gridHeader}>
              <h2 className={styles.resultsTitle}>
                {filteredTemplates.length > 0 ? 'Available Templates' : 'No Templates Found'} 
                <span className={styles.count}>({filteredTemplates.length})</span>
              </h2>
            </div>
            
            {filteredTemplates.length > 0 ? (
              <Row gutter={[24, 24]}>
                {filteredTemplates.map((template) => (
                  <Col xs={24} sm={12} lg={8} key={template.id}>
                    <Badge.Ribbon 
                      text="Popular" 
                      color="#ff4d4f" 
                      style={{ display: template.isPopular ? 'block' : 'none' }}
                    >
                      <Card
                        hoverable
                        className={styles.templateCard}
                        onClick={() => handleSelectTemplate(template)}
                        cover={
                          <div
                            className={styles.templatePreview}
                            style={{ backgroundColor: template.color, borderColor: template.accent }}
                          >
                            <div className={styles.thumbnailIcon} style={{ color: template.accent }}>
                              {template.thumbnail}
                            </div>
                          </div>
                        }
                      >
                        <div className={styles.cardContent}>
                          <div className={styles.cardHeader}>
                            <h3 className={styles.templateName}>{template.name}</h3>
                            <span className={styles.categoryTag}>{template.category}</span>
                          </div>
                          <p className={styles.templateDescription}>
                            {template.description}
                          </p>
                          <div className={styles.tagsContainer}>
                            {template.features.map((feature, idx) => (
                              <span key={idx} className={styles.featureTag}>
                                {feature}
                              </span>
                            ))}
                          </div>
                          <Button type="primary" block className={styles.useBtn}>
                             Use Template
                          </Button>
                        </div>
                      </Card>
                    </Badge.Ribbon>
                  </Col>
                ))}
              </Row>
            ) : (
               <Empty description="No templates match your search criteria" />
            )}
          </section>
        </>
      )
    }
  ];

  // Add "My Resumes" tab only if authenticated
  if (isAuthenticated) {
    tabItems.unshift({
      key: 'myresumes',
      label: `My Resumes (${userResumes.length})`,
      children: (
        <section className={styles.myResumesSection}>
          <div className={styles.myResumesHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Your Resumes</h2>
              <p className={styles.sectionSubtitle}>Manage and edit your created resumes</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="large"
              onClick={handleCreateNew}
            >
              Create New
            </Button>
          </div>

          {loadingResumes ? (
            <Spin size="large" style={{ display: 'flex', justifyContent: 'center', padding: '50px' }} />
          ) : userResumes.length > 0 ? (
            <Row gutter={[24, 24]}>
              {userResumes.map((resume) => (
                <Col xs={24} sm={12} lg={8} key={resume.id}>
                  <Card
                    hoverable
                    className={styles.resumeCard}
                    cover={
                      <div
                        className={styles.resumePreview}
                        style={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '150px'
                        }}
                      >
                        <div style={{ fontSize: '48px', color: 'white' }}>📄</div>
                      </div>
                    }
                  >
                    <div className={styles.resumeCardContent}>
                      <h3 className={styles.resumeName}>{resume.name}</h3>
                      <p className={styles.resumeTemplate}>{resume.templateName}</p>
                      <p className={styles.resumeMeta}>
                        Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                      </p>
                      <Space style={{ width: '100%', marginTop: '12px' }}>
                        <Button 
                          type="primary" 
                          icon={<EditOutlined />}
                          block
                          onClick={() => handleEditResume(resume)}
                        >
                          Edit
                        </Button>
                        <Button 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteResume(resume.id)}
                        >
                          Delete
                        </Button>
                      </Space>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              description="No Resumes Yet"
              style={{ marginTop: '50px' }}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                size="large"
                onClick={handleCreateNew}
              >
                Create Your First Resume
              </Button>
            </Empty>
          )}
        </section>
      )
    });
  }

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Professional Resume Templates</h1>
            <p className={styles.subtitle}>
              Stand out with ATS-optimized designs. Choose a style, customize it, and get hired faster.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.featuresWrapper}>
            <Row gutter={[32, 32]} justify="center">
              {[
                { icon: <CheckCircleOutlined />, title: 'ATS-Optimized', text: 'Built for tracking systems' },
                { icon: <FileTextOutlined />, title: 'Expert-Crafted', text: 'Professional guidance' },
                { icon: <CheckCircleOutlined />, title: 'Industry-Specific', text: 'Tailored for your field' },
                { icon: <CheckCircleOutlined />, title: 'Free Download', text: 'Instant PDF export' }
              ].map((item, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>{item.icon}</div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Tabs Section */}
        <section className={styles.tabsSection}>
          <Tabs 
            items={tabItems}
            defaultActiveKey={isAuthenticated ? 'myresumes' : 'templates'}
            size="large"
            style={{ background: 'white', padding: '20px', borderRadius: '8px' }}
          />
        </section>
      </main>

      <Footer />
    </div>
  )
}