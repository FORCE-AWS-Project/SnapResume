import { useState, useEffect, useRef } from 'react'
import { Card, Empty, Spin, Alert } from 'antd'
import { TemplateRenderer } from '../../../utils/TemplateRenderer'
import html2pdf from 'html2pdf.js'
import styles from './PreviewPanel.module.css'

export default function PreviewPanel({ data, template, zoom = 100 }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pdfUrl, setPdfUrl] = useState('')
  const previewStyle = { transform: `scale(${zoom / 100})`, transformOrigin: 'top left', transition: 'transform 0.2s ease' }

  useEffect(() => {
    const generatePDF = async () => {
      if (!template || !template.templateFileUrl || !data) {
        setPdfUrl('')
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Get the HTML template
        const html = await TemplateRenderer.renderTemplate(template.templateFileUrl, data)

        // Create a temporary container
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        tempDiv.style.padding = '20mm'
        tempDiv.style.backgroundColor = 'white'

        // Configure PDF options
        const opt = {
          margin: 0,
          filename: 'resume.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }

        // Generate PDF
        const pdf = await html2pdf().from(tempDiv).set(opt).toContainer().output('blob')

        // Create URL for the PDF blob
        const url = URL.createObjectURL(pdf)
        setPdfUrl(url)

        // Cleanup previous URL if exists
        return () => {
          if (url) URL.revokeObjectURL(url)
        }
      } catch (err) {
        console.error('Failed to generate PDF:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    generatePDF()
  }, [template, data])

  return (
    <div className={styles.preview}>
      <div className={styles.previewWrapper} style={previewStyle}>
        {!data ? (
          <Empty description="Start filling in your information to preview your resume" />
        ) : (
          <Card className={styles.card} style={{ width: '100%', padding: 0, overflow: 'auto' }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '50px', height: '100%' }}>
                <Spin size="large" />
              </div>
            )}
            {error && (
              <div style={{ padding: '16px' }}>
                <Alert
                  message="Error loading template"
                  description={error}
                  type="error"
                />
              </div>
            )}
            {!loading && !error && pdfUrl && (
              <embed
                src={pdfUrl}
                type="application/pdf"
                style={{
                  width: '100%',
                  height: '500px',
                  border: 'none'
                }}
              />
            )}
          </Card>
        )}
      </div>
    </div>
  )
}