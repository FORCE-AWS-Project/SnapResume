import { Divider, Space } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, LinkedinOutlined, GithubOutlined, GlobalOutlined, LinkOutlined } from '@ant-design/icons'
import styles from './ModernBlueTemplate.module.css'
import sharedStyles from './SharedStyles.module.css'

export default function ModernBlueTemplate({ data, formatLocation, formatDate, renderSectionContent }) {
    return (
        <div className={styles.template}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    {data.personalInfo.showPhoto && data.personalInfo.photoUrl && (
                        <img src={data.personalInfo.photoUrl} alt="Profile" className={styles.photo} />
                    )}
                </div>
                <div className={styles.headerRight}>
                    <h1 className={styles.name}>{data.personalInfo.fullName || 'Your Name'}</h1>
                    {data.personalInfo.roleTitle && <p className={styles.roleTitle}>{data.personalInfo.roleTitle}</p>}
                    <Space wrap className={styles.contactInfo} size="small">
                        {data.personalInfo.email && <span><MailOutlined /> {data.personalInfo.email}</span>}
                        {data.personalInfo.phone && <span><PhoneOutlined /> {data.personalInfo.phone}</span>}
                        {data.personalInfo.location && <span><EnvironmentOutlined /> {formatLocation(data.personalInfo.location)}</span>}
                    </Space>
                    {(data.personalInfo.links?.linkedin || data.personalInfo.links?.github || data.personalInfo.links?.portfolio) && (
                        <Space wrap className={styles.links} size="small">
                            {data.personalInfo.links.linkedin && <a href={data.personalInfo.links.linkedin} target="_blank" rel="noopener noreferrer"><LinkedinOutlined /> LinkedIn</a>}
                            {data.personalInfo.links.github && <a href={data.personalInfo.links.github} target="_blank" rel="noopener noreferrer"><GithubOutlined /> GitHub</a>}
                            {data.personalInfo.links.portfolio && <a href={data.personalInfo.links.portfolio} target="_blank" rel="noopener noreferrer"><GlobalOutlined /> Portfolio</a>}
                        </Space>
                    )}
                </div>
            </div>
            {data.personalInfo.summary && (
                <div className={styles.summary}>
                    <h2 className={styles.sectionTitle}>PROFESSIONAL SUMMARY</h2>
                    <p className={styles.summaryText}>{data.personalInfo.summary}</p>
                </div>
            )}
            <div className={styles.content}>
                {renderSectionContent({ ...styles, ...sharedStyles })}
            </div>
        </div>
    )
}
