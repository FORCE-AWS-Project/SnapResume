import { Layout, Button, Space } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()

  return (
    <Layout.Header className="header" style={{ 
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      padding: '0 2rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <span style={{ fontSize: '1.5rem' }}>📄</span>
        <h1 style={{ fontSize: '1.5rem', color: '#333', margin: 0 }}>SnapResume</h1>
      </div>
      <Space>
        <Button type="primary" icon={<SaveOutlined />}>
          Save
        </Button>
      </Space>
    </Layout.Header>
  )
}