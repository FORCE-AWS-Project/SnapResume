import { Form, Input, Button, Checkbox, Space, Divider } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import OAuthButtons from './OAuthButtons'
import styles from './AuthForm.module.css'

export default function LoginForm({ onSuccess, onSwitchTab }) {
  const [form] = Form.useForm()

  const handleSubmit = (values) => {
    console.log('Login:', values)
    onSuccess()
  }

  return (
    <div className={styles.container}>
      <p className={styles.subtitle}>Login to continue learning with us!</p>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Please enter your email, username, or phone number' }]}
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
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
            className={styles.input}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <div className={styles.rememberContainer}>
          <Checkbox>Remember me</Checkbox>
          <a href="#forgot" className={styles.link}>Trouble login in?</a>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block>
            Login!
          </Button>
        </Form.Item>
      </Form>

      <Divider className={styles.divider}>OR</Divider>

      <OAuthButtons />

      <p className={styles.switchText}>
        Don't have an account? <a href="#signup" onClick={(e) => { e.preventDefault(); onSwitchTab(); }} className={styles.link}>Sign up</a>
      </p>
    </div>
  )
}