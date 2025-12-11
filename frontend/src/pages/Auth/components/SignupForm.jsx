import { Form, Input, Button, Checkbox, message, Modal, InputNumber } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

import styles from './AuthForm.module.css'

export default function SignupForm({ onSuccess, onSwitchTab }) {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { signup, confirmSignUp, loading, error } = useAuth()
  const [signupEmail, setSignupEmail] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)

  const handleSubmit = async (values) => {
    try {
      if (values.password !== values.confirmPassword) {
        message.error('Passwords do not match!')
        return
      }

      await signup(values.email, values.password)
      setSignupEmail(values.email)
      setShowConfirmation(true)
      message.success('Sign up successful! Please check your email for confirmation code.')
    } catch (err) {
      message.error(err.message || 'Sign up failed. Please try again.')
    }
  }

  const handleConfirmation = async () => {
    try {
      if (!confirmationCode) {
        message.error('Please enter confirmation code!')
        return
      }

      setIsConfirming(true)
      await confirmSignUp(signupEmail, confirmationCode.toString())
      message.success('Email confirmed! Redirecting to templates...')
      setShowConfirmation(false)
      setConfirmationCode('')
      form.resetFields()
      // Auto-navigate to templates after confirmation
      setTimeout(() => {
        navigate('/templates')
      }, 1000)
      onSuccess()
    } catch (err) {
      message.error(err.message || 'Confirmation failed. Please check your code.')
    } finally {
      setIsConfirming(false)
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
            { min: 8, message: 'Password must be at least 8 characters!' }
          ]}
        >
          <Input.Password
            placeholder="Input your password"
            size="large"
            className={styles.input}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          rules={[
            { required: true, message: 'Please confirm your password!' }
          ]}
        >
          <Input.Password
            placeholder="Confirm your password"
            size="large"
            className={styles.input}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <div className={styles.termsContainer}>
          <Form.Item
            name="agree"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms!'))
              }
            ]}
          >
            <Checkbox>
              I agree to the <a href="#terms" className={styles.link}>Terms of Service</a> and <a href="#privacy" className={styles.link}>Privacy Policy</a>
            </Checkbox>
          </Form.Item>
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
          {loading ? 'Creating account...' : 'Sign up'}
        </Button>
      </Form>



      <p className={styles.switchText}>
        Already have an account? <a href="#login" onClick={(e) => { e.preventDefault(); onSwitchTab(); }} className={styles.link}>Log in here</a>
      </p>

      {/* Confirmation Modal */}
      <Modal
        title="Verify Email Address"
        open={showConfirmation}
        onOk={handleConfirmation}
        onCancel={() => setShowConfirmation(false)}
        okText="Confirm"
        cancelText="Cancel"
        confirmLoading={isConfirming}
      >
        <p>We sent a confirmation code to <strong>{signupEmail}</strong></p>
        <p>Please enter the code below:</p>
        <Form layout="vertical">
          <Form.Item label="Confirmation Code">
            <Input
              placeholder="Enter 6-digit code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              maxLength={6}
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}