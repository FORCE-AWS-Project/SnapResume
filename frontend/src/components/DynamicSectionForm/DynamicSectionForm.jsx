import { useState, useEffect } from 'react'
import { Card, Typography, Button, Empty } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import DynamicForm from '../DynamicForm/DynamicForm'
import { useResume, createEmptySectionItem } from '../../contexts/ResumeContext'
import { SchemaAdapter } from '../../utils/SchemaAdapter'
import styles from './DynamicSectionForm.module.css'

const { Title, Text } = Typography

const DynamicSectionForm = () => {
  const {
    template,
    resumeData,
    sectionStorage,
    selectedSection,
    updateSectionItem,
    deleteSectionItem,
    setSectionData,
  } = useResume()

  const [formData, setFormData] = useState({})
  const [validationErrors, setValidationErrors] = useState([])

  useEffect(() => {
    if (!selectedSection || !template) {
      setFormData({})
      setValidationErrors([])
      return
    }

    const { type: sectionType, itemId } = selectedSection
    const sectionSchema = template.inputDataSchema[sectionType]

    if (!sectionSchema) return

    if (sectionSchema.type === 'array' && itemId) {
      const storageItems = sectionStorage[sectionType] || []
      const resumeItems = resumeData[sectionType] || []

      console.log("Looking for itemId:", itemId)
      console.log("Storage items:", storageItems)
      console.log("Resume items:", resumeItems)

      // Always get the data from storage since that's where the master copy is
      const item = storageItems.find(
        item => item.tempId === itemId || item.sectionId === itemId
      )

      console.log("Found item:", item)

      if (item) {
        setFormData(item)
      } else {
        setFormData({})
      }
    } else if (sectionSchema.type === 'object') {
      setFormData(resumeData[sectionType] || createEmptySectionItem(sectionSchema))
    }
  }, [selectedSection, resumeData, sectionStorage, template])

  const handleFormChange = (newFormData) => {
    setValidationErrors([])

    if (!selectedSection) return

    const { type, itemId } = selectedSection
    const sectionSchema = template.inputDataSchema[type]

    if (sectionSchema.type === 'array' && itemId) {
      Object.entries(newFormData).forEach(([field, value]) => {
        if (formData[field] !== value) {
          updateSectionItem(type, itemId, field, value)
        }
      })
    } else if (sectionSchema.type === 'object') {
      // Update entire section
      setSectionData(type, newFormData)
    }
  }

  const handleDelete = (itemId) => {
    if (!selectedSection) return

    deleteSectionItem(selectedSection.type, itemId)
    // Reset form if deleting current item
    if (selectedSection.itemId === itemId) {
      setFormData({})
    }
  }

  const renderArraySection = () => {
    if (!selectedSection) {
      return <Empty description="Select a section item from the left panel to edit" />
    }

    const { type: sectionType, itemId } = selectedSection
    const sectionSchema = template.inputDataSchema[sectionType]

    if (!sectionSchema || !itemId) {
      return <Empty description="Select a section item from the left panel to edit" />
    }

      const adaptedSchema = SchemaAdapter.toRJSF(sectionSchema?.itemSchema || {})
    const uiSchema = SchemaAdapter.getUiSchema(sectionSchema?.itemSchema || {})

    const storageItems = sectionStorage[sectionType] || []
    const item = storageItems.find(item => item.tempId === itemId || item.sectionId === itemId)
    const itemTitle = item?.position || item?.name || item?.title || item?.institution || item?.degree || `${sectionSchema.title || sectionType} Item`

    return (
      <div className={styles.objectSection}>
        <div className={styles.header}>
          <Title level={4}>{itemTitle}</Title>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(itemId)}
          >
            Delete
          </Button>
        </div>
        <DynamicForm
          key={`form-${itemId}`} 
          schema={adaptedSchema}
          uiSchema={uiSchema}
          formData={formData}
          onChange={handleFormChange}
          liveValidate={false}
          showErrorList={false}
        />
        {validationErrors.length > 0 && (
          <div className={styles.validationErrors}>
            {validationErrors.map((error, idx) => (
              <div key={idx} className={styles.error}>{error}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderObjectSection = () => {
    if (!selectedSection) {
      return <Empty description="Select a section to edit" />
    }

    const { type: sectionType } = selectedSection
    const sectionSchema = template.inputDataSchema[sectionType]

    if (!sectionSchema) {
      return <Empty description="Section schema not found" />
    }

    // Create adapted schema
    const adaptedSchema = SchemaAdapter.toRJSF(sectionSchema.fields);

    return (
      <div className={styles.objectSection}>
        <div className={styles.header}>
          <Title level={4}>{sectionSchema.title || sectionType}</Title>
          {sectionSchema.required && (
            <Text type="danger">*</Text>
          )}
        </div>
        <DynamicForm
          schema={adaptedSchema}
          formData={formData}
          onChange={handleFormChange}
          liveValidate
          showErrorList={false}
        />
        {validationErrors.length > 0 && (
          <div className={styles.validationErrors}>
            {validationErrors.map((error, idx) => (
              <div key={idx} className={styles.error}>{error}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!template) {
    return (
      <Card className={styles.container} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="Select a template to start editing" />
        </div>
      </Card>
    )
  }

  if (!selectedSection) {
    return (
      <Card className={styles.container} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="Select a section from the left panel to edit" />
        </div>
      </Card>
    )
  }

  const { type: sectionType } = selectedSection
  const sectionSchema = template.inputDataSchema[sectionType]

  if (!sectionSchema) {
    return (
      <Card className={styles.container} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="Section not found in template" />
        </div>
      </Card>
    )
  }

  return (
    <Card className={styles.container} style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {sectionSchema.type === 'array' ? renderArraySection() : renderObjectSection()}
      </div>
    </Card>
  )
}

export default DynamicSectionForm