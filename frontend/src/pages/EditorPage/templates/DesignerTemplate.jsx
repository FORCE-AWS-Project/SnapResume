import { Space } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, LinkedinOutlined, GithubOutlined, GlobalOutlined } from '@ant-design/icons'
import styles from './DesignerTemplate.module.css'
import sharedStyles from './SharedStyles.module.css'

export default function DesignerTemplate({ data, formatLocation, formatDate, renderSectionContent }) {
    return (
        <div className={styles.template}>
            <div className={styles.hero}>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    {data.personalInfo.showPhoto && data.personalInfo.photoUrl && (
                        <img src={data.personalInfo.photoUrl} alt="Profile" className={styles.photo} />
                    )}
                    <h1 className={styles.name}>{data.personalInfo.fullName || 'Your Name'}</h1>
                    {data.personalInfo.roleTitle && <p className={styles.roleTitle}>{data.personalInfo.roleTitle}</p>}
                </div>
            </div>
            <div className={styles.mainContent}>
                <div className={styles.contactBar}>
                    <Space wrap size="large" className={styles.contactInfo}>
                        {data.personalInfo.email && <span><MailOutlined /> {data.personalInfo.email}</span>}
                        {data.personalInfo.phone && <span><PhoneOutlined /> {data.personalInfo.phone}</span>}
                        {data.personalInfo.location && <span><EnvironmentOutlined /> {formatLocation(data.personalInfo.location)}</span>}
                    </Space>
                    <Space wrap size="middle" className={styles.socialLinks}>
                        {data.personalInfo.links?.linkedin && <a href={data.personalInfo.links.linkedin} target="_blank" rel="noopener noreferrer"><LinkedinOutlined /></a>}
                        {data.personalInfo.links?.github && <a href={data.personalInfo.links.github} target="_blank" rel="noopener noreferrer"><GithubOutlined /></a>}
                        {data.personalInfo.links?.portfolio && <a href={data.personalInfo.links.portfolio} target="_blank" rel="noopener noreferrer"><GlobalOutlined /></a>}
                    </Space>
                </div>
                {data.personalInfo.summary && (
                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>Creative Vision</h2>
                        <p className={styles.summaryText}>{data.personalInfo.summary}</p>
                    </div>
                )}
                <div className={styles.content}>
                    {renderSectionContent({ ...styles, ...sharedStyles })}
                </div>
            </div>
        </div>
    )
}
