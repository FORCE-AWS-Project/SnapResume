import { useState } from 'react'
import { Form, Input, Button, Checkbox, Divider } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import styles from './Auth.module.css'

export default function Auth() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('login')

  const handleLoginSuccess = () => navigate('/editor')
  const handleSignupSuccess = () => navigate('/editor')

  return (
    <div className={styles.layout}>
      {/* Left Section - Illustration */}
      <div className={styles.leftSection}>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          <ArrowLeftOutlined />
          Back to Website
        </button>
        
        <div className={styles.illustration}>
          <div className={styles.illustrationContent}>
            <div className={styles.logo}>✨</div>
            <h2 className={styles.illustrationTitle}>
              Create Smarter. Land Faster.
            </h2>
            <p className={styles.illustrationText}>
              Build professional resumes in minutes, not hours. Let AI handle the heavy lifting while you focus on landing your dream job.
            </p>
            <div className={styles.illustrationDecor}></div>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className={styles.rightSection}>
        <div className={styles.formWrapper}>
          <div className={styles.tabContainer}>
            <button 
              className={`${styles.tab} ${activeTab === 'login' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'signup' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign up
            </button>
          </div>

          <div className={styles.formContent}>
            {activeTab === 'login' ? (
              <LoginForm onSuccess={handleLoginSuccess} onSwitchTab={() => setActiveTab('signup')} />
            ) : (
              <SignupForm onSuccess={handleSignupSuccess} onSwitchTab={() => setActiveTab('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}