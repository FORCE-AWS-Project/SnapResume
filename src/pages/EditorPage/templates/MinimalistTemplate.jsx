import { Space } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, LinkedinOutlined, GithubOutlined, GlobalOutlined } from '@ant-design/icons'
import styles from './MinimalistTemplate.module.css'
import sharedStyles from './SharedStyles.module.css'

export default function MinimalistTemplate({ data, formatLocation, formatDate, renderSectionContent }) {
    return (
        <div className={styles.template}>
            <div className={styles.header}>
                <h1 className={styles.name}>{data.personalInfo.fullName || 'Your Name'}</h1>
                {data.personalInfo.roleTitle && <p className={styles.roleTitle}>{data.personalInfo.roleTitle}</p>}
                <div className={styles.divider} />
                <Space wrap className={styles.contactInfo} size="middle" split="|">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>{formatLocation(data.personalInfo.location)}</span>}
                </Space>
                {(data.personalInfo.links?.linkedin || data.personalInfo.links?.github || data.personalInfo.links?.portfolio) && (
                    <Space wrap className={styles.links} size="middle" split="|">
                        {data.personalInfo.links.linkedin && <a href={data.personalInfo.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                        {data.personalInfo.links.github && <a href={data.personalInfo.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
                        {data.personalInfo.links.portfolio && <a href={data.personalInfo.links.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>}
                    </Space>
                )}
            </div>
            {data.personalInfo.summary && (
                <div className={styles.summary}>
                    <p className={styles.summaryText}>{data.personalInfo.summary}</p>
                </div>
            )}
            <div className={styles.content}>
                {renderSectionContent({ ...styles, ...sharedStyles })}
            </div>
        </div>
    )
}
