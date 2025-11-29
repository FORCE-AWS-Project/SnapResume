import { Card, Input, Button, Space, DatePicker, Select } from 'antd'
import { PlusOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import styles from './FormSection.module.css'

const { Option } = Select

export default function Certifications({ data, onChange }) {
    const addCertification = () => {
        const newCert = {
            id: Date.now(),
            name: '',
            issuer: '',
            issueDate: null,
            expiryDate: null,
            credentialId: '',
            credentialUrl: '',
            doesNotExpire: false,
        }
        onChange([...data, newCert])
    }

    const updateCertification = (index, field, value) => {
        const updated = [...data]
        updated[index] = { ...updated[index], [field]: value }
        onChange(updated)
    }

    const deleteCertification = (index) => {
        onChange(data.filter((_, i) => i !== index))
    }

    const popularCerts = [
        'AWS Certified Solutions Architect',
        'AWS Certified Developer',
        'Google Cloud Professional',
        'Microsoft Azure Administrator',
        'Certified Kubernetes Administrator (CKA)',
        'PMP (Project Management Professional)',
        'Certified ScrumMaster (CSM)',
        'CompTIA Security+',
        'CISSP',
    ]

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Certifications</h3>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addCertification}
                    size="small"
                >
                    Add Certification
                </Button>
            </div>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {data.length === 0 ? (
                    <div className={styles.emptyState}>
                        Add professional certifications to stand out
                    </div>
                ) : (
                    data.map((cert, index) => (
                        <Card
                            key={cert.id}
                            size="small"
                            title={
                                <div className={styles.cardTitle}>
                                    <DragOutlined className={styles.dragHandle} />
                                    <span>{cert.name || `Certification ${index + 1}`}</span>
                                </div>
                            }
                            extra={
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => deleteCertification(index)}
                                    size="small"
                                />
                            }
                            className={styles.card}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <Select
                                    placeholder="Select or type certification name"
                                    value={cert.name || undefined}
                                    onChange={(value) => updateCertification(index, 'name', value)}
                                    style={{ width: '100%' }}
                                    showSearch
                                    allowClear
                                    mode="tags"
                                    maxCount={1}
                                    dropdownRender={(menu) => (
                                        <>
                                            <div style={{ padding: 8, fontWeight: 500, fontSize: 12, color: '#8c8c8c' }}>
                                                Popular Certifications
                                            </div>
                                            {menu}
                                        </>
                                    )}
                                >
                                    {popularCerts.map(cert => (
                                        <Option key={cert} value={cert}>{cert}</Option>
                                    ))}
                                </Select>

                                <Input
                                    placeholder="e.g., Amazon Web Services"
                                    value={cert.issuer}
                                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                    addonBefore="Issuing Organization"
                                />

                                <Space>
                                    <DatePicker
                                        placeholder="Issue Date"
                                        picker="month"
                                        value={cert.issueDate ? dayjs(cert.issueDate) : null}
                                        onChange={(date) => updateCertification(index, 'issueDate', date?.format('YYYY-MM'))}
                                        format="MMM YYYY"
                                    />
                                    <DatePicker
                                        placeholder="Expiry Date"
                                        picker="month"
                                        value={cert.expiryDate ? dayjs(cert.expiryDate) : null}
                                        onChange={(date) => updateCertification(index, 'expiryDate', date?.format('YYYY-MM'))}
                                        format="MMM YYYY"
                                        disabled={cert.doesNotExpire}
                                    />
                                </Space>

                                <Input
                                    placeholder="Credential ID (optional)"
                                    value={cert.credentialId}
                                    onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                                    addonBefore="Credential ID"
                                />

                                <Input
                                    placeholder="https://credentials.example.com/verify"
                                    value={cert.credentialUrl}
                                    onChange={(e) => updateCertification(index, 'credentialUrl', e.target.value)}
                                    addonBefore="Verification URL"
                                />
                            </Space>
                        </Card>
                    ))
                )}
            </Space>
        </div>
    )
}
