import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage/LandingPage'
import FeaturesPage from './pages/FeaturesPage/FeaturesPage'
import TemplatesPage from './pages/TemplatesPage/TemplatesPage'
import PricingPage from './pages/PricingPage/PricingPage'
import AboutPage from './pages/AboutPage/AboutPage'
import Auth from './pages/Auth/Auth'
import EditorPage from './pages/EditorPage/EditorPage'

function App() {
  const theme = {
    token: {
      colorPrimary: '#d4a574',
      borderRadius: 4,
    },
  }

  return (
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/editor" element={<EditorPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App
