import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import HeroSection from './components/HeroSection'
import AISection from './components/AISection'
import StatsSection from './components/StatsSection'
import TestimonialsSection from './components/TestimonialsSection'
import ToolsSection from './components/ToolsSection'
import PricingSection from './components/PricingSection'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <HeroSection onGetStarted={() => navigate('/auth')} />
        <AISection />
        <StatsSection />
        <TestimonialsSection />
        <ToolsSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}