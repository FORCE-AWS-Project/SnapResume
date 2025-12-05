/**
 * Hook to use ResumeManagerModal in your components
 * 
 * Example:
 * const { managerVisible, openManager, closeManager } = useResumeManager()
 * 
 * <Button onClick={openManager}>Manage Resume</Button>
 * <ResumeManagerModal
 *   visible={managerVisible}
 *   onClose={closeManager}
 *   resumeData={resumeData}
 *   onUpdateData={setResumeData}
 * />
 */

import { useState } from 'react'

export function useResumeManager() {
  const [managerVisible, setManagerVisible] = useState(false)

  const openManager = () => setManagerVisible(true)
  const closeManager = () => setManagerVisible(false)

  return {
    managerVisible,
    openManager,
    closeManager,
  }
}

/**
 * Helper to get section display info
 */
export function getSectionInfo(section) {
  const sectionMap = {
    personal: { icon: '??', label: 'Personal Information', color: '#2563eb' },
    experience: { icon: '??', label: 'Work Experience', color: '#059669' },
    education: { icon: '??', label: 'Education', color: '#7c3aed' },
    skills: { icon: '?', label: 'Skills', color: '#f59e0b' },
    certifications: { icon: '??', label: 'Certifications', color: '#dc2626' },
    projects: { icon: '??', label: 'Projects', color: '#0891b2' },
  }

  return sectionMap[section] || { icon: '??', label: 'Section', color: '#6b7280' }
}

/**
 * Check if resume data is complete
 */
export function isResumeComplete(resumeData) {
  const hasPersonal = resumeData.personalInfo?.fullName
  const hasExperience = resumeData.experience?.length > 0
  const hasEducation = resumeData.education?.length > 0
  const hasSkills = resumeData.skills?.length > 0

  return hasPersonal && hasExperience && hasEducation && hasSkills
}

/**
 * Get resume completion percentage
 */
export function getResumeCompletionPercentage(resumeData) {
  let completed = 0
  let total = 6

  if (resumeData.personalInfo?.fullName) completed++
  if (resumeData.experience?.length > 0) completed++
  if (resumeData.education?.length > 0) completed++
  if (resumeData.skills?.length > 0) completed++
  if (resumeData.certifications?.length > 0) completed++
  if (resumeData.projects?.length > 0) completed++

  return Math.round((completed / total) * 100)
}
