import { Form, Input, Button, Checkbox } from 'antd'
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
      <h2 className={styles.heading}>Get Started Free!</h2>
      <p className={styles.subtitle}>Create your account and start building amazing resumes</p>
      
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

        <Form.Item label="Confirm Password">
          <Input.Password
            placeholder="Confirm your password"
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

        <Button 
          type="primary" 
          htmlType="submit" 
          size="large" 
          block
          className={styles.submitBtn}
        >
          Sign up
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