import { Row, Col, Card, Button } from 'antd'
import { SearchOutlined, AudioOutlined } from '@ant-design/icons'
import styles from './ToolsSection.module.css'

export default function ToolsSection() {
  const tools = [
    {
      icon: SearchOutlined,
      title: 'Resume Scanner',
      description: 'Upload your resume and get instant feedback on how well it will perform with ATS systems.',
      features: ['ATS compatibility check', 'Keyword optimization', 'Impact analysis'],
      buttonText: 'Launch Scanner'
    },
    {
      icon: AudioOutlined,
      title: 'Interview Trainer',
      description: 'Practice your interview skills with our AI interviewer. Get real-time feedback.',
      features: ['Real interview questions', 'Video analysis', 'Progress tracking'],
      buttonText: 'Launch Trainer'
    }
  ]

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <p className={styles.label}>OUR TOOLS</p>
        <h2 className={styles.title}>Supercharge Your Skills</h2>
        
        <Row gutter={[32, 32]}>
          {tools.map((tool, index) => {
            const Icon = tool.icon
            return (
              <Col xs={24} sm={12} key={index}>
                <Card className={styles.toolCard}>
                  <div className={styles.iconContainer}>
                    <Icon className={styles.icon} />
                  </div>
                  <h3 className={styles.toolTitle}>{tool.title}</h3>
                  <p className={styles.description}>{tool.description}</p>
                  <ul className={styles.features}>
                    {tool.features.map((feature, i) => (
                      <li key={i}>✓ {feature}</li>
                    ))}
                  </ul>
                  <Button block size="large">{tool.buttonText}</Button>
                </Card>
              </Col>
            )
          })}
        </Row>
      </div>
    </section>
  )
}