import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4200,
          style: {
            background: '#ffffff',
            color: '#1b2673',
            border: '1px solid rgba(212, 216, 233, 1)',
            boxShadow: '0 18px 60px rgba(27, 38, 115, 0.12)',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
