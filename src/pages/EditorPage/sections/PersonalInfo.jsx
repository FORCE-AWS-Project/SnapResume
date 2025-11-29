import { Form, Input, Button, Upload, Checkbox, Tooltip, Space, message } from 'antd'
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  LinkedinOutlined,
  GithubOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  UploadOutlined
} from '@ant-design/icons'
import styles from './PersonalInfo.module.css'

export default function PersonalInfo({ data, onInputChange }) {
  const [form] = Form.useForm()

  const handleLocationChange = (field, value) => {
    const currentLocation = data.personalInfo.location || { city: '', state: '', country: '' }
    onInputChange('personalInfo', 'location', {
      ...currentLocation,
      [field]: value
    })
  }

  const handleLinkChange = (field, value) => {
    const currentLinks = data.personalInfo.links || { linkedin: '', github: '', portfolio: '', website: '' }
    onInputChange('personalInfo', 'links', {
      ...currentLinks,
      [field]: value
    })
  }

  const handlePhotoUpload = (info) => {
    if (info.file.status !== 'uploading') {
      const url = URL.createObjectURL(info.file.originFileObj)
      onInputChange('personalInfo', 'photoUrl', url)
      message.success('Photo uploaded successfully')
    }
  }

  const location = data.personalInfo.location || { city: '', state: '', country: '' }
  const links = data.personalInfo.links || { linkedin: '', github: '', portfolio: '', website: '' }

  return (
    <Form form={form} layout="vertical" className={styles.form}>
      <h2 className={styles.title}>
        Personal Information
        <Tooltip title="This is your resume header - your identity block">
          <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
        </Tooltip>
      </h2>

      <Form.Item label="Full Name" required>
        <Input
          prefix={<UserOutlined />}
          placeholder="e.g., Jane Anderson"
          value={data.personalInfo.fullName}
          onChange={(e) => onInputChange('personalInfo', 'fullName', e.target.value)}
          size="large"
        />
      </Form.Item>

      <Form.Item 
        label={
          <span>
            Role Title{' '}
            <Tooltip title="Optional: Display your professional role under your name">
              <span style={{ fontSize: 12, fontWeight: 400, color: '#8c8c8c' }}>(Modern/Optional)</span>
            </Tooltip>
          </span>
        }
      >
        <Input
          placeholder="e.g., Senior Product Designer"
          value={data.personalInfo.roleTitle}
          onChange={(e) => onInputChange('personalInfo', 'roleTitle', e.target.value)}
        />
      </Form.Item>

      <Form.Item label={<span>Pronouns <span style={{ fontSize: 12, fontWeight: 400, color: '#8c8c8c' }}>(Optional)</span></span>}>
        <Input
          placeholder="e.g., she/her, he/him, they/them"
          value={data.personalInfo.pronouns}
          onChange={(e) => onInputChange('personalInfo', 'pronouns', e.target.value)}
        />
      </Form.Item>

      <Space.Compact style={{ width: '100%', marginBottom: 24 }}>
        <Form.Item label="Email" required style={{ flex: 1, marginBottom: 0 }}>
          <Input
            prefix={<MailOutlined />}
            type="email"
            placeholder="jane@example.com"
            value={data.personalInfo.email}
            onChange={(e) => onInputChange('personalInfo', 'email', e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Phone" required style={{ flex: 1, marginBottom: 0, marginLeft: 8 }}>
          <Input
            prefix={<PhoneOutlined />}
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={data.personalInfo.phone}
            onChange={(e) => onInputChange('personalInfo', 'phone', e.target.value)}
          />
        </Form.Item>
      </Space.Compact>

      <Form.Item 
        label={
          <span>
            Location{' '}
            <Tooltip title="For privacy, only include City, State, Country - not full address">
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          </span>
        }
      >
        <Space.Compact style={{ width: '100%' }}>
          <Input
            prefix={<EnvironmentOutlined />}
            placeholder="City"
            value={typeof location === 'string' ? location : location.city}
            onChange={(e) => handleLocationChange('city', e.target.value)}
            style={{ width: '40%' }}
          />
          <Input
            placeholder="State/Province"
            value={typeof location === 'string' ? '' : location.state}
            onChange={(e) => handleLocationChange('state', e.target.value)}
            style={{ width: '30%' }}
          />
          <Input
            placeholder="Country"
            value={typeof location === 'string' ? '' : location.country}
            onChange={(e) => handleLocationChange('country', e.target.value)}
            style={{ width: '30%' }}
          />
        </Space.Compact>
      </Form.Item>

      <Form.Item label="Professional Links">
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Input
            prefix={<LinkedinOutlined />}
            placeholder="https://linkedin.com/in/yourprofile"
            value={links.linkedin}
            onChange={(e) => handleLinkChange('linkedin', e.target.value)}
          />
          <Input
            prefix={<GithubOutlined />}
            placeholder="https://github.com/yourusername"
            value={links.github}
            onChange={(e) => handleLinkChange('github', e.target.value)}
          />
          <Input
            prefix={<GlobalOutlined />}
            placeholder="https://yourportfolio.com"
            value={links.portfolio}
            onChange={(e) => handleLinkChange('portfolio', e.target.value)}
          />
        </Space>
      </Form.Item>

      <Form.Item 
        label={
          <span>
            Professional Summary{' '}
            <Tooltip title="3-5 lines highlighting your expertise and value proposition">
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          </span>
        }
      >
        <Input.TextArea
          placeholder="e.g., Results-driven software engineer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud architecture. Led teams that improved system performance by 40% while reducing costs."
          value={data.personalInfo.summary}
          onChange={(e) => onInputChange('personalInfo', 'summary', e.target.value)}
          rows={4}
          showCount
          maxLength={500}
        />
        <div style={{ marginTop: 8, fontSize: 12, color: '#1890ff' }}>
          💡 Struggling with this? Consider using AI assistance to craft your summary
        </div>
      </Form.Item>

      <Form.Item label="Profile Photo">
        <Upload
          beforeUpload={() => false}
          onChange={handlePhotoUpload}
          maxCount={1}
          accept="image/*"
          showUploadList={!!data.personalInfo.photoUrl}
        >
          <Button icon={<UploadOutlined />}>Upload Photo</Button>
        </Upload>
        <Checkbox
          checked={data.personalInfo.showPhoto}
          onChange={(e) => onInputChange('personalInfo', 'showPhoto', e.target.checked)}
          style={{ marginTop: 8 }}
        >
          Show photo on resume
        </Checkbox>
        <div style={{ marginTop: 8, fontSize: 12, color: '#fa8c16', backgroundColor: '#fff7e6', padding: 8, borderRadius: 4 }}>
          <InfoCircleOutlined /> <strong>Regional Note:</strong> Photos are standard in Europe/Asia/LatAm 
          but discouraged in US/UK/Canada due to anti-discrimination laws.
        </div>
      </Form.Item>
    </Form>
  )
}