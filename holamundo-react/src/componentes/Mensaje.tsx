/**
 * Componente presentacional reutilizable: solo recibe props y pinta.
 * role="status" / role="alert" hacen que los lectores de pantalla anuncien el cambio (accesibilidad).
 */
export function Mensaje({ exito, error }: { exito?: string | null; error?: string | null }) {
  if (error) return <p role="alert" className="mensaje error">{error}</p>
  if (exito) return <p role="status" className="mensaje exito">{exito}</p>
  return null
}
