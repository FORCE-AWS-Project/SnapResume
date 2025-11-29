import { Card, Input, Button, Space, Select } from 'antd'
import { PlusOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons'
import styles from './FormSection.module.css'

const { Option } = Select

export default function Languages({ data, onChange }) {
  const addLanguage = () => {
    const newLang = {
      id: Date.now(),
      language: '',
      proficiency: 'Professional',
    }
    onChange([...data, newLang])
  }

  const updateLanguage = (index, field, value) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const deleteLanguage = (index) => {
    onChange(data.filter((_, i) => i !== index))
  }

  const proficiencyLevels = [
    { value: 'Native', label: 'Native or Bilingual' },
    { value: 'Fluent', label: 'Fluent' },
    { value: 'Professional', label: 'Professional Working' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Basic', label: 'Basic' },
  ]

  const commonLanguages = [
    'English', 'Spanish', 'French', 'German', 'Chinese (Mandarin)',
    'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Russian',
    'Hindi', 'Italian', 'Dutch', 'Turkish', 'Polish'
  ]

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>
          <GlobalOutlined /> Languages
        </h3>
        <Button 
          type="dashed" 
          icon={<PlusOutlined />} 
          onClick={addLanguage}
          size="small"
        >
          Add Language
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {data.length === 0 ? (
          <div className={styles.emptyState}>
            List languages you speak and your proficiency level
          </div>
        ) : (
          data.map((lang, index) => (
            <Card
              key={lang.id}
              size="small"
              className={styles.card}
            >
              <Space style={{ width: '100%' }}>
                <Select
                  placeholder="Select language"
                  value={lang.language || undefined}
                  onChange={(value) => updateLanguage(index, 'language', value)}
                  style={{ width: 200 }}
                  showSearch
                  allowClear
                >
                  {commonLanguages.map(language => (
                    <Option key={language} value={language}>{language}</Option>
                  ))}
                </Select>

                <Select
                  value={lang.proficiency}
                  onChange={(value) => updateLanguage(index, 'proficiency', value)}
                  style={{ flex: 1 }}
                >
                  {proficiencyLevels.map(level => (
                    <Option key={level.value} value={level.value}>{level.label}</Option>
                  ))}
                </Select>

                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteLanguage(index)}
                />
              </Space>
            </Card>
          ))
        )}
      </Space>
    </div>
  )
}
