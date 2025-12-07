import { Card, Input, Button, Space, DatePicker, Checkbox, Select, Tooltip } from 'antd'
import { PlusOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import styles from './FormSection.module.css'

const { Option } = Select

export default function Education({ data, onChange }) {
    // Ensure data is an array
    const eduData = Array.isArray(data) ? data : []

    const addEducation = () => {
        const newEdu = {
            id: Date.now(),
            degree: '',
            major: '',
            institution: '',
            location: '',
            graduationYear: null,
            gpa: '',
            honors: '',
            hideGradYear: false,
        }
        onChange([...eduData, newEdu])
    }

    const updateEducation = (index, field, value) => {
        const updated = [...eduData]
        updated[index] = { ...updated[index], [field]: value }
        onChange(updated)
    }

    const deleteEducation = (index) => {
        onChange(eduData.filter((_, i) => i !== index))
    }

    const degreeTypes = [
        'High School Diploma',
        'Associate Degree',
        'Bachelor of Science (BS)',
        'Bachelor of Arts (BA)',
        'Master of Science (MS)',
        'Master of Arts (MA)',
        'Master of Business Administration (MBA)',
        'Doctor of Philosophy (PhD)',
        'Juris Doctor (JD)',
        'Doctor of Medicine (MD)',
        'Other',
    ]

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Education</h3>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addEducation}
                    size="small"
                >
                    Add Education
                </Button>
            </div>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {eduData.length === 0 ? (
                    <div className={styles.emptyState}>
                        Click "Add Education" to add your educational background
                    </div>
                ) : (
                    eduData.map((edu, index) => (
                        <Card
                            key={edu.id}
                            size="small"
                            title={
                                <div className={styles.cardTitle}>
                                    <DragOutlined className={styles.dragHandle} />
                                    <span>{edu.degree || `Education ${index + 1}`}</span>
                                </div>
                            }
                            extra={
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => deleteEducation(index)}
                                    size="small"
                                />
                            }
                            className={styles.card}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <Select
                                    placeholder="Select degree type"
                                    value={edu.degree || undefined}
                                    onChange={(value) => updateEducation(index, 'degree', value)}
                                    style={{ width: '100%' }}
                                    showSearch
                                    allowClear
                                >
                                    {degreeTypes.map(degree => (
                                        <Option key={degree} value={degree}>{degree}</Option>
                                    ))}
                                </Select>

                                <Input
                                    placeholder="e.g., Computer Science"
                                    value={edu.major}
                                    onChange={(e) => updateEducation(index, 'major', e.target.value)}
                                    addonBefore="Major/Field"
                                />

                                <Input
                                    placeholder="e.g., Stanford University"
                                    value={edu.institution}
                                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                    addonBefore="Institution"
                                />

                                <Input
                                    placeholder="e.g., Stanford, CA"
                                    value={edu.location}
                                    onChange={(e) => updateEducation(index, 'location', e.target.value)}
                                    addonBefore="Location"
                                />

                                <Space>
                                    <DatePicker
                                        placeholder="Graduation Year"
                                        picker="year"
                                        value={edu.graduationYear ? dayjs(edu.graduationYear) : null}
                                        onChange={(date) => updateEducation(index, 'graduationYear', date?.format('YYYY'))}
                                        disabled={edu.hideGradYear}
                                    />
                                    <Checkbox
                                        checked={edu.hideGradYear}
                                        onChange={(e) => updateEducation(index, 'hideGradYear', e.target.checked)}
                                    >
                                        <Tooltip title="Hide to prevent age discrimination">
                                            Hide Year
                                        </Tooltip>
                                    </Checkbox>
                                </Space>

                                <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                        placeholder="GPA (optional)"
                                        value={edu.gpa}
                                        onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                        addonBefore="GPA"
                                        style={{ width: '50%' }}
                                    />
                                    <Input
                                        placeholder="e.g., Summa Cum Laude"
                                        value={edu.honors}
                                        onChange={(e) => updateEducation(index, 'honors', e.target.value)}
                                        addonBefore="Honors"
                                        style={{ width: '50%' }}
                                    />
                                </Space.Compact>
                            </Space>
                        </Card>
                    ))
                )}
            </Space>
        </div>
    )
}
