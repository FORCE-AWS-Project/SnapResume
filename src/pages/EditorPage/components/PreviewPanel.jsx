import { Card, Divider, Space, Empty, Tag } from 'antd'
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LinkedinOutlined,
  GithubOutlined,
  GlobalOutlined,
  LinkOutlined
} from '@ant-design/icons'
import styles from './PreviewPanel.module.css'

export default function PreviewPanel({ data, templateId = 1, zoom = 100, sectionOrder }) {
  const isEmpty = !data.personalInfo.fullName && !data.personalInfo.email && !data.personalInfo.phone

  const previewStyle = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top center',
    transition: 'transform 0.2s ease',
  }

  const formatLocation = (location) => {
    if (typeof location === 'string') return location
    const parts = [location.city, location.state, location.country].filter(Boolean)
    return parts.join(', ')
  }

  const formatDate = (date) => {
    if (!date) return ''
    const [year, month] = date.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(month) - 1]} ${year}`
  }

  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case 'experience':
        return data.experience?.length > 0 && (
          <>
            <Divider className={styles.divider} />
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>WORK EXPERIENCE</h2>
              {data.experience.map((exp, index) => (
                <div key={exp.id || index} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <div>
                      <h3 className={styles.itemTitle}>{exp.jobTitle}</h3>
                      <p className={styles.itemSubtitle}>
                        <strong>{exp.company}</strong>
                        {exp.location && ` • ${exp.location}`}
                        {exp.locationType && ` (${exp.locationType})`}
                      </p>
                    </div>
                    <div className={styles.itemDate}>
                      {exp.startDate && formatDate(exp.startDate)}
                      {' - '}
                      {exp.current ? 'Present' : (exp.endDate && formatDate(exp.endDate))}
                    </div>
                  </div>
                  {exp.description?.length > 0 && (
                    <ul className={styles.bulletList}>
                      {exp.description.map((bullet, i) => (
                        bullet && <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </>
        )

      case 'education':
        return data.education?.length > 0 && (
          <>
            <Divider className={styles.divider} />
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>EDUCATION</h2>
              {data.education.map((edu, index) => (
                <div key={edu.id || index} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <div>
                      <h3 className={styles.itemTitle}>
                        {edu.degree}{edu.major && ` in ${edu.major}`}
                      </h3>
                      <p className={styles.itemSubtitle}>
                        <strong>{edu.institution}</strong>
                        {edu.location && ` • ${edu.location}`}
                      </p>
                      {(edu.gpa || edu.honors) && (
                        <p className={styles.itemDetail}>
                          {edu.gpa && `GPA: ${edu.gpa}`}
                          {edu.gpa && edu.honors && ' • '}
                          {edu.honors}
                        </p>
                      )}
                    </div>
                    {edu.graduationYear && !edu.hideGradYear && (
                      <div className={styles.itemDate}>{edu.graduationYear}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )

      case 'skills':
        return data.skills?.categories?.length > 0 && (
          <>
            <Divider className={styles.divider} />
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>SKILLS</h2>
              {data.skills.categories.map((category, index) => (
                category.skills.length > 0 && (
                  <div key={category.id || index} className={styles.skillCategory}>
                    <strong className={styles.skillCategoryName}>{category.name}:</strong>
                    <span className={styles.skillsList}>
                      {category.skills.join(' • ')}
                    </span>
                  </div>
                )
              ))}
            </div>
          </>
        )

      case 'projects':
        return data.projects?.length > 0 && (
          <>
            <Divider className={styles.divider} />
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>PROJECTS</h2>
              {data.projects.map((project, index) => (
                <div key={project.id || index} className={styles.item}>
                  <h3 className={styles.itemTitle}>
                    {project.title}
                    {project.role && ` - ${project.role}`}
                  </h3>
                  {project.techStack?.length > 0 && (
                    <p className={styles.itemDetail}>
                      <em>Technologies: {project.techStack.join(', ')}</em>
                    </p>
                  )}
                  {project.description && (
                    <p className={styles.itemContent}>{project.description}</p>
                  )}
                  {(project.url || project.github) && (
                    <p className={styles.itemLinks}>
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                          <LinkOutlined /> Live Demo
                        </a>
                      )}
                      {project.url && project.github && ' • '}
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                          <GithubOutlined /> GitHub
                        </a>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )

      case 'certifications':
        return data.certifications?.length > 0 && (
          <>
            <Divider className={styles.divider} />
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>CERTIFICATIONS</h2>
              {data.certifications.map((cert, index) => (
                <div key={cert.id || index} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <div>
                      <h3 className={styles.itemTitle}>{cert.name}</h3>
                      <p className={styles.itemSubtitle}>{cert.issuer}</p>
                      {cert.credentialId && (
                        <p className={styles.itemDetail}>Credential ID: {cert.credentialId}</p>
                      )}
                    </div>
                    <div className={styles.itemDate}>
                      {cert.issueDate && formatDate(cert.issueDate)}
                      {cert.expiryDate && ` - ${formatDate(cert.expiryDate)}`}
                    </div>
                  </div>
                  {cert.credentialUrl && (
                    <p className={styles.itemLinks}>
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                        <LinkOutlined /> Verify Credential
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )

      case 'languages':
        return data.languages?.length > 0 && (
          <>
            <Divider className={styles.divider} />
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>LANGUAGES</h2>
              <div className={styles.languagesList}>
                {data.languages.map((lang, index) => (
                  <span key={lang.id || index} className={styles.languageItem}>
                    <strong>{lang.language}</strong> - {lang.proficiency}
                  </span>
                ))}
              </div>
            </div>
          </>
        )

      case 'volunteering':
        return data.volunteering?.length > 0 && (
          <>
            <Divider className={styles.divider} />
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>VOLUNTEERING</h2>
              {data.volunteering.map((vol, index) => (
                <div key={vol.id || index} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <div>
                      <h3 className={styles.itemTitle}>{vol.role}</h3>
                      <p className={styles.itemSubtitle}>
                        <strong>{vol.organization}</strong>
                        {vol.location && ` • ${vol.location}`}
                      </p>
                    </div>
                    <div className={styles.itemDate}>
                      {vol.startDate && formatDate(vol.startDate)}
                      {' - '}
                      {vol.current ? 'Present' : (vol.endDate && formatDate(vol.endDate))}
                    </div>
                  </div>
                  {vol.description?.length > 0 && (
                    <ul className={styles.bulletList}>
                      {vol.description.map((bullet, i) => (
                        bullet && <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </>
        )

      case 'publications':
        return data.publications?.length > 0 && (
          <>
            <Divider className={styles.divider} />
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>PUBLICATIONS & SPEAKING</h2>
              {data.publications.map((pub, index) => (
                <div key={pub.id || index} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <div>
                      <h3 className={styles.itemTitle}>{pub.title}</h3>
                      <p className={styles.itemSubtitle}>{pub.publisher}</p>
                      {pub.description && (
                        <p className={styles.itemContent}>{pub.description}</p>
                      )}
                    </div>
                    <div className={styles.itemDate}>
                      {pub.date && formatDate(pub.date)}
                    </div>
                  </div>
                  {pub.url && (
                    <p className={styles.itemLinks}>
                      <a href={pub.url} target="_blank" rel="noopener noreferrer">
                        <LinkOutlined /> View Publication
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )

      default:
        return null
    }
  }

  const defaultOrder = ['experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'volunteering', 'publications']
  const orderedSections = sectionOrder || defaultOrder

  return (
    <main className={styles.preview}>
      <div className={styles.previewWrapper} style={previewStyle}>
        {isEmpty ? (
          <Empty description="Start filling in your information to preview your resume" />
        ) : (
          <Card className={`${styles.card} ${styles[`template${templateId}`]}`}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h1 className={styles.name}>
                  {data.personalInfo.fullName || 'Your Name'}
                </h1>
                {data.personalInfo.roleTitle && (
                  <p className={styles.roleTitle}>{data.personalInfo.roleTitle}</p>
                )}
                {data.personalInfo.pronouns && (
                  <p className={styles.pronouns}>({data.personalInfo.pronouns})</p>
                )}
              </div>
              {data.personalInfo.showPhoto && data.personalInfo.photoUrl && (
                <img src={data.personalInfo.photoUrl} alt="Profile" className={styles.photo} />
              )}
            </div>

            {/* Contact Info */}
            <Space wrap className={styles.contactInfo} size="middle">
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
                  <EnvironmentOutlined /> {formatLocation(data.personalInfo.location)}
                </span>
              )}
            </Space>

            {/* Professional Links */}
            {(data.personalInfo.links?.linkedin || data.personalInfo.links?.github || data.personalInfo.links?.portfolio) && (
              <Space wrap className={styles.links} size="middle">
                {data.personalInfo.links.linkedin && (
                  <a href={data.personalInfo.links.linkedin} target="_blank" rel="noopener noreferrer">
                    <LinkedinOutlined /> LinkedIn
                  </a>
                )}
                {data.personalInfo.links.github && (
                  <a href={data.personalInfo.links.github} target="_blank" rel="noopener noreferrer">
                    <GithubOutlined /> GitHub
                  </a>
                )}
                {data.personalInfo.links.portfolio && (
                  <a href={data.personalInfo.links.portfolio} target="_blank" rel="noopener noreferrer">
                    <GlobalOutlined /> Portfolio
                  </a>
                )}
              </Space>
            )}

            {/* Professional Summary */}
            {data.personalInfo.summary && (
              <>
                <Divider className={styles.divider} />
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>PROFESSIONAL SUMMARY</h2>
                  <p className={styles.summaryContent}>{data.personalInfo.summary}</p>
                </div>
              </>
            )}

            {/* Dynamic Sections Based on Order */}
            {orderedSections.map(section => (
              <div key={section}>
                {renderSection(section)}
              </div>
            ))}
          </Card>
        )}
      </div>
    </main>
  )
}