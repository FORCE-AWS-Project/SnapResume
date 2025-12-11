import { useNavigate } from 'react-router-dom'
import { Button, Space, Avatar, Dropdown } from 'antd'
import { UserOutlined, LogoutOutlined, FileTextOutlined } from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: 'Profile',
        icon: <UserOutlined />,
        onClick: () => navigate('/profile')
      },
      {
        key: 'resumes',
        label: 'My Resumes',
        icon: <FileTextOutlined />,
        onClick: () => navigate('/editor?new=false') // Or dashboard
      },
      {
        type: 'divider'
      },
      {
        key: 'logout',
        label: 'Sign Out',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: () => {
          logout()
          navigate('/')
        }
      }
    ]
  }

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

          {isAuthenticated && user ? (
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={user.photoUrl} />
                <span className={styles.userName}>{user.name || user.email?.split('@')[0]}</span>
              </Space>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate('/auth')}>Sign in</Button>
          )}
        </Space>
      </div>
    </nav>
  )
}