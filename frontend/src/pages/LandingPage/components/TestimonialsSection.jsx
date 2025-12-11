import { Row, Col, Card } from 'antd'
import styles from './TestimonialsSection.module.css'

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      text: 'The AI-powered resume builder helped me land my dream job. The suggestions were incredibly accurate and tailored to my industry. Highly recommended!'
    },
    {
      name: 'Michael Chen',
      text: 'Best resume tool I\'ve used. The interface is intuitive and the AI recommendations actually helped me stand out. Got 3 job offers in 2 weeks!'
    },
    {
      name: 'Emily Rodriguez',
      text: 'Saved me so much time. Instead of struggling with formatting and content, I focused on highlighting my achievements. Worth every penny.'
    },
    {
      name: 'David Kim',
      text: 'The ATS scanner is a game-changer. I could see exactly what keywords I was missing. Changed my resume and immediately got more interview calls.'
    },
  ]

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <p className={styles.label}>WHAT OUR USERS SAY</p>
        <h2 className={styles.title}>What Our Users Say</h2>
        
        <Row gutter={[24, 24]}>
          {testimonials.map((testimonial, index) => (
            <Col xs={24} sm={12} key={index}>
              <Card className={styles.testimonialCard}>
                <p className={styles.stars}>★★★★★</p>
                <p className={styles.text}>{testimonial.text}</p>
                <p className={styles.author}>{testimonial.name}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  )
}