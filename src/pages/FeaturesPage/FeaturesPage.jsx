import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Button, Tabs, Space, Divider } from 'antd'
import { 
  CheckCircleOutlined, 
  BgColorsOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  DownloadOutlined,
  DesktopOutlined,
  SafetyOutlined,
  AudioOutlined
} from '@ant-design/icons'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import styles from './FeaturesPage.module.css'

export default function FeaturesPage() {
  const navigate = useNavigate()

  const mainFeatures = [
    {
      id: 1,
      icon: BgColorsOutlined,
      title: 'Beautiful Templates',
      description: 'Choose from 100+ professionally designed resume templates. Each one is optimized for ATS and ready to use.',
      details: [
        'Modern and classic designs',
        'Industry-specific layouts',
        'One-page and multi-page options',
        'Fully customizable colors and fonts'
      ],
      image: '🎨'
    },
    {
      id: 2,
      icon: RobotOutlined,
      title: 'AI-Powered Content',
      description: 'Let AI help you write powerful resume content that impresses recruiters and passes ATS systems.',
      details: [
        'Smart content suggestions',
        'Job-specific recommendations',
        'Grammar and spelling check',
        'Keyword optimization'
      ],
      image: '🤖'
    },
    {
      id: 3,
      icon: ThunderboltOutlined,
      title: 'Real-time Preview',
      description: 'See your changes instantly as you type. Live preview with multiple zoom levels and print options.',
      details: [
        'WYSIWYG editor',
        'Multiple zoom levels',
        'Print-ready formats',
        'PDF export option'
      ],
      image: '⚡'
    },
    {
      id: 4,
      icon: FileTextOutlined,
      title: 'ATS Optimization',
      description: 'Built-in ATS scanner ensures your resume passes automated applicant tracking systems.',
      details: [
        'ATS compatibility check',
        'Format recommendations',
        'Keyword scanner',
        'Score feedback'
      ],
      image: '✅'
    }
  ]

  const advancedFeatures = [
    {
      id: 1,
      icon: RobotOutlined,
      title: 'Resume Scanner',
      description: 'Analyze your existing resume and get actionable recommendations to improve its impact.',
      features: ['Real-time analysis', 'Detailed feedback', 'Improvement suggestions', 'Keyword tracking']
    },
    {
      id: 2,
      icon: AudioOutlined,
      title: 'Interview Trainer',
      description: 'Practice interview questions with AI and get personalized feedback on your responses.',
      features: ['Interview questions', 'Video recording', 'AI feedback', 'Progress tracking']
    },
    {
      id: 3,
      icon: FileTextOutlined,
      title: 'Cover Letter Generator',
      description: 'Create tailored cover letters that complement your resume perfectly.',
      features: ['AI-generated content', 'Job-specific', 'Customizable', 'Professional templates']
    },
    {
      id: 4,
      icon: SafetyOutlined,
      title: 'Job Matching',
      description: 'Match your resume to job descriptions and see what you might be missing.',
      features: ['Job analysis', 'Gap identification', 'Skill matching', 'Recommendations']
    }
  ]

  const editorFeatures = [
    {
      name: 'Drag-and-Drop Sections',
      description: 'Easily reorder resume sections to highlight your strengths',
      icon: '📋'
    },
    {
      name: 'Rich Text Editor',
      description: 'Format text with bold, italic, bullet points, and more',
      icon: '✏️'
    },
    {
      name: 'Photo Upload',
      description: 'Add a professional photo to your resume',
      icon: '📸'
    },
    {
      name: 'Multiple Export Formats',
      description: 'Export as PDF, Word, or plain text',
      icon: '💾'
    },
    {
      name: 'Auto-save',
      description: 'Your resume is automatically saved as you type',
      icon: '🔄'
    },
    {
      name: 'Undo/Redo',
      description: 'Go back and forth through your edits',
      icon: '↩️'
    },
    {
      name: 'Font & Color Customization',
      description: 'Personalize fonts and colors to match your brand',
      icon: '🎨'
    },
    {
      name: 'Section Lock',
      description: 'Lock sections to prevent accidental changes',
      icon: '🔒'
    }
  ]

  const comparisonData = [
    { feature: 'Number of Templates', snapresume: '100+', other: '20-30', snapresume_winner: true },
    { feature: 'AI Content Suggestions', snapresume: '✓ Advanced', other: '✗ Basic', snapresume_winner: true },
    { feature: 'ATS Scanner', snapresume: '✓ Built-in', other: '⊗ Extra cost', snapresume_winner: true },
    { feature: 'Interview Trainer', snapresume: '✓ Included', other: '✗ Not available', snapresume_winner: true },
    { feature: 'Export Formats', snapresume: '5+ formats', other: 'PDF only', snapresume_winner: true },
    { feature: 'Unlimited Resumes', snapresume: '✓ Yes', other: '⊗ Limited', snapresume_winner: true },
    { feature: 'Price', snapresume: 'Free - $9.99/mo', other: '$15-30/mo', snapresume_winner: true },
  ]

  const tabItems = [
    {
      key: 'editor',
      label: 'Editor Features',
      children: (
        <Row gutter={[24, 24]}>
          {editorFeatures.map((feature, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureName}>{feature.name}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </Card>
            </Col>
          ))}
        </Row>
      )
    },
    {
      key: 'advanced',
      label: 'Advanced Tools',
      children: (
        <Row gutter={[24, 24]}>
          {advancedFeatures.map((tool, index) => {
            const Icon = tool.icon
            return (
              <Col xs={24} sm={12} key={index}>
                <Card className={styles.advancedCard}>
                  <Icon className={styles.advancedIcon} />
                  <h3 className={styles.toolTitle}>{tool.title}</h3>
                  <p className={styles.toolDesc}>{tool.description}</p>
                  <ul className={styles.featureList}>
                    {tool.features.map((feature, i) => (
                      <li key={i}>
                        <CheckCircleOutlined /> {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Col>
            )
          })}
        </Row>
      )
    },
    {
      key: 'comparison',
      label: 'Why Choose SnapResume',
      children: (
        <div className={styles.comparisonContainer}>
          <div className={styles.comparisonTable}>
            <div className={styles.comparisonHeader}>
              <div className={styles.featureCol}>Feature</div>
              <div className={styles.compareCol}>SnapResume</div>
              <div className={styles.compareCol}>Other Competitors</div>
            </div>
            {comparisonData.map((item, index) => (
              <div key={index} className={styles.comparisonRow}>
                <div className={styles.featureCol}>{item.feature}</div>
                <div className={`${styles.compareCol} ${styles.snapresume}`}>
                  {item.snapresume}
                </div>
                <div className={styles.compareCol}>{item.other}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ]

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Everything You Need</h1>
            <p className={styles.heroSubtitle}>
              Powerful tools to create, optimize, and land your dream job
            </p>
          </div>
        </section>

        {/* Main Features */}
        <section className={styles.mainFeaturesSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Core Features</h2>
            <Row gutter={[32, 32]}>
              {mainFeatures.map((feature) => {
                const Icon = feature.icon
                return (
                  <Col xs={24} sm={12} lg={6} key={feature.id}>
                    <Card className={styles.mainFeatureCard}>
                      <div className={styles.mainFeatureImage}>{feature.image}</div>
                      <Icon className={styles.mainFeatureIcon} />
                      <h3 className={styles.mainFeatureTitle}>{feature.title}</h3>
                      <p className={styles.mainFeatureDesc}>{feature.description}</p>
                      <ul className={styles.mainFeatureDetails}>
                        {feature.details.map((detail, idx) => (
                          <li key={idx}>
                            <CheckCircleOutlined /> {detail}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </div>
        </section>

        <Divider className={styles.divider} />

        {/* Detailed Features Tabs */}
        <section className={styles.detailedFeaturesSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Explore All Features</h2>
            <Tabs items={tabItems} className={styles.featureTabs} />
          </div>
        </section>

        {/* Call to Action */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Build Your Perfect Resume?</h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of professionals who've successfully landed their dream jobs
            </p>
            <Space size="large">
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/templates')}
              >
                Get Started Free
              </Button>
              <Button size="large">
                View Pricing
              </Button>
            </Space>
          </div>
        </section>

        {/* Benefits Section */}
        <section className={styles.benefitsSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Why SnapResume?</h2>
            <Row gutter={[32, 32]}>
              <Col xs={24} sm={12} lg={8}>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitNumber}>1</div>
                  <h3>Save Time</h3>
                  <p>Create a professional resume in minutes, not hours. Our templates and AI suggestions do the heavy lifting.</p>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitNumber}>2</div>
                  <h3>Get Results</h3>
                  <p>Our ATS-optimized templates help your resume get past automated systems and reach hiring managers.</p>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitNumber}>3</div>
                  <h3>Land Interviews</h3>
                  <p>With our interview trainer and job matching tools, you'll be prepared to ace every opportunity.</p>
                </div>
              </Col>
            </Row>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}