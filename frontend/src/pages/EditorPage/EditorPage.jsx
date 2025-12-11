import { ResumeManagerProvider } from '../../components/ResumeManager/context/ResumeManagerContext'
import { ResumeProvider } from '../../contexts/ResumeContext'
import EditorPageContent from './EditorPageContent'
import styles from './EditorPage.module.css'


export default function EditorPage() {
  return (
    <ResumeManagerProvider>
      <ResumeProvider>
        <EditorPageContent />
      </ResumeProvider>
    </ResumeManagerProvider>
  )
}