import { useState } from 'react'
import { Tooltip, Button, Popconfirm, Space } from 'antd'
import {
  DragOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined
} from '@ant-design/icons'
import styles from './SectionsList.module.css'

export default function SectionsList({
  sections,
  selectedSection,
  onSectionSelect,
  onSectionReorder,
  onSectionDelete
}) {
  const [draggedItem, setDraggedItem] = useState(null)

  const handleDragStart = (e, index) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    if (draggedItem === null || draggedItem === targetIndex) return

    const newSections = [...sections]
    const draggedSection = newSections[draggedItem]
    newSections.splice(draggedItem, 1)
    newSections.splice(targetIndex, 0, draggedSection)

    onSectionReorder(newSections)
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  return (
    <div className={styles.container}>
      {sections.map((section, index) => (
        <div
          key={section.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`${styles.section} ${
            selectedSection === section.id ? styles.selected : ''
          } ${draggedItem === index ? styles.dragging : ''}`}
        >
          <div className={styles.dragHandle}>
            <DragOutlined className={styles.dragIcon} />
          </div>

          <div
            className={styles.sectionContent}
            onClick={() => onSectionSelect(section.id)}
          >
            <div className={styles.sectionInfo}>
              <span className={styles.icon}>{section.icon}</span>
              <div className={styles.sectionText}>
                <h4 className={styles.sectionTitle}>{section.title}</h4>
                {section.count && (
                  <span className={styles.sectionMeta}>
                    {section.count} item{section.count !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {section.completed && (
              <CheckOutlined className={styles.completedIcon} />
            )}
          </div>

          <div className={styles.sectionActions}>
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                className={styles.actionBtn}
              />
            </Tooltip>

            <Popconfirm
              title="Delete Section"
              description="Are you sure you want to delete this section? This action cannot be undone."
              onConfirm={() => onSectionDelete(section.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  size="small"
                  className={styles.actionBtn}
                  danger
                />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>
      ))}
    </div>
  )
}
