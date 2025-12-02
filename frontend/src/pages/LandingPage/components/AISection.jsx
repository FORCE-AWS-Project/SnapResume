import styles from './AISection.module.css'

export default function AISection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <p className={styles.label}>POWERED BY AI</p>
        <h2 className={styles.title}>Use AI to create a job-winning resume</h2>
        <p className={styles.description}>
          Let artificial intelligence do the heavy lifting. Our AI analyzes job postings and creates tailored resume content that resonates with recruiters.
        </p>
      </div>
    </section>
  )
}