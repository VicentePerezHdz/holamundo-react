import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HistorialProvider } from './estado/HistorialContext'
import App from './App'
import './index.css'

// Punto de entrada (equivale a main.ts + app.config.ts de Angular, o Program.cs de .NET):
// aquí se "registran" los proveedores que envuelven a toda la app.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <HistorialProvider>
        <App />
      </HistorialProvider>
    </BrowserRouter>
  </StrictMode>,
)
