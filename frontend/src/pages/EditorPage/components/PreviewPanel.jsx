import { useState, useEffect } from 'react'
import { Card, Empty, Spin, Alert } from 'antd'
import { TemplateRenderer } from '../../../utils/TemplateRenderer'
import html2pdf from 'html2pdf.js'
import styles from './PreviewPanel.module.css'

export default function PreviewPanel({ data, template, zoom = 100, onZoomChange }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pdfUrl, setPdfUrl] = useState('')
  const [currentPdfUrl, setCurrentPdfUrl] = useState('')
  const [debouncedData, setDebouncedData] = useState(data)
  const previewStyle = { transform: `scale(${zoom / 100})`, transformOrigin: 'top left', transition: 'transform 0.2s ease' }

  // Debounce data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedData(data)
    }, 1000) // Wait 1 second after changes before regenerating PDF

    return () => clearTimeout(timer)
  }, [data])

  useEffect(() => {
    const generatePDF = async () => {
      if (!template || !template.templateFileUrl || !debouncedData) {
        setPdfUrl('')
        setCurrentPdfUrl('')
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Get the HTML template
        const html = await TemplateRenderer.renderTemplate(template.templateFileUrl, debouncedData)

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

        // Revoke previous URL if it exists
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl)
        }

              setCurrentPdfUrl(url)
      } catch (err) {
        console.error('Failed to generate PDF:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    generatePDF()
  }, [template, debouncedData])

  // Update pdfUrl when loading completes and we have a new URL
  useEffect(() => {
    if (!loading && currentPdfUrl) {
      setPdfUrl(currentPdfUrl)
    }
  }, [loading, currentPdfUrl])

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
      if (currentPdfUrl) {
        URL.revokeObjectURL(currentPdfUrl)
      }
    }
  }, [])

  return (
    <div className={styles.preview}>
      <div className={styles.previewWrapper} style={previewStyle}>
        {!data ? (
          <Empty description="Start filling in your information to preview your resume" />
        ) : (
          <Card className={styles.card} style={{ width: '100%', padding: 0, overflow: 'auto' }}>
            {error && (
              <div style={{ padding: '16px' }}>
                <Alert
                  message="Error loading template"
                  description={error}
                  type="error"
                />
              </div>
            )}
            {!error && (
              <div style={{ position: 'relative', width: '100%', height: '500px' }}>
                {(pdfUrl || (loading && currentPdfUrl)) && (
                  <embed
                    src={loading && currentPdfUrl ? currentPdfUrl : pdfUrl}
                    type="application/pdf"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                  />
                )}
                {loading && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      zIndex: 1
                    }}
                  >
                    <Spin size="large" tip="Generating PDF..." />
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}