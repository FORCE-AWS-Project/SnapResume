import { Card, Divider, Space } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons'
import styles from './ResumePreviewPanel.module.css'

export default function ResumePreviewPanel({ data, zoom = 100, sectionOrder }) {
  const previewStyle = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top center',
    transition: 'transform 0.2s ease',
  }

  // Helper to safely render location
  const renderLocation = (location) => {
    if (!location) return null
    if (typeof location === 'object') {
      return [location.city, location.state, location.country].filter(Boolean).join(', ')
    }
    return location
  }

  const renderSection = (type) => {
    switch (type) {
      case 'experience':
        return data.experience && data.experience.length > 0 && (
          <div key="experience" className={styles.section}>
            <Divider />
            <h2 className={styles.sectionTitle}>Work Experience</h2>
            {data.experience.map((exp, index) => (
              <div key={index} className={styles.item}>
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemTitle}>{exp.jobTitle || exp.position}</h3>
                  {(exp.startDate || exp.endDate) && (
                    <span className={styles.itemDate}>
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  )}
                </div>
                <p className={styles.itemSubtitle}>
                  {exp.company}
                  {exp.location && ` • ${exp.location}`}
                </p>
                {exp.description && Array.isArray(exp.description) ? (
                  <ul className={styles.list}>
                    {exp.description.map((desc, i) => desc && <li key={i}>{desc}</li>)}
                  </ul>
                ) : (
                  <p className={styles.itemDescription}>{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )
      case 'education':
        return data.education && data.education.length > 0 && (
          <div key="education" className={styles.section}>
            <Divider />
            <h2 className={styles.sectionTitle}>Education</h2>
            {data.education.map((edu, index) => (
              <div key={index} className={styles.item}>
                <h3 className={styles.itemTitle}>{edu.degree} {edu.major && `in ${edu.major}`}</h3>
                <p className={styles.itemSubtitle}>{edu.institution || edu.school}</p>
                {edu.location && <p className={styles.itemMeta}>{edu.location}</p>}
                {edu.graduationYear && !edu.hideGradYear && <p className={styles.itemDate}>{edu.graduationYear}</p>}
              </div>
            ))}
          </div>
        )
      case 'skills':
        return data.skills && (
          (Array.isArray(data.skills) && data.skills.length > 0) ||
          (data.skills.categories && data.skills.categories.length > 0)
        ) && (
            <div key="skills" className={styles.section}>
              <Divider />
              <h2 className={styles.sectionTitle}>Skills</h2>
              <div className={styles.skillsList}>
                {Array.isArray(data.skills) ? (
                  data.skills.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))
                ) : (
                  data.skills.categories.map((cat, index) => cat.skills.length > 0 && (
                    <div key={index} style={{ marginBottom: 8, width: '100%' }}>
                      <strong>{cat.name}: </strong>
                      <span>{cat.skills.join(', ')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
      case 'certifications':
        return data.certifications && data.certifications.length > 0 && (
          <div key="certifications" className={styles.section}>
            <Divider />
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
        )
      case 'projects':
        return data.projects && data.projects.length > 0 && (
          <div key="projects" className={styles.section}>
            <Divider />
            <h2 className={styles.sectionTitle}>Projects</h2>
            {data.projects.map((project, index) => (
              <div key={index} className={styles.item}>
                <h3 className={styles.itemTitle}>{project.title}</h3>
                {project.role && <p className={styles.itemSubtitle}>{project.role}</p>}
                {project.description && (
                  <p className={styles.itemDescription}>{project.description}</p>
                )}
                {(project.url || project.github) && (
                  <div className={styles.links}>
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.link} style={{ marginRight: 12 }}>
                        Live Demo
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      case 'languages':
        return data.languages && data.languages.length > 0 && (
          <div key="languages" className={styles.section}>
            <Divider />
            <h2 className={styles.sectionTitle}>Languages</h2>
            <ul className={styles.list}>
              {data.languages.map((lang, index) => (
                <li key={index} className={styles.listItem}>
                  <strong>{lang.language}</strong> {lang.proficiency && `- ${lang.proficiency}`}
                </li>
              ))}
            </ul>
          </div>
        )
      case 'volunteering':
        return data.volunteering && data.volunteering.length > 0 && (
          <div key="volunteering" className={styles.section}>
            <Divider />
            <h2 className={styles.sectionTitle}>Volunteering</h2>
            {data.volunteering.map((vol, index) => (
              <div key={index} className={styles.item}>
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemTitle}>{vol.role}</h3>
                  {(vol.startDate || vol.endDate) && (
                    <span className={styles.itemDate}>
                      {vol.startDate} - {vol.current ? 'Present' : vol.endDate}
                    </span>
                  )}
                </div>
                <p className={styles.itemSubtitle}>
                  {vol.organization}
                  {vol.location && ` • ${vol.location}`}
                </p>
                {vol.description && Array.isArray(vol.description) && (
                  <ul className={styles.list}>
                    {vol.description.map((desc, i) => desc && <li key={i}>{desc}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )
      case 'publications':
        return data.publications && data.publications.length > 0 && (
          <div key="publications" className={styles.section}>
            <Divider />
            <h2 className={styles.sectionTitle}>Publications</h2>
            {data.publications.map((pub, index) => (
              <div key={index} className={styles.item}>
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemTitle}>{pub.title}</h3>
                  {pub.date && <span className={styles.itemDate}>{pub.date}</span>}
                </div>
                <p className={styles.itemSubtitle}>{pub.publisher}</p>
                {pub.description && <p className={styles.itemDescription}>{pub.description}</p>}
                {pub.url && <a href={pub.url} target="_blank" rel="noopener noreferrer" className={styles.link}>Link</a>}
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  // Define default order
  const defaultOrder = ['experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'volunteering', 'publications']
  // Use provided order or default
  const orderedSections = sectionOrder || defaultOrder

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
                  <EnvironmentOutlined /> {renderLocation(data.personalInfo.location)}
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

          {orderedSections.map(section => renderSection(section))}

        </Card>
      </div>
    </div>
  )
}
