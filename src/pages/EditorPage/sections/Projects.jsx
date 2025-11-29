import { Card, Input, Button, Space } from 'antd'
import { PlusOutlined, DeleteOutlined, DragOutlined, LinkOutlined } from '@ant-design/icons'
import styles from './FormSection.module.css'

const { TextArea } = Input

export default function Projects({ data, onChange }) {
  const addProject = () => {
    const newProject = {
      id: Date.now(),
      title: '',
      role: '',
      techStack: [],
      description: '',
      url: '',
      github: '',
    }
    onChange([...data, newProject])
  }

  const updateProject = (index, field, value) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const deleteProject = (index) => {
    onChange(data.filter((_, i) => i !== index))
  }

  const updateTechStack = (index, value) => {
    const techs = value.split(',').map(t => t.trim()).filter(Boolean)
    updateProject(index, 'techStack', techs)
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>Projects</h3>
        <Button 
          type="dashed" 
          icon={<PlusOutlined />} 
          onClick={addProject}
          size="small"
        >
          Add Project
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {data.length === 0 ? (
          <div className={styles.emptyState}>
            Showcase your personal or professional projects
          </div>
        ) : (
          data.map((project, index) => (
            <Card
              key={project.id}
              size="small"
              title={
                <div className={styles.cardTitle}>
                  <DragOutlined className={styles.dragHandle} />
                  <span>{project.title || `Project ${index + 1}`}</span>
                </div>
              }
              extra={
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteProject(index)}
                  size="small"
                />
              }
              className={styles.card}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Input
                  placeholder="e.g., E-commerce Platform"
                  value={project.title}
                  onChange={(e) => updateProject(index, 'title', e.target.value)}
                  addonBefore="Project Title"
                />

                <Input
                  placeholder="e.g., Lead Developer"
                  value={project.role}
                  onChange={(e) => updateProject(index, 'role', e.target.value)}
                  addonBefore="Your Role"
                />

                <Input
                  placeholder="e.g., React, Node.js, MongoDB (comma-separated)"
                  value={project.techStack.join(', ')}
                  onChange={(e) => updateTechStack(index, e.target.value)}
                  addonBefore="Tech Stack"
                />

                <TextArea
                  placeholder="Brief description of the project and your contributions"
                  value={project.description}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />

                <Input
                  placeholder="https://project-url.com"
                  value={project.url}
                  onChange={(e) => updateProject(index, 'url', e.target.value)}
                  addonBefore={<LinkOutlined />}
                  addonAfter="Live URL"
                />

                <Input
                  placeholder="https://github.com/username/repo"
                  value={project.github}
                  onChange={(e) => updateProject(index, 'github', e.target.value)}
                  addonBefore={<LinkOutlined />}
                  addonAfter="GitHub"
                />
              </Space>
            </Card>
          ))
        )}
      </Space>
    </div>
  )
}
