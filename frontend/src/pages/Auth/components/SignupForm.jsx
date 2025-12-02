import { Form, Input, Button, Checkbox, Divider } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import OAuthButtons from './OAuthButtons'
import styles from './AuthForm.module.css'

export default function SignupForm({ onSuccess, onSwitchTab }) {
  const [form] = Form.useForm()

  const handleSubmit = (values) => {
    console.log('Signup:', values)
    onSuccess()
  }

  return (
    <div className={styles.container}>
      <p className={styles.subtitle}>Sign up for free!</p>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email/Username/Phone number"
            size="large"
            className={styles.input}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please enter your password' },
            { min: 8, message: 'Password must be at least 8 characters' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
            className={styles.input}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Passwords do not match'))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm your Password"
            size="large"
            className={styles.input}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <div className={styles.termsContainer}>
          <Checkbox>
            I agree to the <a href="#terms" className={styles.link}>Terms of Service</a> and <a href="#privacy" className={styles.link}>Privacy Policy</a>
          </Checkbox>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block>
            Sign up now!
          </Button>
        </Form.Item>
      </Form>

      <Divider className={styles.divider}>OR</Divider>

      <OAuthButtons />

      <p className={styles.switchText}>
        Already have an account? <a href="#login" onClick={(e) => { e.preventDefault(); onSwitchTab(); }} className={styles.link}>Login</a>
      </p>
    </div>
  )
}