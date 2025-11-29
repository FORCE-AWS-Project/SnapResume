import { useState } from 'react'
import { Card, Input, Button, Space, DatePicker, Checkbox, Tooltip } from 'antd'
import { PlusOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import styles from './FormSection.module.css'

const { TextArea } = Input

export default function Experience({ data, onChange }) {
  const [expandedIndex, setExpandedIndex] = useState(0)

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      jobTitle: '',
      company: '',
      location: '',
      locationType: 'On-site', // On-site, Remote, Hybrid
      startDate: null,
      endDate: null,
      current: false,
      description: [],
    }
    onChange([...data, newExp])
    setExpandedIndex(data.length)
  }

  const updateExperience = (index, field, value) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const deleteExperience = (index) => {
    const updated = data.filter((_, i) => i !== index)
    onChange(updated)
    if (expandedIndex >= updated.length) {
      setExpandedIndex(Math.max(0, updated.length - 1))
    }
  }

  const addBulletPoint = (index) => {
    const updated = [...data]
    updated[index].description.push('')
    onChange(updated)
  }

  const updateBulletPoint = (expIndex, bulletIndex, value) => {
    const updated = [...data]
    updated[expIndex].description[bulletIndex] = value
    onChange(updated)
  }

  const deleteBulletPoint = (expIndex, bulletIndex) => {
    const updated = [...data]
    updated[expIndex].description = updated[expIndex].description.filter((_, i) => i !== bulletIndex)
    onChange(updated)
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>Work Experience</h3>
        <Button 
          type="dashed" 
          icon={<PlusOutlined />} 
          onClick={addExperience}
          size="small"
        >
          Add Experience
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {data.map((exp, index) => (
          <Card
            key={exp.id}
            size="small"
            title={
              <div className={styles.cardTitle}>
                <DragOutlined className={styles.dragHandle} />
                <span>{exp.jobTitle || `Experience ${index + 1}`}</span>
              </div>
            }
            extra={
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteExperience(index)}
                size="small"
              />
            }
            className={styles.card}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Input
                placeholder="e.g., Senior Software Engineer"
                value={exp.jobTitle}
                onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)}
                addonBefore="Job Title"
              />

              <Input
                placeholder="e.g., Google Inc."
                value={exp.company}
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                addonBefore="Company"
              />

              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="e.g., San Francisco, CA"
                  value={exp.location}
                  onChange={(e) => updateExperience(index, 'location', e.target.value)}
                  addonBefore="Location"
                  style={{ width: '60%' }}
                />
                <Input
                  placeholder="Remote/Hybrid/On-site"
                  value={exp.locationType}
                  onChange={(e) => updateExperience(index, 'locationType', e.target.value)}
                  style={{ width: '40%' }}
                />
              </Space.Compact>

              <Space>
                <DatePicker
                  placeholder="Start Date"
                  picker="month"
                  value={exp.startDate ? dayjs(exp.startDate) : null}
                  onChange={(date) => updateExperience(index, 'startDate', date?.format('YYYY-MM'))}
                  format="MMM YYYY"
                />
                <DatePicker
                  placeholder="End Date"
                  picker="month"
                  value={exp.endDate ? dayjs(exp.endDate) : null}
                  onChange={(date) => updateExperience(index, 'endDate', date?.format('YYYY-MM'))}
                  format="MMM YYYY"
                  disabled={exp.current}
                />
                <Checkbox
                  checked={exp.current}
                  onChange={(e) => {
                    updateExperience(index, 'current', e.target.checked)
                    if (e.target.checked) {
                      updateExperience(index, 'endDate', null)
                    }
                  }}
                >
                  Current
                </Checkbox>
              </Space>

              <div className={styles.bulletSection}>
                <label className={styles.bulletLabel}>
                  Description (Bullet Points)
                  <Tooltip title="Use action verbs. Quantify achievements. Keep it concise.">
                    <span className={styles.helpIcon}>?</span>
                  </Tooltip>
                </label>
                {exp.description.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className={styles.bulletItem}>
                    <span className={styles.bulletDot}>•</span>
                    <TextArea
                      placeholder="e.g., Led a team of 5 developers to reduce load times by 40%"
                      value={bullet}
                      onChange={(e) => updateBulletPoint(index, bulletIndex, e.target.value)}
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      className={styles.bulletInput}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => deleteBulletPoint(index, bulletIndex)}
                      size="small"
                    />
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => addBulletPoint(index)}
                  size="small"
                  icon={<PlusOutlined />}
                  block
                >
                  Add Bullet Point
                </Button>
              </div>
            </Space>
          </Card>
        ))}
      </Space>
    </div>
  )
}
