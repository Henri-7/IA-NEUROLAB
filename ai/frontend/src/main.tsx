import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import '@fontsource/geist-mono/400.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)
