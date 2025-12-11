import { Card, Divider, Space } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons'
import styles from './ResumePreviewPanel.module.css'

export default function ResumePreviewPanel({ data, zoom = 100 }) {
  const previewStyle = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top center',
    transition: 'transform 0.2s ease',
  }

  return (
    <div className={styles.preview}>
      <div className={styles.previewWrapper} style={previewStyle}>
        <Card className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.name}>
              {data.personalInfo?.fullName || 'Your Name'}
            </h1>
            <Space wrap className={styles.contactInfo}>
              {data.personalInfo?.email && (
                <span>
                  <MailOutlined /> {data.personalInfo.email}
                </span>
              )}
              {data.personalInfo?.phone && (
                <span>
                  <PhoneOutlined /> {data.personalInfo.phone}
                </span>
              )}
              {data.personalInfo?.location && (
                <span>
                  <EnvironmentOutlined /> {data.personalInfo.location}
                </span>
              )}
            </Space>
          </div>

          {/* Professional Summary */}
          {data.personalInfo?.summary && (
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
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemTitle}>{exp.position}</h3>
                      {exp.endDate && (
                        <span className={styles.itemDate}>
                          {exp.startDate} - {exp.endDate}
                        </span>
                      )}
                    </div>
                    <p className={styles.itemSubtitle}>{exp.company}</p>
                    {exp.description && (
                      <p className={styles.itemDescription}>{exp.description}</p>
                    )}
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
                    {edu.field && (
                      <p className={styles.itemMeta}>Field: {edu.field}</p>
                    )}
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
                    <span key={index} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <>
              <Divider />
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Certifications</h2>
                <ul className={styles.list}>
                  {data.certifications.map((cert, index) => (
                    <li key={index} className={styles.listItem}>
                      <CheckCircleOutlined className={styles.checkIcon} />
                      {cert.name}
                      {cert.issuer && <span className={styles.issuer}> - {cert.issuer}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <>
              <Divider />
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Projects</h2>
                {data.projects.map((project, index) => (
                  <div key={index} className={styles.item}>
                    <h3 className={styles.itemTitle}>{project.title}</h3>
                    {project.description && (
                      <p className={styles.itemDescription}>{project.description}</p>
                    )}
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        View Project
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
