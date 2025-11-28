import { Card, Divider, Space, Empty } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons'
import styles from './PreviewPanel.module.css'

export default function PreviewPanel({ data, templateId = 1, zoom = 100 }) {
  const isEmpty = !data.personalInfo.fullName && !data.personalInfo.email && !data.personalInfo.phone

  const previewStyle = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top center',
    transition: 'transform 0.2s ease',
  }

  return (
    <main className={styles.preview}>
      <div className={styles.previewWrapper} style={previewStyle}>
        {isEmpty ? (
          <Empty description="Start filling in your information to preview your resume" />
        ) : (
          <Card className={`${styles.card} ${styles[`template${templateId}`]}`}>
            {/* Header */}
            <div className={styles.header}>
              <h1 className={styles.name}>
                {data.personalInfo.fullName || 'Your Name'}
              </h1>
              {data.personalInfo.photoUrl && (
                <img src={data.personalInfo.photoUrl} alt="Profile" className={styles.photo} />
              )}
            </div>

            <Space wrap className={styles.contactInfo}>
              {data.personalInfo.email && (
                <span>
                  <MailOutlined /> {data.personalInfo.email}
                </span>
              )}
              {data.personalInfo.phone && (
                <span>
                  <PhoneOutlined /> {data.personalInfo.phone}
                </span>
              )}
              {data.personalInfo.location && (
                <span>
                  <EnvironmentOutlined /> {data.personalInfo.location}
                </span>
              )}
            </Space>

            {/* Professional Summary */}
            {data.personalInfo.summary && (
              <>
                <Divider />
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Professional Summary</h2>
                  <p className={styles.sectionContent}>{data.personalInfo.summary}</p>
                </div>
              </>
            )}

            {/* Work Experience */}
            {data.experience && data.experience.length > 0 && (
              <>
                <Divider />
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Work Experience</h2>
                  {data.experience.map((exp, index) => (
                    <div key={index} className={styles.item}>
                      <h3 className={styles.itemTitle}>{exp.position}</h3>
                      <p className={styles.itemSubtitle}>{exp.company}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
              <>
                <Divider />
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Education</h2>
                  {data.education.map((edu, index) => (
                    <div key={index} className={styles.item}>
                      <h3 className={styles.itemTitle}>{edu.degree}</h3>
                      <p className={styles.itemSubtitle}>{edu.school}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <>
                <Divider />
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Skills</h2>
                  <div className={styles.skillsList}>
                    {data.skills.map((skill, index) => (
                      <span key={index} className={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className={styles.placeholder}>
              Add more sections to expand your resume
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}