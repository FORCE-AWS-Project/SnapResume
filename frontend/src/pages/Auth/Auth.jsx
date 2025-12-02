import { useState } from 'react'
import { Layout, Tabs, Form, Input, Button, Checkbox, Space, Divider } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import styles from './Auth.module.css'

const { Content } = Layout

export default function Auth() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('login')

  const handleLoginSuccess = () => navigate('/editor')
  const handleSignupSuccess = () => navigate('/editor')

  const tabs = [
    {
      key: 'login',
      label: <span className={activeTab === 'login' ? styles.activeTab : styles.inactiveTab}>Login</span>,
      children: <LoginForm onSuccess={handleLoginSuccess} onSwitchTab={() => setActiveTab('signup')} />
    },
    {
      key: 'signup',
      label: <span className={activeTab === 'signup' ? styles.activeTab : styles.inactiveTab}>Sign up</span>,
      children: <SignupForm onSuccess={handleSignupSuccess} onSwitchTab={() => setActiveTab('login')} />
    }
  ]

  return (
    <Layout className={styles.layout}>
      <Content className={styles.content}>
        <div className={styles.formContainer}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabs}
            tabBarStyle={{ borderBottom: 'none', marginBottom: 'var(--spacing-lg)' }}
          />
        </div>
      </Content>
    </Layout>
  )
}