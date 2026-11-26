import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { Saludo } from './componentes/Saludo'
import { Calculadora } from './componentes/Calculadora'
import { ComboLenguajes } from './componentes/ComboLenguajes'
import { Historial } from './componentes/Historial'

/**
 * Componente raíz: encabezado, menú y rutas.
 * Routing con react-router: cada tarjeta tiene su URL (/saludo, /calculadora, /combo).
 */
export default function App() {
  return (
    <div className="app">
      <header>
        <h1>Hola Mundo React 18 + .NET 8</h1>
        <nav aria-label="Principal">
          {/* NavLink agrega la clase "active" a la ruta actual */}
          <NavLink to="/saludo">Saludo</NavLink>
          <NavLink to="/calculadora">Calculadora</NavLink>
          <NavLink to="/combo">Combobox</NavLink>
        </nav>
      </header>
      <div className="contenido">
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/saludo" replace />} />
            <Route path="/saludo" element={<Saludo />} />
            <Route path="/calculadora" element={<Calculadora />} />
            <Route path="/combo" element={<ComboLenguajes />} />
            <Route path="*" element={<p>Página no encontrada.</p>} />
          </Routes>
        </main>
        <Historial />
      </div>
    </div>
  )
}
