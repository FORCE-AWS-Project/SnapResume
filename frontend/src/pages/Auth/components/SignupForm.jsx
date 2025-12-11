import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons'
import OAuthButtons from './OAuthButtons'
import { useAuth } from '../../../context/AuthContext'
import styles from './AuthForm.module.css'

export default function SignupForm({ onSuccess, onSwitchTab }) {
  const [form] = Form.useForm()
  const { signup, loading, error } = useAuth()

  const handleSubmit = async (values) => {
    try {
      await signup(values.email, values.password)
      message.success('Account created successfully! Please check your email for confirmation code.')
      onSuccess(values.email)
    } catch (err) {
      console.error("Signup error:", err);
      message.error(err.message || 'Signup failed. Please try again.')
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Get Started Free!</h2>
      <p className={styles.subtitle}>Create your account and start building amazing resumes</p>

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
            prefix={<MailOutlined />}
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 8, message: 'Password must be at least 8 characters!' },
            { pattern: /[A-Z]/, message: 'Must include at least one uppercase letter!' },
            { pattern: /[0-9]/, message: 'Must include at least one number!' },
            { pattern: /[!@#$%^&*]/, message: 'Must include at least one special character!' }
          ]}
        >
          <Input.Password
            placeholder="Input your password"
            size="large"
            className={styles.input}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            prefix={<LockOutlined />}
          />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'))
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Confirm your password"
            size="large"
            className={styles.input}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            prefix={<LockOutlined />}
          />
        </Form.Item>

        <div className={styles.termsContainer}>
          <Checkbox>
            I agree to the <a href="#terms" className={styles.link}>Terms of Service</a> and <a href="#privacy" className={styles.link}>Privacy Policy</a>
          </Checkbox>
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
          {loading ? 'Creating Account...' : 'Sign up'}
        </Button>
      </Form>

      <p className={styles.divider}>Or continue with</p>

      <OAuthButtons />

      <p className={styles.switchText}>
        Already have an account? <a href="#login" onClick={(e) => { e.preventDefault(); onSwitchTab(); }} className={styles.link}>Log in here</a>
      </p>
    </div>
  )
}