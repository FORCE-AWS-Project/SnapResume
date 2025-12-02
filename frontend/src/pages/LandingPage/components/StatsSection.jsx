import { Row, Col, Card, Statistic } from 'antd'
import { useState } from 'react'
import styles from './StatsSection.module.css'

export default function StatsSection() {
  const [stats] = useState({
    resumes: 325989,
    jobs: 83569,
    users: 112568,
  })

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <p className={styles.label}>THE NUMBERS SPEAK FOR THEMSELVES</p>
        <h2 className={styles.title}>Empowering Job Seekers Worldwide</h2>
        
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={8}>
            <Card className={styles.statCard}>
              <Statistic
                title={<span className={styles.statLabel}>Resumes Created</span>}
                value={stats.resumes}
                valueStyle={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}
                formatter={(val) => val.toLocaleString()}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className={styles.statCard}>
              <Statistic
                title={<span className={styles.statLabel}>Jobs Applied</span>}
                value={stats.jobs}
                valueStyle={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}
                formatter={(val) => val.toLocaleString()}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className={styles.statCard}>
              <Statistic
                title={<span className={styles.statLabel}>Happy Users</span>}
                value={stats.users}
                valueStyle={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}
                formatter={(val) => val.toLocaleString()}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  )
}