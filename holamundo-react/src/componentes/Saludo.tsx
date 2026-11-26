import { useState, type FormEvent } from 'react'
import { holaMundoApi } from '../api/holaMundoApi'
import { useHistorial } from '../estado/HistorialContext'
import { Mensaje } from './Mensaje'

/** Tarjeta 1: input de texto controlado + POST /api/saludo. */
export function Saludo() {
  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const { agregar } = useHistorial()

  async function enviar(e: FormEvent) {
    e.preventDefault() // un <form> recarga la página por defecto; lo evitamos
    setCargando(true)
    setError(null)
    setMensaje(null)
    try {
      const r = await holaMundoApi.saludar(nombre)
      setMensaje(r.mensaje)
      agregar('saludo', r.mensaje)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="tarjeta" aria-labelledby="titulo-saludo">
      <h2 id="titulo-saludo">1. Saludo</h2>
      <form onSubmit={enviar}>
        <label htmlFor="nombre">Nombre</label>
        {/* Input controlado: React es la única fuente de verdad del valor */}
        <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
          placeholder="Escribe tu nombre" autoComplete="off" />
        <button type="submit" disabled={cargando}>{cargando ? 'Enviando…' : 'Saludar'}</button>
      </form>
      <Mensaje exito={mensaje} error={error} />
    </section>
  )
}
