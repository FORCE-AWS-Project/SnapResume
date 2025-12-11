import React, { useState, useEffect } from 'react'
import { Modal, Row, Col, Card, Spin, Button, Typography, Tag } from 'antd'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import templateService from '../../services/templateService'
import styles from './TemplateSelectionModal.module.css'

const { Title, Text } = Typography
const { Meta } = Card

const TemplateSelectionModal = ({ visible, onCancel, onSelect }) => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    if (!visible) return

    const fetchTemplates = async () => {
      try {
        setLoading(true)
        const data = await templateService.getTemplates(selectedCategory !== 'all' ? selectedCategory : null)
        setTemplates(data.templates)
      } catch (error) {
        toast.error('Failed to load templates: ' + error.message)
        setTemplates([])
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [visible, selectedCategory])

  const handleTemplateSelect = (template) => {
    if (onSelect) {
      onSelect(template)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  const getFilterButtons = () => {
    const categories = ['all', 'professional', 'modern', 'creative', 'minimal']
    return categories.map(cat => (
      <Button
        key={cat}
        type={selectedCategory === cat ? 'primary' : 'default'}
        onClick={() => setSelectedCategory(cat)}
        style={{ margin: '0 4px 8px 0' }}
      >
        {cat.charAt(0).toUpperCase() + cat.slice(1)}
      </Button>
    ))
  }

  return (
    <Modal
      title="Choose a Template"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1200}
      className={styles.templateModal}
      styles={{ body: { padding: '24px' } }}
    >
      <div className={styles.filterSection}>
        <Title level={5}>Categories</Title>
        {getFilterButtons()}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]} className={styles.templateGrid}>
          {templates.map((template) => (
            <Col xs={24} sm={12} md={8} lg={6} key={template.templateId}>
              <Card
                hoverable
                className={styles.templateCard}
                onClick={() => handleTemplateSelect(template)}
                cover={
                  <div className={styles.templatePreview}>
                    {template.previewImageUrl ? (
                      <img
                        alt={template.name}
                        src={template.previewImageUrl}
                        className={styles.previewImage}
                      />
                    ) : (
                      <div className={styles.placeholderPreview}>
                        <Text type="secondary">No Preview</Text>
                      </div>
                    )}
                  </div>
                }
              >
                <Meta
                  title={template.name}
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {template.category}
                      </Text>
                      <br />
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Modal>
  )
}

export default TemplateSelectionModal