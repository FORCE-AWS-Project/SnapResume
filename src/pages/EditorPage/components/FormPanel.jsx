import PersonalInfo from '../sections/PersonalInfo'
import styles from './FormPanel.module.css'

export default function FormPanel({ data, onInputChange }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.content}>
        <PersonalInfo data={data} onInputChange={onInputChange} />
      </div>
    </aside>
  )
}