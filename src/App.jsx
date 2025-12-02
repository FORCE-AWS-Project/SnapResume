import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import LandingPage from './pages/LandingPage/LandingPage'
import TemplatesPage from './pages/TemplatesPage/TemplatesPage'
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
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App
