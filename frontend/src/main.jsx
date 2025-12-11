// Polyfills for Node.js compatibility in browser
if (typeof window !== 'undefined') {
  if (typeof global === 'undefined') {
    window.global = window;
  }
  if (typeof process === 'undefined') {
    window.process = {
      env: {},
      browser: true,
      version: '',
      versions: { node: '' }
    };
  }
  if (typeof Buffer === 'undefined') {
    window.Buffer = {
      isBuffer: () => false,
      from: (data) => new Uint8Array(data),
      alloc: (size) => new Uint8Array(size)
    };
  }
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import 'antd/dist/reset.css'
import './styles/Global.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
