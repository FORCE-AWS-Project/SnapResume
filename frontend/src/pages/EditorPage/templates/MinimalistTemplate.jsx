import { Space } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, LinkedinOutlined, GithubOutlined, GlobalOutlined } from '@ant-design/icons'
import styles from './MinimalistTemplate.module.css'
import sharedStyles from './SharedStyles.module.css'

export default function MinimalistTemplate({ data, formatLocation, formatDate, renderSectionContent }) {
    return (
        <div className={styles.template}>
            <div className={styles.header}>
                <h1 className={styles.name}>{data.personalInfo?.name || 'Your Name'}</h1>
                {data.personalInfo?.roleTitle && <p className={styles.roleTitle}>{data.personalInfo.roleTitle}</p>}
                <div className={styles.divider} />
                <Space wrap className={styles.contactInfo} size="middle" split="|">
                    {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
                    {data.personalInfo?.location && <span>{formatLocation(data.personalInfo.location)}</span>}
                </Space>
                {(data.personalInfo?.linkedin || data.personalInfo?.github || data.personalInfo?.portfolio) && (
                    <Space wrap className={styles.links} size="middle" split="|">
                        {data.personalInfo.linkedin && <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                        {data.personalInfo.github && <a href={data.personalInfo.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
                        {data.personalInfo.portfolio && <a href={data.personalInfo.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>}
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
