import React from 'react'
import { Card, List, Button, Space, Badge, Typography } from 'antd'
import { PlusOutlined, EditOutlined, CheckOutlined, RightOutlined } from '@ant-design/icons'
import { useResume } from '../../contexts/ResumeContext'
import styles from './SectionPanel.module.css'

const { Text } = Typography

const SectionPanel = () => {
  const { template, resumeData, sectionStates, toggleSection, selectSection, selectedSection, addSectionItem } = useResume()

  if (!template || !template.inputDataSchema) {
    return (
      <Card title="Sections" className={styles.container}>
        <Text type="secondary">No template selected or template has no schema</Text>
      </Card>
    )
  }

  const getSectionCount = (sectionType, schema) => {
    const items = resumeData[sectionType]
    if (!items) return 0

    if (schema.type === 'array') {
      return items.length
    }

    // For object sections, check if it has any data
    return Object.keys(items).some(key => items[key]) ? 1 : 0
  }

  const getSectionIcon = (sectionType, schema) => {
    const count = getSectionCount(sectionType, schema)
    const isExpanded = sectionStates[sectionType]?. expanded
    const isSelected = selectedSection?.type === sectionType

    if (isSelected) {
      return <EditOutlined style={{ color: '#1890ff' }} />
    } else if (count > 0) {
      return <CheckOutlined style={{ color: '#52c41a' }} />
    } else if (isExpanded) {
      return <EditOutlined style={{ color: '#1890ff' }} />
    }
    return <EditOutlined style={{ color: '#d9d9d9' }} />
  }

  const handleAddItem = (sectionType, schema) => {
    if (schema.type === 'array') {
      const emptyItem = {}
      Object.entries(schema.itemSchema || {}).forEach(([key, field]) => {
        emptyItem[key] = getDefaultValue(field)
      })
      emptyItem.tempId = new Date().toISOString()
      addSectionItem(sectionType, emptyItem)
    } else {
      // For object sections, select the section for editing
      selectSection(sectionType, 'edit')
      toggleSection(sectionType, true)
    }
  }

  const handleSectionClick = (sectionType, schema) => {
    const isExpanded = sectionStates[sectionType]?.expanded
    const items = resumeData[sectionType] || []

    if (schema.type === 'array' && items.length > 0) {
      // If array has items, select the first item and expand
      const firstItem = items[0]
      selectSection(sectionType, 'edit', firstItem.tempId || firstItem.sectionId)
      toggleSection(sectionType, true)
    } else {
      // For empty arrays or object sections, select for editing
      selectSection(sectionType, 'edit')
      toggleSection(sectionType, true)
    }
  }

  const getDefaultValue = (fieldDefinition) => {
    switch (fieldDefinition.type) {
      case 'string':
      case 'text':
      case 'link':
      case 'date':
        return ''
      case 'number':
        return 0
      case 'boolean':
        return false
      case 'array':
        return []
      case 'object':
        const defaults = {}
        if (fieldDefinition.fields) {
          Object.entries(fieldDefinition.fields).forEach(([key, field]) => {
            defaults[key] = getDefaultValue(field)
          })
        }
        return defaults
      default:
        return ''
    }
  }

  const sectionItems = Object.entries(template.inputDataSchema)
    .map(([sectionType, schema]) => {
      const count = getSectionCount(sectionType, schema)
      const isExpanded = sectionStates[sectionType]?.expanded
      const isSelected = selectedSection?.type === sectionType

      return (
        <div key={sectionType} className={styles.sectionWrapper}>
          <List.Item
            className={`${styles.sectionItem} ${isSelected ? styles.selected : ''}`}
            onClick={() => handleSectionClick(sectionType, schema)}
            actions={[
              schema.type === 'array' ? (
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddItem(sectionType, schema)
                  }}
                >
                  Add
                </Button>
              ) : count === 0 ? (
                <Button
                  type="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddItem(sectionType, schema)
                  }}
                >
                  Fill
                </Button>
              ) : null,
            ]}
          >
            <List.Item.Meta
              avatar={getSectionIcon(sectionType, schema)}
              title={
                <Space>
                  <span>{schema.title || sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}</span>
                  {count > 0 && <Badge count={count} style={{ backgroundColor: '#52c41a' }} />}
                  {schema.required && <Badge count="*" style={{ backgroundColor: '#ff4d4f' }} />}
                </Space>
              }
              description={
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {schema.type === 'array'
                      ? `${count} ${count === 1 ? 'item' : 'items'}`
                      : count > 0 ? 'Filled' : 'Not filled'
                    }
                  </Text>
                </div>
              }
            />
          </List.Item>

          {/* Show array items when expanded */}
          {schema.type === 'array' && isExpanded && resumeData[sectionType]?.length > 0 && (
            <div className={styles.itemsList}>
              {resumeData[sectionType].map((item, index) => (
                <div
                  key={item.tempId || item.sectionId || index}
                  className={`${styles.itemRow} ${selectedSection?.itemId === (item.tempId || item.sectionId) ? styles.itemSelected : ''}`}
                  onClick={() => selectSection(sectionType, 'edit', item.tempId || item.sectionId)}
                >
                  <Text>
                    {item.position || item.name || item.title || item.institution || item.degree || `${schema.title || sectionType} ${index + 1}`}
                  </Text>
                  <RightOutlined className={styles.itemArrow} />
                </div>
              ))}
            </div>
          )}
        </div>
      )
    })

  return (
    <Card title="Resume Sections" className={styles.container} styles={{ body: { padding: 0 } }}>
      <List
        dataSource={sectionItems}
        renderItem={item => item}
        className={styles.sectionList}
      />
    </Card>
  )
}

export default SectionPanel