import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Button, Timeline, Space, Divider, Avatar } from 'antd'
import { 
  CheckCircleOutlined,
  TeamOutlined,
  BulbOutlined,
  RocketOutlined,
  HeartOutlined,
  GlobalOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  GithubOutlined
} from '@ant-design/icons'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import styles from './AboutPage.module.css'

export default function AboutPage() {
  const navigate = useNavigate()

  const values = [
    {
      icon: BulbOutlined,
      title: 'Innovation',
      description: 'We continuously innovate to provide cutting-edge tools that help job seekers succeed.'
    },
    {
      icon: HeartOutlined,
      title: 'User-Centric',
      description: 'Your success is our mission. We design every feature with you in mind.'
    },
    {
      icon: GlobalOutlined,
      title: 'Accessibility',
      description: 'Quality resume tools should be accessible to everyone, regardless of background.'
    },
    {
      icon: TeamOutlined,
      title: 'Community',
      description: 'We believe in building a supportive community of job seekers helping each other.'
    }
  ]

  const team = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Co-founder',
      bio: 'Former recruiter with 10+ years of experience. Passionate about democratizing career tools.',
      avatar: '👨‍💼',
      social: ['linkedin', 'twitter']
    },
    {
      name: 'Sarah Chen',
      role: 'CTO & Co-founder',
      bio: 'Full-stack developer with expertise in AI and machine learning. Loves building user-friendly products.',
      avatar: '👩‍💻',
      social: ['github', 'linkedin']
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Head of Design',
      bio: 'UX/UI designer passionate about creating beautiful and intuitive interfaces.',
      avatar: '👨‍🎨',
      social: ['twitter', 'linkedin']
    },
    {
      name: 'Emily Watson',
      role: 'Head of Operations',
      bio: 'Operations expert focused on scaling SnapResume and supporting our growing team.',
      avatar: '👩‍💼',
      social: ['linkedin']
    }
  ]

  const milestones = [
    {
      year: '2022',
      title: 'Founded SnapResume',
      description: 'Started with a mission to make resume building easier and more accessible.'
    },
    {
      year: '2023',
      title: 'Launched AI Features',
      description: 'Introduced AI-powered content suggestions and ATS optimization tools.'
    },
    {
      year: '2023',
      title: '100K+ Users',
      description: 'Reached 100,000 active users in just 9 months of launch.'
    },
    {
      year: '2024',
      title: 'Interview Trainer Released',
      description: 'Added interview trainer and job matching tools to help users prepare for interviews.'
    },
    {
      year: '2024',
      title: 'Series A Funding',
      description: 'Secured $2M Series A funding to accelerate product development and expand globally.'
    }
  ]

  const stats = [
    { number: '500K+', label: 'Resumes Created' },
    { number: '50K+', label: 'Monthly Active Users' },
    { number: '95%', label: 'User Satisfaction' },
    { number: '30+', label: 'Countries Served' }
  ]

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>About SnapResume</h1>
            <p className={styles.heroSubtitle}>
              Empowering job seekers with AI-powered tools to land their dream jobs
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className={styles.missionSection}>
          <div className={styles.sectionContainer}>
            <Row gutter={[64, 32]} align="middle">
              <Col xs={24} md={12}>
                <div className={styles.missionContent}>
                  <h2 className={styles.sectionTitle}>Our Mission</h2>
                  <p className={styles.missionText}>
                    We believe that everyone deserves access to world-class resume tools, regardless of their background or budget. At SnapResume, we're on a mission to democratize career development and help millions of people around the world land their dream jobs.
                  </p>
                  <p className={styles.missionText}>
                    Founded in 2022, SnapResume has already helped over 500,000 job seekers create professional resumes and advance their careers. We're committed to continuous innovation and providing the best possible experience.
                  </p>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className={styles.missionImage}>🎯</div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.sectionContainer}>
            <Row gutter={[32, 32]}>
              {stats.map((stat, idx) => (
                <Col xs={24} sm={12} lg={6} key={idx}>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>{stat.number}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        <Divider className={styles.divider} />

        {/* Values Section */}
        <section className={styles.valuesSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Our Core Values</h2>
            <Row gutter={[32, 32]}>
              {values.map((value, idx) => {
                const Icon = value.icon
                return (
                  <Col xs={24} sm={12} lg={6} key={idx}>
                    <Card className={styles.valueCard}>
                      <Icon className={styles.valueIcon} />
                      <h3 className={styles.valueTitle}>{value.title}</h3>
                      <p className={styles.valueDesc}>{value.description}</p>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </div>
        </section>

        {/* Journey Section */}
        <section className={styles.journeySection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Our Journey</h2>
            <div className={styles.timelineContainer}>
              <Timeline
                items={milestones.map(milestone => ({
                  label: <span className={styles.timelineYear}>{milestone.year}</span>,
                  title: milestone.title,
                  description: milestone.description,
                  color: 'var(--color-primary)'
                }))}
              />
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className={styles.teamSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Meet Our Team</h2>
            <p className={styles.teamSubtitle}>
              A diverse group of passionate professionals dedicated to your success
            </p>
            <Row gutter={[32, 32]}>
              {team.map((member, idx) => (
                <Col xs={24} sm={12} lg={6} key={idx}>
                  <Card className={styles.teamCard}>
                    <div className={styles.teamAvatar}>{member.avatar}</div>
                    <h3 className={styles.teamName}>{member.name}</h3>
                    <p className={styles.teamRole}>{member.role}</p>
                    <p className={styles.teamBio}>{member.bio}</p>
                    <Space className={styles.socialLinks}>
                      {member.social.includes('linkedin') && (
                        <a href="#linkedin"><LinkedinOutlined /></a>
                      )}
                      {member.social.includes('twitter') && (
                        <a href="#twitter"><TwitterOutlined /></a>
                      )}
                      {member.social.includes('github') && (
                        <a href="#github"><GithubOutlined /></a>
                      )}
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className={styles.whyChooseSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Why Choose SnapResume?</h2>
            <Row gutter={[32, 32]}>
              {[
                {
                  title: 'AI-Powered Intelligence',
                  description: 'Our cutting-edge AI analyzes job postings and suggests content that will help your resume stand out.'
                },
                {
                  title: 'ATS Optimization',
                  description: 'All our templates are optimized for applicant tracking systems to ensure your resume gets past the first filter.'
                },
                {
                  title: 'Real-Time Preview',
                  description: 'See exactly how your resume looks as you make changes with our live preview feature.'
                },
                {
                  title: 'Interview Preparation',
                  description: 'Beyond resumes, we help you prepare for interviews with our AI-powered interview trainer.'
                },
                {
                  title: 'Affordable Pricing',
                  description: 'Get started for free and upgrade only when you need advanced features. No hidden fees.'
                },
                {
                  title: 'Dedicated Support',
                  description: 'Our support team is here to help you succeed. Get answers to your questions anytime.'
                }
              ].map((item, idx) => (
                <Col xs={24} sm={12} lg={8} key={idx}>
                  <div className={styles.whyItem}>
                    <CheckCircleOutlined className={styles.whyIcon} />
                    <h3 className={styles.whyTitle}>{item.title}</h3>
                    <p className={styles.whyDesc}>{item.description}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Contact CTA */}
        <section className={styles.contactCtaSection}>
          <div className={styles.ctaContent}>
            <RocketOutlined className={styles.ctaIcon} />
            <h2 className={styles.ctaTitle}>Ready to get started?</h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of job seekers who've already found success with SnapResume
            </p>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/templates')}
            >
              Create Your Resume Now
            </Button>
          </div>
        </section>

        {/* Contact Info */}
        <section className={styles.contactSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Get in Touch</h2>
            <Row gutter={[32, 32]}>
              <Col xs={24} sm={8}>
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>📧</div>
                  <h3>Email</h3>
                  <a href="mailto:support@snapresume.com">support@snapresume.com</a>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>🌐</div>
                  <h3>Website</h3>
                  <a href="https://snapresume.com">www.snapresume.com</a>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>📍</div>
                  <h3>Office</h3>
                  <p>San Francisco, CA, USA</p>
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