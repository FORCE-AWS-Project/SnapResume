import { Form, Input, Button } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';

export default function Sidebar({ data, onInputChange }) {
  const [form] = Form.useForm();

  return (
    <aside
      style={{
        width: '35%',
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        overflowY: 'auto',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ maxWidth: '500px' }}>
        <Form form={form} layout="vertical" style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              fontSize: '1.1rem',
              marginBottom: '1rem',
              color: '#333',
            }}
          >
            Personal Information
          </h2>

          <Form.Item label="Full Name" required>
            <Input
              prefix={<UserOutlined />}
              placeholder="John Doe"
              value={data.personalInfo.fullName}
              onChange={(e) => onInputChange('personalInfo', 'fullName', e.target.value)}
              size="large"
            />
          </Form.Item>

          <Form.Item label="Email" required>
            <Input
              prefix={<MailOutlined />}
              type="email"
              placeholder="john@example.com"
              value={data.personalInfo.email}
              onChange={(e) => onInputChange('personalInfo', 'email', e.target.value)}
              size="large"
            />
          </Form.Item>

          <Form.Item label="Phone">
            <Input
              prefix={<PhoneOutlined />}
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={data.personalInfo.phone}
              onChange={(e) => onInputChange('personalInfo', 'phone', e.target.value)}
              size="large"
            />
          </Form.Item>

          <Form.Item label="Location">
            <Input
              prefix={<EnvironmentOutlined />}
              placeholder="New York, NY"
              value={data.personalInfo.location}
              onChange={(e) => onInputChange('personalInfo', 'location', e.target.value)}
              size="large"
            />
          </Form.Item>

          <Form.Item label="Professional Summary">
            <Input.TextArea
              placeholder="Brief summary about yourself..."
              value={data.personalInfo.summary}
              onChange={(e) => onInputChange('personalInfo', 'summary', e.target.value)}
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Button type="primary" block size="large">
            Add Experience
          </Button>
        </Form>
      </div>
    </aside>
  );
}