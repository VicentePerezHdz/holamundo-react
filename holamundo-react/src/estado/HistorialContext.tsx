import { createContext, useContext, useReducer, type ReactNode } from 'react'

// Manejo de estado global con Context + useReducer (sin librerías externas).
// Cada pantalla registra lo que hizo; el panel de historial lo lee desde cualquier ruta.

export interface EntradaHistorial {
  id: number
  origen: 'saludo' | 'calculadora' | 'combo'
  texto: string
}

type Accion =
  | { tipo: 'agregar'; origen: EntradaHistorial['origen']; texto: string }
  | { tipo: 'limpiar' }

/** Reducer: función pura (estado, acción) => nuevo estado. Nunca modifica el estado anterior. */
// eslint-disable-next-line react-refresh/only-export-components
export function historialReducer(estado: EntradaHistorial[], accion: Accion): EntradaHistorial[] {
  switch (accion.tipo) {
    case 'agregar': {
      const id = (estado[0]?.id ?? 0) + 1
      return [{ id, origen: accion.origen, texto: accion.texto }, ...estado].slice(0, 10)
    }
    case 'limpiar':
      return []
  }
}

interface HistorialApi {
  historial: EntradaHistorial[]
  agregar: (origen: EntradaHistorial['origen'], texto: string) => void
  limpiar: () => void
}

const HistorialContext = createContext<HistorialApi | null>(null)

export function HistorialProvider({ children }: { children: ReactNode }) {
  const [historial, dispatch] = useReducer(historialReducer, [])
  const api: HistorialApi = {
    historial,
    agregar: (origen, texto) => dispatch({ tipo: 'agregar', origen, texto }),
    limpiar: () => dispatch({ tipo: 'limpiar' }),
  }
  return <HistorialContext.Provider value={api}>{children}</HistorialContext.Provider>
}

/** Hook para consumir el contexto con un error claro si falta el Provider. */
// eslint-disable-next-line react-refresh/only-export-components
export function useHistorial(): HistorialApi {
  const ctx = useContext(HistorialContext)
  if (!ctx) throw new Error('useHistorial debe usarse dentro de <HistorialProvider>')
  return ctx
}
