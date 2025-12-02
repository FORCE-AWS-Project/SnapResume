import { Card, Empty } from 'antd'
import { LinkOutlined } from '@ant-design/icons'
import ModernBlueTemplate from '../templates/ModernBlueTemplate'
import MinimalistTemplate from '../templates/MinimalistTemplate'
import CreativeTemplate from '../templates/CreativeTemplate'
import ExecutiveTemplate from '../templates/ExecutiveTemplate'
import TechTemplate from '../templates/TechTemplate'
import DesignerTemplate from '../templates/DesignerTemplate'
import styles from './PreviewPanel.module.css'

export default function PreviewPanel({ data, templateId = 1, zoom = 100, sectionOrder }) {
  const isEmpty = !data.personalInfo.fullName && !data.personalInfo.email && !data.personalInfo.phone
  const previewStyle = { transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }
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
  const renderSectionContent = (templateStyles) => {
    const defaultOrder = ['experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'volunteering', 'publications']
    const orderedSections = sectionOrder || defaultOrder
    return orderedSections.map(sectionKey => {
      switch (sectionKey) {
        case 'experience':
          return data.experience?.length > 0 && (
            <div key="experience" className={templateStyles.section} style={{ marginBottom: '24px' }}>
              <h2 className={templateStyles.sectionTitle || styles.sectionTitle}>WORK EXPERIENCE</h2>
              {data.experience.map((exp, index) => (
                <div key={exp.id || index} className={templateStyles.item || styles.item} style={{ marginBottom: '16px' }}>
                  <div className={templateStyles.itemHeader || styles.itemHeader} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <h3 className={templateStyles.itemTitle || styles.itemTitle} style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>{exp.jobTitle}</h3>
                      <p className={templateStyles.itemSubtitle || styles.itemSubtitle} style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                        <strong>{exp.company}</strong>
                        {exp.location && ` • ${exp.location}`}
                        {exp.locationType && ` (${exp.locationType})`}
                      </p>
                    </div>
                    <div className={templateStyles.itemDate || styles.itemDate} style={{ fontSize: '13px', color: '#8c8c8c', fontStyle: 'italic' }}>
                      {exp.startDate && formatDate(exp.startDate)}
                      {' - '}
                      {exp.current ? 'Present' : (exp.endDate && formatDate(exp.endDate))}
                    </div>
                  </div>
                  {exp.description?.length > 0 && (
                    <ul className={templateStyles.bulletList || styles.bulletList} style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                      {exp.description.map((bullet, i) => (
                        bullet && <li key={i} style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '4px' }}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )
        case 'education':
          return data.education?.length > 0 && (
            <div key="education" className={templateStyles.section} style={{ marginBottom: '24px' }}>
              <h2 className={templateStyles.sectionTitle || styles.sectionTitle}>EDUCATION</h2>
              {data.education.map((edu, index) => (
                <div key={edu.id || index} className={templateStyles.item || styles.item} style={{ marginBottom: '16px' }}>
                  <div className={templateStyles.itemHeader || styles.itemHeader} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 className={templateStyles.itemTitle || styles.itemTitle} style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>
                        {edu.degree}{edu.major && ` in ${edu.major}`}
                      </h3>
                      <p className={templateStyles.itemSubtitle || styles.itemSubtitle} style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                        <strong>{edu.institution}</strong>
                        {edu.location && ` • ${edu.location}`}
                      </p>
                      {(edu.gpa || edu.honors) && (
                        <p className={templateStyles.itemDetail || styles.itemDetail} style={{ fontSize: '13px', color: '#8c8c8c', margin: '4px 0' }}>
                          {edu.gpa && `GPA: ${edu.gpa}`}
                          {edu.gpa && edu.honors && ' • '}
                          {edu.honors}
                        </p>
                      )}
                    </div>
                    {edu.graduationYear && !edu.hideGradYear && (
                      <div className={templateStyles.itemDate || styles.itemDate} style={{ fontSize: '13px', color: '#8c8c8c', fontStyle: 'italic' }}>{edu.graduationYear}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        case 'skills':
          return data.skills?.categories?.length > 0 && (
            <div key="skills" className={templateStyles.section} style={{ marginBottom: '24px' }}>
              <h2 className={templateStyles.sectionTitle || styles.sectionTitle}>SKILLS</h2>
              {data.skills.categories.map((category, index) => (
                category.skills.length > 0 && (
                  <div key={category.id || index} style={{ marginBottom: '8px', lineHeight: '1.7' }}>
                    <strong style={{ fontSize: '14px', color: '#262626', marginRight: '8px' }}>{category.name}:</strong>
                    <span style={{ fontSize: '14px', color: '#595959' }}>{category.skills.join(' • ')}</span>
                  </div>
                )
              ))}
            </div>
          )
        case 'projects':
          return data.projects?.length > 0 && (
            <div key="projects" className={templateStyles.section} style={{ marginBottom: '24px' }}>
              <h2 className={templateStyles.sectionTitle || styles.sectionTitle}>PROJECTS</h2>
              {data.projects.map((project, index) => (
                <div key={project.id || index} className={templateStyles.item || styles.item} style={{ marginBottom: '16px' }}>
                  <h3 className={templateStyles.itemTitle || styles.itemTitle} style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>
                    {project.title}
                    {project.role && ` - ${project.role}`}
                  </h3>
                  {project.techStack?.length > 0 && (
                    <p style={{ fontSize: '13px', color: '#8c8c8c', margin: '4px 0', fontStyle: 'italic' }}>
                      Technologies: {project.techStack.join(', ')}
                    </p>
                  )}
                  {project.description && (
                    <p style={{ fontSize: '14px', color: '#595959', lineHeight: '1.6', margin: '6px 0' }}>{project.description}</p>
                  )}
                  {(project.url || project.github) && (
                    <p style={{ fontSize: '13px', margin: '6px 0' }}>
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', textDecoration: 'none' }}>
                          <LinkOutlined /> Live Demo
                        </a>
                      )}
                      {project.url && project.github && ' • '}
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', textDecoration: 'none' }}>
                          <LinkOutlined /> GitHub
                        </a>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        case 'certifications':
          return data.certifications?.length > 0 && (
            <div key="certifications" className={templateStyles.section} style={{ marginBottom: '24px' }}>
              <h2 className={templateStyles.sectionTitle || styles.sectionTitle}>CERTIFICATIONS</h2>
              {data.certifications.map((cert, index) => (
                <div key={cert.id || index} className={templateStyles.item || styles.item} style={{ marginBottom: '16px' }}>
                  <div className={templateStyles.itemHeader || styles.itemHeader} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 className={templateStyles.itemTitle || styles.itemTitle} style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>{cert.name}</h3>
                      <p className={templateStyles.itemSubtitle || styles.itemSubtitle} style={{ fontSize: '14px', color: '#666', margin: 0 }}>{cert.issuer}</p>
                      {cert.credentialId && (
                        <p style={{ fontSize: '13px', color: '#8c8c8c', margin: '4px 0' }}>Credential ID: {cert.credentialId}</p>
                      )}
                    </div>
                    <div className={templateStyles.itemDate || styles.itemDate} style={{ fontSize: '13px', color: '#8c8c8c', fontStyle: 'italic' }}>
                      {cert.issueDate && formatDate(cert.issueDate)}
                      {cert.expiryDate && ` - ${formatDate(cert.expiryDate)}`}
                    </div>
                  </div>
                  {cert.credentialUrl && (
                    <p style={{ fontSize: '13px', margin: '6px 0' }}>
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', textDecoration: 'none' }}>
                        <LinkOutlined /> Verify Credential
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        case 'languages':
          return data.languages?.length > 0 && (
            <div key="languages" className={templateStyles.section} style={{ marginBottom: '24px' }}>
              <h2 className={templateStyles.sectionTitle || styles.sectionTitle}>LANGUAGES</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {data.languages.map((lang, index) => (
                  <span key={lang.id || index} style={{ fontSize: '14px', color: '#595959' }}>
                    <strong>{lang.language}</strong> - {lang.proficiency}
                  </span>
                ))}
              </div>
            </div>
          )
        case 'volunteering':
          return data.volunteering?.length > 0 && (
            <div key="volunteering" className={templateStyles.section} style={{ marginBottom: '24px' }}>
              <h2 className={templateStyles.sectionTitle || styles.sectionTitle}>VOLUNTEERING</h2>
              {data.volunteering.map((vol, index) => (
                <div key={vol.id || index} className={templateStyles.item || styles.item} style={{ marginBottom: '16px' }}>
                  <div className={templateStyles.itemHeader || styles.itemHeader} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <h3 className={templateStyles.itemTitle || styles.itemTitle} style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>{vol.role}</h3>
                      <p className={templateStyles.itemSubtitle || styles.itemSubtitle} style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                        <strong>{vol.organization}</strong>
                        {vol.location && ` • ${vol.location}`}
                      </p>
                    </div>
                    <div className={templateStyles.itemDate || styles.itemDate} style={{ fontSize: '13px', color: '#8c8c8c', fontStyle: 'italic' }}>
                      {vol.startDate && formatDate(vol.startDate)}
                      {' - '}
                      {vol.current ? 'Present' : (vol.endDate && formatDate(vol.endDate))}
                    </div>
                  </div>
                  {vol.description?.length > 0 && (
                    <ul className={templateStyles.bulletList || styles.bulletList} style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                      {vol.description.map((bullet, i) => (
                        bullet && <li key={i} style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '4px' }}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )
        case 'publications':
          return data.publications?.length > 0 && (
            <div key="publications" className={templateStyles.section} style={{ marginBottom: '24px' }}>
              <h2 className={templateStyles.sectionTitle || styles.sectionTitle}>PUBLICATIONS & SPEAKING</h2>
              {data.publications.map((pub, index) => (
                <div key={pub.id || index} className={templateStyles.item || styles.item} style={{ marginBottom: '16px' }}>
                  <div className={templateStyles.itemHeader || styles.itemHeader} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 className={templateStyles.itemTitle || styles.itemTitle} style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>{pub.title}</h3>
                      <p className={templateStyles.itemSubtitle || styles.itemSubtitle} style={{ fontSize: '14px', color: '#666', margin: 0 }}>{pub.publisher}</p>
                      {pub.description && (
                        <p style={{ fontSize: '14px', color: '#595959', lineHeight: '1.6', margin: '6px 0' }}>{pub.description}</p>
                      )}
                    </div>
                    <div className={templateStyles.itemDate || styles.itemDate} style={{ fontSize: '13px', color: '#8c8c8c', fontStyle: 'italic' }}>
                      {pub.date && formatDate(pub.date)}
                    </div>
                  </div>
                  {pub.url && (
                    <p style={{ fontSize: '13px', margin: '6px 0' }}>
                      <a href={pub.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', textDecoration: 'none' }}>
                        <LinkOutlined /> View Publication
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        default:
          return null
      }
    })
  }
  const renderTemplate = () => {
    const templateProps = { data, formatLocation, formatDate, renderSectionContent }
    switch (templateId) {
      case 1: return <ModernBlueTemplate {...templateProps} />
      case 2: return <MinimalistTemplate {...templateProps} />
      case 3: return <CreativeTemplate {...templateProps} />
      case 4: return <ExecutiveTemplate {...templateProps} />
      case 5: return <TechTemplate {...templateProps} />
      case 6: return <DesignerTemplate {...templateProps} />
      default: return <ModernBlueTemplate {...templateProps} />
    }
  }
  return (
    <main className={styles.preview}>
      <div className={styles.previewWrapper} style={previewStyle}>
        {isEmpty ? (
          <Empty description="Start filling in your information to preview your resume" />
        ) : (
          <Card className={styles.card}>
            {renderTemplate()}
          </Card>
        )}
      </div>
    </main>
  )
}
