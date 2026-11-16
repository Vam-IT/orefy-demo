import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens/colors.css'
import './styles/tokens/typography.css'
import './styles/tokens/spacing.css'
import './styles/tokens/effects.css'
import './styles/app.css'
import { App } from './App.tsx'
import { initTracking } from './track.ts'

initTracking()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
