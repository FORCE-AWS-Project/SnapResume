/**
 * Export resume data to different formats
 * Supports: JSON Resume Standard, PDF, DOCX
 */

/**
 * Convert resume data to JSON Resume format
 * https://jsonresume.org/schema/
 */
export const exportToJSON = (resumeData) => {
  const formatDate = (date) => {
    if (!date) return null
    return date // Already in YYYY-MM format
  }

  const formatLocation = (location) => {
    if (typeof location === 'string') {
      return { city: location, countryCode: '', region: '' }
    }
    return {
      city: location.city || '',
      countryCode: location.country || '',
      region: location.state || '',
    }
  }

  const jsonResume = {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: resumeData.personalInfo.fullName || '',
      label: resumeData.personalInfo.roleTitle || '',
      image: resumeData.personalInfo.photoUrl || '',
      email: resumeData.personalInfo.email || '',
      phone: resumeData.personalInfo.phone || '',
      url: resumeData.personalInfo.links?.portfolio || '',
      summary: resumeData.personalInfo.summary || '',
      location: formatLocation(resumeData.personalInfo.location),
      profiles: [
        resumeData.personalInfo.links?.linkedin && {
          network: 'LinkedIn',
          username: '',
          url: resumeData.personalInfo.links.linkedin,
        },
        resumeData.personalInfo.links?.github && {
          network: 'GitHub',
          username: '',
          url: resumeData.personalInfo.links.github,
        },
      ].filter(Boolean),
    },
    work: resumeData.experience?.map(exp => ({
      name: exp.company || '',
      position: exp.jobTitle || '',
      location: exp.location || '',
      startDate: formatDate(exp.startDate),
      endDate: exp.current ? null : formatDate(exp.endDate),
      summary: '',
      highlights: exp.description?.filter(Boolean) || [],
      url: '',
    })) || [],
    education: resumeData.education?.map(edu => ({
      institution: edu.institution || '',
      area: edu.major || '',
      studyType: edu.degree || '',
      startDate: '',
      endDate: edu.graduationYear || '',
      score: edu.gpa || '',
      courses: [],
    })) || [],
    skills: resumeData.skills?.categories?.map(cat => ({
      name: cat.name || '',
      level: '',
      keywords: cat.skills || [],
    })) || [],
    projects: resumeData.projects?.map(project => ({
      name: project.title || '',
      description: project.description || '',
      highlights: [],
      keywords: project.techStack || [],
      startDate: '',
      endDate: '',
      url: project.url || project.github || '',
      roles: [project.role || ''],
      entity: '',
      type: '',
    })) || [],
    certificates: resumeData.certifications?.map(cert => ({
      name: cert.name || '',
      date: formatDate(cert.issueDate),
      issuer: cert.issuer || '',
      url: cert.credentialUrl || '',
    })) || [],
    languages: resumeData.languages?.map(lang => ({
      language: lang.language || '',
      fluency: lang.proficiency || '',
    })) || [],
    volunteer: resumeData.volunteering?.map(vol => ({
      organization: vol.organization || '',
      position: vol.role || '',
      url: '',
      startDate: formatDate(vol.startDate),
      endDate: vol.current ? null : formatDate(vol.endDate),
      summary: '',
      highlights: vol.description?.filter(Boolean) || [],
    })) || [],
    publications: resumeData.publications?.map(pub => ({
      name: pub.title || '',
      publisher: pub.publisher || '',
      releaseDate: formatDate(pub.date),
      url: pub.url || '',
      summary: pub.description || '',
    })) || [],
  }

  return JSON.stringify(jsonResume, null, 2)
}

/**
 * Download resume as JSON file
 */
export const downloadJSON = (resumeData, filename = 'resume.json') => {
  const jsonString = exportToJSON(resumeData)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export to PDF using browser print
 * This is a basic implementation. For production, consider using:
 * - jsPDF with html2canvas
 * - react-pdf
 * - Server-side PDF generation (Puppeteer, wkhtmltopdf)
 */
export const exportToPDF = () => {
  window.print()
}

/**
 * Export to DOCX
 * For production, integrate with libraries like:
 * - docx (https://www.npmjs.com/package/docx)
 * - html-docx-js
 * - Server-side generation with pandoc
 */
export const exportToDOCX = (resumeData) => {
  // Placeholder for DOCX export
  // This would require additional libraries
  console.warn('DOCX export requires additional implementation')
  alert('DOCX export is coming soon! For now, please use PDF export or print to PDF.')
}

/**
 * Validate resume data for ATS compatibility
 */
export const validateATS = (resumeData) => {
  const issues = []

  // Check for essential fields
  if (!resumeData.personalInfo.fullName) {
    issues.push({ field: 'Full Name', message: 'Required for ATS parsing' })
  }
  if (!resumeData.personalInfo.email) {
    issues.push({ field: 'Email', message: 'Required for ATS parsing' })
  }
  if (!resumeData.personalInfo.phone) {
    issues.push({ field: 'Phone', message: 'Required for ATS parsing' })
  }

  // Check for standard section headers
  if (resumeData.experience?.length === 0) {
    issues.push({ field: 'Experience', message: 'Most ATS systems expect work experience' })
  }

  // Check bullet points in experience
  resumeData.experience?.forEach((exp, index) => {
    if (exp.description?.length === 0) {
      issues.push({
        field: `Experience ${index + 1}`,
        message: 'Add bullet points describing your achievements',
      })
    }
  })

  // Warn about photos in ATS-unfriendly regions
  if (resumeData.personalInfo.showPhoto) {
    issues.push({
      field: 'Photo',
      message: 'Warning: Photos may cause ATS issues in US/UK/Canada',
      severity: 'warning',
    })
  }

  return {
    isValid: issues.filter(i => i.severity !== 'warning').length === 0,
    issues,
  }
}
