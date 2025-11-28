import { Row, Col, Card, Button } from 'antd'
import styles from './PricingSection.module.css'

export default function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '',
      features: ['Basic resume builder', '3 templates', 'Export to PDF'],
      buttonText: 'Get Started',
      isPrimary: false
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      features: ['All Free features', 'AI-powered suggestions', 'Unlimited templates', 'ATS scanner', 'Priority support'],
      buttonText: 'Start Free Trial',
      isPrimary: true,
      badge: 'Most Popular'
    },
    {
      name: 'Business',
      price: '$19.99',
      period: '/month',
      features: ['All Pro features', 'Interview trainer', 'Job tracking', 'Analytics dashboard'],
      buttonText: 'Get Started',
      isPrimary: false
    }
  ]

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Choose the plan that fits your needs</h2>
        <p className={styles.subtitle}>
          Start free for now and upgrade when you're ready to unlock advanced features.
        </p>
        
        <Row gutter={[24, 24]}>
          {plans.map((plan, index) => (
            <Col xs={24} sm={8} key={index}>
              <Card className={`${styles.planCard} ${plan.isPrimary ? styles.featured : ''}`}>
                {plan.badge && <div className={styles.badge}>{plan.badge}</div>}
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.price}>
                  {plan.price}
                  {plan.period && <span className={styles.period}>{plan.period}</span>}
                </p>
                <ul className={styles.features}>
                  {plan.features.map((feature, i) => (
                    <li key={i}>✓ {feature}</li>
                  ))}
                </ul>
                <Button type={plan.isPrimary ? 'primary' : 'default'} block size="large">
                  {plan.buttonText}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  )
}