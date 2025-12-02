import { Card, Input, Button, Space, DatePicker } from 'antd'
import { PlusOutlined, DeleteOutlined, DragOutlined, BookFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import styles from './FormSection.module.css'

const { TextArea } = Input

export default function Publications({ data, onChange }) {
    const addPublication = () => {
        const newPub = {
            id: Date.now(),
            title: '',
            publisher: '',
            date: null,
            url: '',
            description: '',
        }
        onChange([...data, newPub])
    }

    const updatePublication = (index, field, value) => {
        const updated = [...data]
        updated[index] = { ...updated[index], [field]: value }
        onChange(updated)
    }

    const deletePublication = (index) => {
        onChange(data.filter((_, i) => i !== index))
    }

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>
                    <BookFilled /> Publications & Speaking
                </h3>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addPublication}
                    size="small"
                >
                    Add Publication
                </Button>
            </div>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {data.length === 0 ? (
                    <div className={styles.emptyState}>
                        Add published articles, papers, or speaking engagements
                    </div>
                ) : (
                    data.map((pub, index) => (
                        <Card
                            key={pub.id}
                            size="small"
                            title={
                                <div className={styles.cardTitle}>
                                    <DragOutlined className={styles.dragHandle} />
                                    <span>{pub.title || `Publication ${index + 1}`}</span>
                                </div>
                            }
                            extra={
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => deletePublication(index)}
                                    size="small"
                                />
                            }
                            className={styles.card}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <Input
                                    placeholder="e.g., Machine Learning in Healthcare"
                                    value={pub.title}
                                    onChange={(e) => updatePublication(index, 'title', e.target.value)}
                                    addonBefore="Title"
                                />

                                <Input
                                    placeholder="e.g., IEEE Journal / Tech Conference 2024"
                                    value={pub.publisher}
                                    onChange={(e) => updatePublication(index, 'publisher', e.target.value)}
                                    addonBefore="Publisher/Event"
                                />

                                <DatePicker
                                    placeholder="Publication Date"
                                    picker="month"
                                    value={pub.date ? dayjs(pub.date) : null}
                                    onChange={(date) => updatePublication(index, 'date', date?.format('YYYY-MM'))}
                                    format="MMM YYYY"
                                    style={{ width: '100%' }}
                                />

                                <Input
                                    placeholder="https://publication-url.com"
                                    value={pub.url}
                                    onChange={(e) => updatePublication(index, 'url', e.target.value)}
                                    addonBefore="URL"
                                />

                                <TextArea
                                    placeholder="Brief description or abstract"
                                    value={pub.description}
                                    onChange={(e) => updatePublication(index, 'description', e.target.value)}
                                    autoSize={{ minRows: 2, maxRows: 3 }}
                                />
                            </Space>
                        </Card>
                    ))
                )}
            </Space>
        </div>
    )
}
