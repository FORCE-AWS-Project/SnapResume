import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Button, Space, Switch, Tabs, Tooltip } from 'antd'
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  RocketOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import styles from './PricingPage.module.css'
import { useState } from 'react'

export default function PricingPage() {
  const navigate = useNavigate()
  const [isAnnual, setIsAnnual] = useState(false)

  const pricingPlans = [
    {
      id: 1,
      name: 'Free',
      icon: '🎁',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for getting started',
      popular: false,
      cta: 'Get Started',
      features: [
        { name: 'Resume templates', included: 3, limit: '3 templates' },
        { name: 'AI suggestions', included: false },
        { name: 'ATS scanner', included: false },
        { name: 'Export to PDF', included: true },
        { name: 'Basic customization', included: true },
        { name: 'Up to 1 resume', included: true },
        { name: 'Email support', included: false },
        { name: 'Priority support', included: false },
      ]
    },
    {
      id: 2,
      name: 'Pro',
      icon: '⭐',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      description: 'Best for job seekers',
      popular: true,
      cta: 'Start Free Trial',
      features: [
        { name: 'Resume templates', included: true, limit: 'Unlimited' },
        { name: 'AI suggestions', included: true },
        { name: 'ATS scanner', included: true },
        { name: 'Export to PDF', included: true },
        { name: 'Full customization', included: true },
        { name: 'Up to 5 resumes', included: true },
        { name: 'Email support', included: true },
        { name: 'Priority support', included: false },
      ]
    },
    {
      id: 3,
      name: 'Business',
      icon: '👑',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      description: 'For serious job hunters',
      popular: false,
      cta: 'Start Free Trial',
      features: [
        { name: 'Resume templates', included: true, limit: 'Unlimited' },
        { name: 'AI suggestions', included: true },
        { name: 'ATS scanner', included: true },
        { name: 'Export to PDF', included: true },
        { name: 'Full customization', included: true },
        { name: 'Unlimited resumes', included: true },
        { name: 'Email support', included: true },
        { name: 'Priority support', included: true },
        { name: 'Interview trainer', included: true },
        { name: 'Cover letter generator', included: true },
        { name: 'Job matching', included: true },
        { name: 'LinkedIn optimization', included: true },
      ]
    }
  ]

  const faqs = [
    {
      question: 'Can I change or cancel my plan anytime?',
      answer: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time. If you cancel, you\'ll have access until the end of your billing period.'
    },
    {
      question: 'Do you offer discounts for annual billing?',
      answer: 'Yes! When you switch to annual billing, you\'ll save about 17% compared to monthly pricing. That\'s $99.99/year for Pro instead of $119.88.'
    },
    {
      question: 'Is there a free trial for paid plans?',
      answer: 'Yes, we offer a 7-day free trial for both Pro and Business plans. No credit card required to start your trial.'
    },
    {
      question: 'What happens to my resumes if I downgrade?',
      answer: 'All your resumes remain safe and accessible. You\'ll just have access to fewer features. You can upgrade anytime to get full functionality back.'
    },
    {
      question: 'Do you offer team or enterprise plans?',
      answer: 'Yes! For teams and enterprises, please contact our sales team at sales@snapresume.com for custom pricing.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay for maximum convenience.'
    }
  ]

  const getPrice = (plan) => {
    const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`
  }

  const getSubtext = (plan) => {
    if (plan.monthlyPrice === 0) return null
    return isAnnual ? '/year' : '/month'
  }

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Simple, Transparent Pricing</h1>
            <p className={styles.heroSubtitle}>
              Choose the perfect plan for your job search journey
            </p>
          </div>
        </section>

        {/* Billing Toggle */}
        <section className={styles.billingToggleSection}>
          <div className={styles.toggleContainer}>
            <span className={!isAnnual ? styles.active : ''}>Monthly</span>
            <Switch 
              checked={isAnnual}
              onChange={setIsAnnual}
              className={styles.toggle}
            />
            <span className={isAnnual ? styles.active : ''}>
              Annual 
              <span className={styles.saveBadge}>Save 17%</span>
            </span>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className={styles.pricingSection}>
          <div className={styles.sectionContainer}>
            <Row gutter={[32, 32]}>
              {pricingPlans.map((plan) => (
                <Col xs={24} sm={12} lg={8} key={plan.id}>
                  <Card 
                    className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''}`}
                    bordered={!plan.popular}
                  >
                    {plan.popular && (
                      <div className={styles.popularBadge}>Most Popular</div>
                    )}
                    
                    <div className={styles.planHeader}>
                      <div className={styles.planIcon}>{plan.icon}</div>
                      <h3 className={styles.planName}>{plan.name}</h3>
                      <p className={styles.planDescription}>{plan.description}</p>
                    </div>

                    <div className={styles.planPrice}>
                      <span className={styles.price}>{getPrice(plan)}</span>
                      {getSubtext(plan) && (
                        <span className={styles.period}>{getSubtext(plan)}</span>
                      )}
                    </div>

                    {plan.monthlyPrice > 0 && (
                      <p className={styles.trialText}>7-day free trial included</p>
                    )}

                    <Button 
                      type={plan.popular ? 'primary' : 'default'}
                      size="large"
                      block
                      className={styles.ctaButton}
                      onClick={() => navigate('/auth')}
                    >
                      {plan.cta}
                    </Button>

                    <div className={styles.featuresList}>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className={styles.featureItem}>
                          {feature.included ? (
                            <CheckCircleOutlined className={styles.checkIcon} />
                          ) : (
                            <CloseCircleOutlined className={styles.closeIcon} />
                          )}
                          <span className={feature.included ? '' : styles.disabled}>
                            {feature.name}
                            {feature.limit && (
                              <span className={styles.limit}>({feature.limit})</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Features Comparison */}
        <section className={styles.comparisonSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Detailed Comparison</h2>
            
            <div className={styles.comparisonTable}>
              <div className={styles.comparisonRow} style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}>
                <div className={styles.featureColumn}>Feature</div>
                <div className={styles.planColumn}>Free</div>
                <div className={styles.planColumn}>Pro</div>
                <div className={styles.planColumn}>Business</div>
              </div>

              {[
                { name: 'Resume Templates', free: '3', pro: 'Unlimited', business: 'Unlimited' },
                { name: 'AI Suggestions', free: 'No', pro: 'Yes', business: 'Yes' },
                { name: 'ATS Scanner', free: 'No', pro: 'Yes', business: 'Yes' },
                { name: 'PDF Export', free: 'Yes', pro: 'Yes', business: 'Yes' },
                { name: 'Cover Letter', free: 'No', pro: 'No', business: 'Yes' },
                { name: 'Interview Trainer', free: 'No', pro: 'No', business: 'Yes' },
                { name: 'Job Matching', free: 'No', pro: 'No', business: 'Yes' },
                { name: 'Priority Support', free: 'No', pro: 'No', business: 'Yes' },
              ].map((row, idx) => (
                <div key={idx} className={styles.comparisonRow}>
                  <div className={styles.featureColumn}>{row.name}</div>
                  <div className={styles.planColumn}>{row.free}</div>
                  <div className={styles.planColumn}>{row.pro}</div>
                  <div className={styles.planColumn}>{row.business}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.faqSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            
            <div className={styles.faqGrid}>
              {faqs.map((faq, idx) => (
                <div key={idx} className={styles.faqItem}>
                  <div className={styles.faqQuestion}>
                    <QuestionCircleOutlined className={styles.faqIcon} />
                    <h4>{faq.question}</h4>
                  </div>
                  <p className={styles.faqAnswer}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to accelerate your job search?</h2>
            <p className={styles.ctaSubtitle}>
              Start free today. No credit card required.
            </p>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/templates')}
            >
              Get Started Free
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}