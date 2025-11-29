import { Card, Input, Button, Space, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons'
import { useState } from 'react'
import styles from './FormSection.module.css'

export default function Skills({ data, onChange }) {
  const [newSkillInput, setNewSkillInput] = useState({})

  const addCategory = () => {
    const newCategory = {
      id: Date.now(),
      name: '',
      skills: [],
    }
    onChange({
      ...data,
      categories: [...data.categories, newCategory],
    })
  }

  const updateCategoryName = (index, name) => {
    const updated = { ...data }
    updated.categories[index].name = name
    onChange(updated)
  }

  const deleteCategory = (index) => {
    const updated = { ...data }
    updated.categories = updated.categories.filter((_, i) => i !== index)
    onChange(updated)
  }

  const addSkill = (categoryIndex) => {
    const skillText = newSkillInput[categoryIndex]?.trim()
    if (!skillText) return

    const updated = { ...data }
    if (!updated.categories[categoryIndex].skills.includes(skillText)) {
      updated.categories[categoryIndex].skills.push(skillText)
      onChange(updated)
    }
    
    setNewSkillInput({ ...newSkillInput, [categoryIndex]: '' })
  }

  const deleteSkill = (categoryIndex, skillIndex) => {
    const updated = { ...data }
    updated.categories[categoryIndex].skills = updated.categories[categoryIndex].skills.filter(
      (_, i) => i !== skillIndex
    )
    onChange(updated)
  }

  const suggestedCategories = [
    { name: 'Programming Languages', examples: ['JavaScript', 'Python', 'Java', 'C++'] },
    { name: 'Frameworks & Libraries', examples: ['React', 'Node.js', 'Django', 'Spring Boot'] },
    { name: 'Tools & Platforms', examples: ['Git', 'Docker', 'AWS', 'Kubernetes'] },
    { name: 'Databases', examples: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL'] },
    { name: 'Soft Skills', examples: ['Team Leadership', 'Communication', 'Problem Solving'] },
  ]

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>Skills</h3>
        <Button 
          type="dashed" 
          icon={<PlusOutlined />} 
          onClick={addCategory}
          size="small"
        >
          Add Category
        </Button>
      </div>

      <div style={{ marginBottom: 16, fontSize: 12, color: '#8c8c8c' }}>
        💡 <strong>ATS Tip:</strong> Organize skills by category. Avoid progress bars - use text tags only.
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {data.categories.length === 0 ? (
          <Card className={styles.emptyState} size="small">
            <p>No skill categories yet. Suggested categories:</p>
            <Space wrap>
              {suggestedCategories.map((cat) => (
                <Tag 
                  key={cat.name}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onChange({
                      ...data,
                      categories: [
                        ...data.categories,
                        { id: Date.now(), name: cat.name, skills: [] }
                      ]
                    })
                  }}
                >
                  + {cat.name}
                </Tag>
              ))}
            </Space>
          </Card>
        ) : (
          data.categories.map((category, catIndex) => (
            <Card
              key={category.id}
              size="small"
              title={
                <Input
                  placeholder="Category name (e.g., Programming Languages)"
                  value={category.name}
                  onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                  bordered={false}
                  style={{ fontWeight: 500 }}
                />
              }
              extra={
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteCategory(catIndex)}
                  size="small"
                />
              }
              className={styles.categoryCard}
            >
              <div className={styles.skillTags}>
                {category.skills.map((skill, skillIndex) => (
                  <Tag
                    key={skillIndex}
                    closable
                    onClose={() => deleteSkill(catIndex, skillIndex)}
                    closeIcon={<CloseOutlined />}
                    color="blue"
                  >
                    {skill}
                  </Tag>
                ))}
              </div>

              <Space.Compact style={{ width: '100%', marginTop: 12 }}>
                <Input
                  placeholder="Type a skill and press Enter"
                  value={newSkillInput[catIndex] || ''}
                  onChange={(e) => setNewSkillInput({ ...newSkillInput, [catIndex]: e.target.value })}
                  onPressEnter={() => addSkill(catIndex)}
                />
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => addSkill(catIndex)}
                >
                  Add
                </Button>
              </Space.Compact>

              {catIndex === 0 && category.skills.length === 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                  Examples: {suggestedCategories.find(c => c.name === category.name)?.examples.join(', ') || 'JavaScript, Python, React, AWS'}
                </div>
              )}
            </Card>
          ))
        )}
      </Space>
    </div>
  )
}
