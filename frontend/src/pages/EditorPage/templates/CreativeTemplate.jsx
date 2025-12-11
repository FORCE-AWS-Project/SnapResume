import { Space } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, LinkedinOutlined, GithubOutlined, GlobalOutlined } from '@ant-design/icons'
import styles from './CreativeTemplate.module.css'
import sharedStyles from './SharedStyles.module.css'

export default function CreativeTemplate({ data, formatLocation, formatDate, renderSectionContent }) {
    return (
        <div className={styles.template}>
            <div className={styles.sidebar}>
                {data.personalInfo.showPhoto && data.personalInfo.photoUrl && (
                    <div className={styles.photoContainer}>
                        <img src={data.personalInfo.photoUrl} alt="Profile" className={styles.photo} />
                    </div>
                )}
                <div className={styles.sidebarContent}>
                    <h1 className={styles.name}>{data.personalInfo.fullName || 'Your Name'}</h1>
                    {data.personalInfo.roleTitle && <p className={styles.roleTitle}>{data.personalInfo.roleTitle}</p>}
                    <div className={styles.contactSection}>
                        <h3 className={styles.sidebarTitle}>CONTACT</h3>
                        {data.personalInfo.email && <div className={styles.contactItem}><MailOutlined /> {data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div className={styles.contactItem}><PhoneOutlined /> {data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div className={styles.contactItem}><EnvironmentOutlined /> {formatLocation(data.personalInfo.location)}</div>}
                    </div>
                    {(data.personalInfo.links?.linkedin || data.personalInfo.links?.github || data.personalInfo.links?.portfolio) && (
                        <div className={styles.linksSection}>
                            <h3 className={styles.sidebarTitle}>LINKS</h3>
                            {data.personalInfo.links.linkedin && <div className={styles.linkItem}><LinkedinOutlined /> <a href={data.personalInfo.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></div>}
                            {data.personalInfo.links.github && <div className={styles.linkItem}><GithubOutlined /> <a href={data.personalInfo.links.github} target="_blank" rel="noopener noreferrer">GitHub</a></div>}
                            {data.personalInfo.links.portfolio && <div className={styles.linkItem}><GlobalOutlined /> <a href={data.personalInfo.links.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a></div>}
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.mainContent}>
                {data.personalInfo.summary && (
                    <div className={styles.summary}>
                        <h2 className={styles.sectionTitle}>ABOUT ME</h2>
                        <p className={styles.summaryText}>{data.personalInfo.summary}</p>
                    </div>
                )}
                {renderSectionContent({ ...styles, ...sharedStyles })}
            </div>
        </div>
    )
}
