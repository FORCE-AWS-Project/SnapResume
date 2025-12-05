import { useNavigate } from 'react-router-dom'
import { Button, Space } from 'antd'
import styles from './Navbar.module.css'

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
          <div className={styles.logoSection} onClick={() => navigate('/')}>
          <span className={styles.logoIcon}>✨</span>
          <span className={styles.logoText}>SnapResume</span>
        </div>
        <Space size="large" className={styles.navLinks}>
          <a href="/templates" onClick={(e) => { e.preventDefault(); navigate('/templates') }}>Templates</a>
          <a href="/features" onClick={(e) => { e.preventDefault(); navigate('/features') }}>Features</a>
          <a href="/pricing" onClick={(e) => { e.preventDefault(); navigate('/pricing') }}>Pricing</a>
          <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about') }}>About</a>
          <Button type="primary" onClick={() => navigate('/auth')}>Sign in</Button>
        </Space>
      </div>
    </nav>
  )
}