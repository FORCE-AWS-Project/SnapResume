import { Space } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, LinkedinOutlined, GithubOutlined, GlobalOutlined } from '@ant-design/icons'
import styles from './ExecutiveTemplate.module.css'
import sharedStyles from './SharedStyles.module.css'

export default function ExecutiveTemplate({ data, formatLocation, formatDate, renderSectionContent }) {
    return (
        <div className={styles.template}>
            <div className={styles.headerBar} />
            <div className={styles.header}>
                <div className={styles.nameSection}>
                    <h1 className={styles.name}>{data.personalInfo.fullName || 'Your Name'}</h1>
                    {data.personalInfo.roleTitle && <p className={styles.roleTitle}>{data.personalInfo.roleTitle}</p>}
                </div>
                <div className={styles.contactSection}>
                    {data.personalInfo.email && <div className={styles.contactItem}><MailOutlined /> {data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div className={styles.contactItem}><PhoneOutlined /> {data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div className={styles.contactItem}><EnvironmentOutlined /> {formatLocation(data.personalInfo.location)}</div>}
                    {data.personalInfo.links?.linkedin && <div className={styles.contactItem}><LinkedinOutlined /> <a href={data.personalInfo.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></div>}
                    {data.personalInfo.links?.github && <div className={styles.contactItem}><GithubOutlined /> <a href={data.personalInfo.links.github} target="_blank" rel="noopener noreferrer">GitHub</a></div>}
                    {data.personalInfo.links?.portfolio && <div className={styles.contactItem}><GlobalOutlined /> <a href={data.personalInfo.links.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a></div>}
                </div>
            </div>
            {data.personalInfo.summary && (
                <div className={styles.summary}>
                    <h2 className={styles.summaryTitle}>EXECUTIVE PROFILE</h2>
                    <p className={styles.summaryText}>{data.personalInfo.summary}</p>
                </div>
            )}
            <div className={styles.content}>
                {renderSectionContent({ ...styles, ...sharedStyles })}
            </div>
        </div>
    )
}
