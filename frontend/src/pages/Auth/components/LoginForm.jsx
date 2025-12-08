import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import OAuthButtons from './OAuthButtons'
import styles from './AuthForm.module.css'

export default function LoginForm({ onSuccess, onSwitchTab }) {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { login, loading, error } = useAuth()

  const handleSubmit = async (values) => {
    try {
      await login(values.email, values.password)
      message.success('Login successful!')
      // Auto-navigate to templates page
      setTimeout(() => {
        navigate('/templates')
      }, 500)
      onSuccess()
    } catch (err) {
      message.error(err.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Welcome Back!</h2>
      <p className={styles.subtitle}>Log in to start creating stunning resumes with ease</p>
      
      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '4px',
          color: '#d4380d',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        requiredMark={false}
      >
        <Form.Item 
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input
            placeholder="Input your email"
            size="large"
            className={styles.input}
            prefix={<UserOutlined />}
          />
        </Form.Item>

        <Form.Item 
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' }
          ]}
        >
          <Input.Password
            placeholder="Input your password"
            size="large"
            className={styles.input}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <div className={styles.rememberContainer}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <a href="#forgot" className={styles.link}>Forgot Password?</a>
        </div>

        <Button 
          type="primary" 
          htmlType="submit" 
          size="large" 
          block
          className={styles.submitBtn}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>

      <p className={styles.divider}>Or continue with</p>

      <OAuthButtons />

      <p className={styles.switchText}>
        Don't have an account? <a href="#signup" onClick={(e) => { e.preventDefault(); onSwitchTab(); }} className={styles.link}>Sign up here</a>
      </p>
    </div>
  )
}