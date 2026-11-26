import { useEffect, useState } from 'react'
import { holaMundoApi } from '../api/holaMundoApi'
import type { OpcionCatalogo } from '../api/contratos'

/**
 * Hook personalizado: encapsula "cargar datos al montar" para reutilizarlo en cualquier componente.
 * Regla de los hooks: su nombre empieza con "use" y solo se llaman en el nivel superior de un componente.
 */
export function useLenguajes() {
  const [opciones, setOpciones] = useState<OpcionCatalogo[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // AbortController: si el componente se desmonta antes de que llegue la respuesta,
    // se cancela la petición y no se actualiza un estado que ya no existe.
    const control = new AbortController()

    holaMundoApi.lenguajes(control.signal)
      .then(setOpciones)
      .catch((e: Error) => { if (e.name !== 'AbortError') setError(e.message) })
      .finally(() => { if (!control.signal.aborted) setCargando(false) })

    return () => control.abort() // función de limpieza del efecto
  }, []) // [] = solo al montar (equivale a ngOnInit)

  return { opciones, cargando, error }
}
