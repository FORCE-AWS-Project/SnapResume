import { Collapse } from 'antd'
import { 
  UserOutlined, 
  ShopOutlined, 
  BookFilled, 
  ToolOutlined,
  SafetyCertificateOutlined,
  FolderOutlined,
  GlobalOutlined,
  HeartFilled,
  FileTextOutlined
} from '@ant-design/icons'
import PersonalInfo from '../sections/PersonalInfo'
import Experience from '../sections/Experience'
import Education from '../sections/Education'
import Skills from '../sections/Skills'
import Projects from '../sections/Projects'
import Certifications from '../sections/Certifications'
import Languages from '../sections/Languages'
import Volunteering from '../sections/Volunteering'
import Publications from '../sections/Publications'
import styles from './FormPanel.module.css'

export default function FormPanel({ data, onInputChange, sectionOrder }) {
  const handleArrayChange = (section, newData) => {
    onInputChange(section, null, newData)
  }

  const sections = {
    experience: {
      key: 'experience',
      label: 'Work Experience',
      icon: <ShopOutlined />,
      component: <Experience data={data.experience} onChange={(newData) => handleArrayChange('experience', newData)} />
    },
    education: {
      key: 'education',
      label: 'Education',
      icon: <BookFilled />,
      component: <Education data={data.education} onChange={(newData) => handleArrayChange('education', newData)} />
    },
    skills: {
      key: 'skills',
      label: 'Skills',
      icon: <ToolOutlined />,
      component: <Skills data={data.skills} onChange={(newData) => handleArrayChange('skills', newData)} />
    },
    projects: {
      key: 'projects',
      label: 'Projects',
      icon: <FolderOutlined />,
      component: <Projects data={data.projects} onChange={(newData) => handleArrayChange('projects', newData)} />
    },
    certifications: {
      key: 'certifications',
      label: 'Certifications',
      icon: <SafetyCertificateOutlined />,
      component: <Certifications data={data.certifications} onChange={(newData) => handleArrayChange('certifications', newData)} />
    },
    languages: {
      key: 'languages',
      label: 'Languages',
      icon: <GlobalOutlined />,
      component: <Languages data={data.languages} onChange={(newData) => handleArrayChange('languages', newData)} />
    },
    volunteering: {
      key: 'volunteering',
      label: 'Volunteering',
      icon: <HeartFilled />,
      component: <Volunteering data={data.volunteering} onChange={(newData) => handleArrayChange('volunteering', newData)} />
    },
    publications: {
      key: 'publications',
      label: 'Publications',
      icon: <FileTextOutlined />,
      component: <Publications data={data.publications} onChange={(newData) => handleArrayChange('publications', newData)} />
    }
  }

  const orderedSections = sectionOrder?.map(key => sections[key]).filter(Boolean) || Object.values(sections)

  const collapseItems = [
    {
      key: 'personal',
      label: (
        <span>
          <UserOutlined /> Personal Information
        </span>
      ),
      children: <PersonalInfo data={data} onInputChange={onInputChange} />,
    },
    ...orderedSections.map(section => ({
      key: section.key,
      label: (
        <span>
          {section.icon} {section.label}
        </span>
      ),
      children: section.component,
    }))
  ]

  return (
    <aside className={styles.sidebar}>
      <div className={styles.content}>
        <Collapse 
          defaultActiveKey={['personal', 'experience']} 
          items={collapseItems}
          className={styles.collapse}
        />
      </div>
    </aside>
  )
}