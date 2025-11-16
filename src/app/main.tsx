import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRouter } from './Router'
import '@/shared/styles/styles.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
