import React, { useState, useEffect } from 'react'
import { Card, Typography, Space, Button, Empty, Tabs, Form } from 'antd'
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import DynamicForm from '../DynamicForm/DynamicForm'
import { useResume, createEmptySectionItem } from '../../contexts/ResumeContext'
import { SchemaAdapter } from '../../utils/SchemaAdapter'
import { SchemaValidator } from '../../utils/SchemaValidator'
import styles from './DynamicSectionForm.module.css'

const { Title, Text } = Typography

const DynamicSectionForm = () => {
  const {
    template,
    resumeData,
    selectedSection,
    sectionStates,
    updateSectionItem,
    deleteSectionItem,
    setSectionData
  } = useResume()

  const [formData, setFormData] = useState({})
  const [validationErrors, setValidationErrors] = useState([])
  const [activeKey, setActiveKey] = useState('0')

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
      // Find the specific item being edited
      const item = resumeData[sectionType]?.find(
        item => item.tempId === itemId || item.sectionId === itemId
      )
      if (item) {
        setFormData(item)
      }
    } else if (sectionSchema.type === 'object') {
      // Load the entire section data
      setFormData(resumeData[sectionType] || createEmptySectionItem(sectionSchema))
    }
  }, [selectedSection, resumeData, template])

  const handleFormChange = (newFormData) => {
    setFormData(newFormData)
    setValidationErrors([])

    if (!selectedSection) return

    const { type, itemId } = selectedSection
    const sectionSchema = template.inputDataSchema[type]
    console.log("New form data: ",sectionSchema)
    console.log("Selected sections: ",selectedSection)
    if (sectionSchema.type === 'array' && itemId) {
      // Update specific item in arra
      Object.entries(newFormData).forEach(([field, value]) => {
        updateSectionItem(type, itemId, field, value)
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

  const handleSave = () => {
    if (!selectedSection) return

    const { type: sectionType } = selectedSection
    const sectionSchema = template.inputDataSchema[sectionType]

    if (sectionSchema) {
      // Validate form data
      const validation = SchemaValidator.validate(formData, { [sectionType]: sectionSchema })
      if (!validation.valid) {
        setValidationErrors(validation.errors)
        return
      }
    }

    // Data is already being updated in real-time via handleFormChange
    // Just show success message
    // TODO: Show success notification
  }

  const renderArraySection = () => {
    if (!selectedSection) {
      return <Empty description="Select a section to edit" />
    }

    const { type: sectionType } = selectedSection
    const sectionSchema = template.inputDataSchema[sectionType]
    const items = resumeData[sectionType] || []

    if (items.length === 0) {
      return (
        <Empty
          description={`No ${sectionSchema.title || sectionType} items yet`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Text type="secondary">Use the "Add" button in the sections panel to create items</Text>
        </Empty>
      )
    }

    // Create adapted schema for the form
    const adaptedSchema = SchemaAdapter.toRJSF(sectionSchema?.itemSchema || {})
    const uiSchema = SchemaAdapter.getUiSchema(sectionSchema?.itemSchema || {})

    return (
      <div>
        <div className={styles.header}>
          <Title level={4}>{sectionSchema.title || sectionType}</Title>
          <Text type="secondary">{items.length} item{items.length !== 1 ? 's' : ''}</Text>
        </div>

        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          type="editable-card"
          hideAdd
          items={items.map((item, index) => ({
            key: item.tempId || item.sectionId || index.toString(),
            label: `${sectionSchema.title || sectionType} ${index + 1}`,
            children: (
              <div>
                <div className={styles.tabActions}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(item.tempId || item.sectionId)}
                  >
                    Delete Item
                  </Button>
                </div>
                <DynamicForm
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
          }))}
        />
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
    const adaptedSchema = SchemaAdapter.toRJSF({
      type: 'object',
      properties: sectionSchema.fields || {}
    })

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
      <Card className={styles.container}>
        <Empty description="Select a template to start editing" />
      </Card>
    )
  }

  if (!selectedSection) {
    return (
      <Card className={styles.container}>
        <Empty description="Select a section from the left panel to edit" />
      </Card>
    )
  }

  const { type: sectionType } = selectedSection
  const sectionSchema = template.inputDataSchema[sectionType]

  if (!sectionSchema) {
    return (
      <Card className={styles.container}>
        <Empty description="Section not found in template" />
      </Card>
    )
  }

  return (
    <Card className={styles.container} styles={{ body: { padding: 0 } }}>
      <div className={styles.formContainer}>
        {sectionSchema.type === 'array' ? renderArraySection() : renderObjectSection()}
      </div>
    </Card>
  )
}

export default DynamicSectionForm