import { Card, Input, Button, Space, DatePicker, Checkbox } from 'antd'
import { PlusOutlined, DeleteOutlined, DragOutlined, HeartFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import styles from './FormSection.module.css'

const { TextArea } = Input

export default function Volunteering({ data, onChange }) {
  const addVolunteering = () => {
    const newVol = {
      id: Date.now(),
      role: '',
      organization: '',
      location: '',
      startDate: null,
      endDate: null,
      current: false,
      description: [],
    }
    onChange([...data, newVol])
  }

  const updateVolunteering = (index, field, value) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const deleteVolunteering = (index) => {
    onChange(data.filter((_, i) => i !== index))
  }

  const addBulletPoint = (index) => {
    const updated = [...data]
    updated[index].description.push('')
    onChange(updated)
  }

  const updateBulletPoint = (volIndex, bulletIndex, value) => {
    const updated = [...data]
    updated[volIndex].description[bulletIndex] = value
    onChange(updated)
  }

  const deleteBulletPoint = (volIndex, bulletIndex) => {
    const updated = [...data]
    updated[volIndex].description = updated[volIndex].description.filter((_, i) => i !== bulletIndex)
    onChange(updated)
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>
          <HeartFilled /> Volunteering
        </h3>
        <Button 
          type="dashed" 
          icon={<PlusOutlined />} 
          onClick={addVolunteering}
          size="small"
        >
          Add Experience
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {data.length === 0 ? (
          <div className={styles.emptyState}>
            Showcase your community involvement and volunteer work
          </div>
        ) : (
          data.map((vol, index) => (
            <Card
              key={vol.id}
              size="small"
              title={
                <div className={styles.cardTitle}>
                  <DragOutlined className={styles.dragHandle} />
                  <span>{vol.role || `Volunteering ${index + 1}`}</span>
                </div>
              }
              extra={
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteVolunteering(index)}
                  size="small"
                />
              }
              className={styles.card}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Input
                  placeholder="e.g., Youth Mentor"
                  value={vol.role}
                  onChange={(e) => updateVolunteering(index, 'role', e.target.value)}
                  addonBefore="Role"
                />

                <Input
                  placeholder="e.g., Local Youth Center"
                  value={vol.organization}
                  onChange={(e) => updateVolunteering(index, 'organization', e.target.value)}
                  addonBefore="Organization"
                />

                <Input
                  placeholder="e.g., San Francisco, CA"
                  value={vol.location}
                  onChange={(e) => updateVolunteering(index, 'location', e.target.value)}
                  addonBefore="Location"
                />

                <Space>
                  <DatePicker
                    placeholder="Start Date"
                    picker="month"
                    value={vol.startDate ? dayjs(vol.startDate) : null}
                    onChange={(date) => updateVolunteering(index, 'startDate', date?.format('YYYY-MM'))}
                    format="MMM YYYY"
                  />
                  <DatePicker
                    placeholder="End Date"
                    picker="month"
                    value={vol.endDate ? dayjs(vol.endDate) : null}
                    onChange={(date) => updateVolunteering(index, 'endDate', date?.format('YYYY-MM'))}
                    format="MMM YYYY"
                    disabled={vol.current}
                  />
                  <Checkbox
                    checked={vol.current}
                    onChange={(e) => {
                      updateVolunteering(index, 'current', e.target.checked)
                      if (e.target.checked) {
                        updateVolunteering(index, 'endDate', null)
                      }
                    }}
                  >
                    Current
                  </Checkbox>
                </Space>

                <div className={styles.bulletSection}>
                  <label className={styles.bulletLabel}>
                    Description (Bullet Points)
                  </label>
                  {vol.description.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className={styles.bulletItem}>
                      <span className={styles.bulletDot}>•</span>
                      <TextArea
                        placeholder="e.g., Mentored 10+ youth in career development"
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
          ))
        )}
      </Space>
    </div>
  )
}
