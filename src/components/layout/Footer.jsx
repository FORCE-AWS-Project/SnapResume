import { Row, Col, Divider, Space } from 'antd'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Row gutter={[48, 32]}>
          <Col xs={24} sm={6}>
            <h3 className={styles.heading}>SnapResume</h3>
            <p className={styles.description}>Building better resumes, one profile at a time.</p>
            <Space direction="vertical" className={styles.links}>
              <a href="#twitter">Twitter</a>
              <a href="#linkedin">LinkedIn</a>
              <a href="#github">GitHub</a>
            </Space>
          </Col>
          <Col xs={24} sm={6}>
            <h4 className={styles.subHeading}>Product</h4>
            <Space direction="vertical" className={styles.links}>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#templates">Templates</a>
            </Space>
          </Col>
          <Col xs={24} sm={6}>
            <h4 className={styles.subHeading}>Company</h4>
            <Space direction="vertical" className={styles.links}>
              <a href="#about">About</a>
              <a href="#blog">Blog</a>
              <a href="#contact">Contact</a>
            </Space>
          </Col>
          <Col xs={24} sm={6}>
            <h4 className={styles.subHeading}>Legal</h4>
            <Space direction="vertical" className={styles.links}>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
            </Space>
          </Col>
        </Row>
        <Divider className={styles.divider} />
        <p className={styles.copyright}>
          &copy; 2025 SnapResume. All rights reserved.
        </p>
      </div>
    </footer>
  )
}