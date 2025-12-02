import { Button, Row, Col, Card } from 'antd'
import { useNavigate } from 'react-router-dom'
import styles from './HeroSection.module.css'

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <Row gutter={[64, 0]} align="middle">
          <Col xs={24} md={12}>
            <h1 className={styles.title}>
              Land your dream job with Tailored AI-Powered Resume
            </h1>
            <p className={styles.subtitle}>
              Use AI to create a job-winning resume that passes ATS systems and impresses hiring managers. Stand out from thousands of applicants.
            </p>
            <div className={styles.buttons}>
              <Button 
                type="primary" 
                size="large" 
                onClick={() => navigate('/templates')}
              >
                Create Resume
              </Button>
              <Button size="large" className={styles.secondaryBtn}>
                Learn More
              </Button>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Card className={styles.showcase}>
              <img 
                src="https://via.placeholder.com/400x350?text=Resume+Preview" 
                alt="Resume Preview"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  )
}