import { useHistorial } from '../estado/HistorialContext'

/** Panel lateral que lee el estado global. Sigue visible al cambiar de ruta. */
export function Historial() {
  const { historial, limpiar } = useHistorial()
  return (
    <aside className="historial" aria-label="Historial">
      <h2>Historial</h2>
      {historial.length === 0 ? <p>Sin acciones todavía.</p> : (
        <>
          <ol>{historial.map((h) => <li key={h.id}><strong>{h.origen}:</strong> {h.texto}</li>)}</ol>
          <button type="button" onClick={limpiar}>Limpiar</button>
        </>
      )}
    </aside>
  )
}
