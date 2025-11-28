import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Row, Col, Card, Button, Badge, Space, Select } from 'antd'
import { SearchOutlined, CheckCircleOutlined } from '@ant-design/icons'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import styles from './TemplatesPage.module.css'

export default function TemplatesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const templates = [
    {
      id: 1,
      name: 'Modern Blue',
      category: 'Modern',
      description: 'Clean and professional template with blue accent',
      color: '#2c3e50',
      features: ['ATS-Optimized', 'Modern Design', 'One Page'],
      thumbnail: '🎨',
      isPopular: true
    },
    {
      id: 2,
      name: 'Minimalist White',
      category: 'Minimal',
      description: 'Simple and elegant minimalist design',
      color: '#ffffff',
      features: ['Minimal', 'Clean', 'Professional'],
      thumbnail: '📄',
      isPopular: false
    },
    {
      id: 3,
      name: 'Creative Gold',
      category: 'Creative',
      description: 'Eye-catching creative template with gold accents',
      color: '#d4a574',
      features: ['Creative', 'Bold', 'Modern'],
      thumbnail: '✨',
      isPopular: true
    },
    {
      id: 4,
      name: 'Executive Pro',
      category: 'Professional',
      description: 'Professional template for executives and managers',
      color: '#1e3a5f',
      features: ['Executive', 'Professional', 'Two Page'],
      thumbnail: '💼',
      isPopular: false
    },
    {
      id: 5,
      name: 'Tech Developer',
      category: 'Tech',
      description: 'Perfect for developers and tech professionals',
      color: '#0a0e27',
      features: ['Tech-focused', 'GitHub', 'Skills'],
      thumbnail: '💻',
      isPopular: true
    },
    {
      id: 6,
      name: 'Creative Designer',
      category: 'Creative',
      description: 'Showcase your design portfolio with this template',
      color: '#ff6b6b',
      features: ['Portfolio', 'Visual', 'Creative'],
      thumbnail: '🎭',
      isPopular: false
    },
  ]

  const categories = [
    { label: 'All Templates', value: 'all' },
    { label: 'Modern', value: 'Modern' },
    { label: 'Professional', value: 'Professional' },
    { label: 'Creative', value: 'Creative' },
    { label: 'Tech', value: 'Tech' },
    { label: 'Minimal', value: 'Minimal' },
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || template.category === selectedFilter
    return matchesSearch && matchesFilter
  })

  const handleSelectTemplate = (template) => {
    navigate(`/editor?templateId=${template.id}&templateName=${template.name}`)
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
              Choose from 100+ professionally designed templates. All ATS-optimized and ready to use.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} md={6}>
              <div className={styles.featureItem}>
                <CheckCircleOutlined className={styles.featureIcon} />
                <h3>ATS-Optimized</h3>
                <p>Built for modern tracking systems</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className={styles.featureItem}>
                <CheckCircleOutlined className={styles.featureIcon} />
                <h3>Expert-Crafted</h3>
                <p>Professional resume guidance</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className={styles.featureItem}>
                <CheckCircleOutlined className={styles.featureIcon} />
                <h3>Industry-Specific</h3>
                <p>Tailored for your career field</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className={styles.featureItem}>
                <CheckCircleOutlined className={styles.featureIcon} />
                <h3>Free Download</h3>
                <p>Instant access to templates</p>
              </div>
            </Col>
          </Row>
        </section>

        {/* Search & Filter Section */}
        <section className={styles.filterSection}>
          <div className={styles.filterContainer}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Input
                placeholder="Search resume templates..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="large"
                className={styles.searchInput}
              />
              <Select
                placeholder="Filter by category"
                value={selectedFilter}
                onChange={setSelectedFilter}
                options={categories}
                style={{ width: '100%' }}
                size="large"
              />
            </Space>
          </div>
        </section>

        {/* Templates Grid */}
        <section className={styles.templatesGrid}>
          <h2 className={styles.resultsTitle}>
            Resume Templates ({filteredTemplates.length})
          </h2>
          
          <Row gutter={[24, 24]}>
            {filteredTemplates.map((template) => (
              <Col xs={24} sm={12} lg={8} key={template.id}>
                <Card
                  className={styles.templateCard}
                  cover={
                    <div
                      className={styles.templatePreview}
                      style={{ backgroundColor: template.color }}
                    >
                      <div className={styles.thumbnailIcon}>
                        {template.thumbnail}
                      </div>
                    </div>
                  }
                  actions={[
                    <Button type="primary" block size="large">
                      Use Template
                    </Button>
                  ]}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className={styles.cardContent}>
                    {template.isPopular && (
                      <Badge
                        count="Popular"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          position: 'absolute',
                          top: '-10px',
                          right: '10px'
                        }}
                      />
                    )}
                    <h3 className={styles.templateName}>{template.name}</h3>
                    <p className={styles.templateDescription}>
                      {template.description}
                    </p>
                    <div className={styles.features}>
                      {template.features.map((feature, idx) => (
                        <span key={idx} className={styles.featureTag}>
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {filteredTemplates.length === 0 && (
            <div className={styles.noResults}>
              <p>No templates found matching your criteria.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}