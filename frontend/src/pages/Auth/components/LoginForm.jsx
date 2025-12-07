import { Form, Input, Button, Checkbox } from 'antd'
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
      <h2 className={styles.heading}>Welcome Back!</h2>
      <p className={styles.subtitle}>Log in to start creating stunning resumes with ease</p>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        requiredMark={false}
      >
        <Form.Item label="Email">
          <Input
            placeholder="Input your email"
            size="large"
            className={styles.input}
          />
        </Form.Item>

        <Form.Item label="Password">
          <Input.Password
            placeholder="Input your password"
            size="large"
            className={styles.input}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <div className={styles.rememberContainer}>
          <Checkbox>Remember me</Checkbox>
          <a href="#forgot" className={styles.link}>Forgot Password?</a>
        </div>

        <Button 
          type="primary" 
          htmlType="submit" 
          size="large" 
          block
          className={styles.submitBtn}
        >
          Login
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