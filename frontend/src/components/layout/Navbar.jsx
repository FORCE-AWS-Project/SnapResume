import { useNavigate } from 'react-router-dom'
import { Button, Space, Dropdown, Avatar, Spin } from 'antd'
import { UserOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, loading } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleMenuClick = ({ key }) => {
    if (key === 'profile') {
      navigate('/profile')
    } else if (key === 'logout') {
      handleLogout()
    }
  }

  const userMenuItems = [
    {
      key: 'user-info',
      icon: <UserOutlined />,
      label: user?.name || user?.email || 'User',
      disabled: true,
      style: { cursor: 'default' }
    },
    {
      type: 'divider'
    },
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'My Profile'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true
    }
  ]

  if (loading) {
    return (
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.logoSection} onClick={() => navigate('/')}>
            <span className={styles.logoIcon}>✨</span>
            <span className={styles.logoText}>SnapResume</span>
          </div>
          <Spin size="small" />
        </div>
      </nav>
    )
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
          
          {isAuthenticated ? (
            <Dropdown 
              menu={{ items: userMenuItems, onClick: handleMenuClick }} 
              placement="bottomRight"
              trigger={['click']}
            >
              <Avatar 
                icon={<UserOutlined />} 
                className={styles.userAvatar}
                style={{ 
                  backgroundColor: '#d4a574',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                title={user?.name || user?.email}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
              </Avatar>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate('/auth')}>Sign in</Button>
          )}
        </Space>
      </div>
    </nav>
  )
}