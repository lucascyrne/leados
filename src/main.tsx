import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './components/AuthProvider'
import { RootErrorBoundary } from './components/RootErrorBoundary'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RootErrorBoundary>
          <App />
        </RootErrorBoundary>
      </AuthProvider>
      <Toaster richColors position="bottom-center" closeButton />
    </BrowserRouter>
  </StrictMode>,
)
