import { Card, List, Button, Space, Badge, Typography, Checkbox } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useResume } from '../../contexts/ResumeContext'
import { v4 as uuidv4 } from 'uuid'
import styles from './SectionPanel.module.css'

const { Text } = Typography

const SectionPanel = () => {
  const {
    template,
    resumeData,
    sectionStorage,
    sectionStates,
    toggleSection,
    selectSection,
    selectedSection,
    deleteSectionItem,
    toggleSectionInResume,
    addToSectionStorage,
  } = useResume()

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

  const handleAddItem = (sectionType, schema) => {
    if (schema.type === 'array') {
      const storageItem = {}
      Object.entries(schema.itemSchema || {}).forEach(([key, field]) => {
        storageItem[key] = getDefaultValue(field)
      })
      const newId = uuidv4()
      storageItem.tempId = newId

      addToSectionStorage(sectionType, storageItem)
    } else {
      selectSection(sectionType, 'edit')
      toggleSection(sectionType, true)
    }
  }

  const handleToggleInclude = (e, sectionType, itemId) => {
    e.stopPropagation()
    toggleSectionInResume(sectionType, itemId)
  }

  const isItemInResume = (sectionType, itemId) => {
    const items = resumeData[sectionType] || []
    return items.some(item => (item.tempId === itemId) || (item.sectionId === itemId))
  }

  const getStorageItems = (sectionType) => {
    return sectionStorage[sectionType] || []
  }

  const handleSectionClick = (sectionType, schema) => {
    const storageItems = getStorageItems(sectionType)
    console.log("Storage item in section panel: ",storageItems)
    if (schema.type === 'array' && storageItems.length > 0) {
      const firstItem = storageItems[0]
      selectSection(sectionType, 'edit', firstItem.tempId || firstItem.sectionId)
      toggleSection(sectionType, true)
    } else {
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
              ) : null,
            ]}
          >
            <List.Item.Meta
              avatar={<EditOutlined style={{ color: isSelected ? '#1890ff' : '#d9d9d9' }} />}
              title={
                <Space>
                  <span>{schema.title || sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}</span>
                  <Badge count={getStorageItems(sectionType).length} style={{ backgroundColor: '#1890ff' }} />
                  <Badge count={schema.type==="array"? count:0} style={{ backgroundColor: '#52c41a' }} title="In Resume" />
                  {schema.required && <Badge count="*" style={{ backgroundColor: '#ff4d4f' }} />}
                </Space>
              }
              description={
                <div>
                  {schema.type === "array" && 
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {count} of {getStorageItems(sectionType).length} items in resume
                    </Text>
                  }
                </div>
              }
            />
          </List.Item>

          {/* Show all items from storage when expanded and has items */}
          {schema.type === 'array' && isExpanded && getStorageItems(sectionType).length > 0 && (
            <div className={styles.itemsList}>
              {getStorageItems(sectionType).map((item, index) => {
                const itemId = item.tempId || item.sectionId || index
                const isIncluded = isItemInResume(sectionType, itemId)
                const isSelected = selectedSection?.itemId === itemId

                return (
                  <div
                    key={`item-${sectionType}-${itemId}`}
                    className={`${styles.itemRow} ${isSelected ? styles.itemSelected : ''} ${isIncluded ? styles.itemIncluded : ''}`}
                    onClick={() => selectSection(sectionType, 'edit', itemId)}
                  >
                    <Checkbox
                      checked={isIncluded}
                      onChange={(e) => handleToggleInclude(e, sectionType, itemId)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Text style={{ flex: 1, marginLeft: 8 }}>
                      {`${schema.title || sectionType} ${index + 1}`}
                    </Text>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSectionItem(sectionType, itemId)
                      }}
                      style={{ marginLeft: 8, padding: '0 4px' }}
                    />
                  </div>
                )
              })}
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