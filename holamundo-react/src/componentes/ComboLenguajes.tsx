import { useState } from 'react'
import { useLenguajes } from '../hooks/useLenguajes'
import { useHistorial } from '../estado/HistorialContext'
import { Mensaje } from './Mensaje'

/** Tarjeta 3: combobox llenado desde GET /api/catalogos/lenguajes. */
export function ComboLenguajes() {
  const { opciones, cargando, error } = useLenguajes()
  const [clave, setClave] = useState('')
  const { agregar } = useHistorial()

  // Valor derivado: se calcula en cada render, no se guarda en otro estado (equivale a computed de Angular).
  const seleccion = opciones.find((o) => o.clave === clave)

  function elegir(nuevaClave: string) {
    setClave(nuevaClave)
    const o = opciones.find((x) => x.clave === nuevaClave)
    if (o) agregar('combo', o.texto)
  }

  return (
    <section className="tarjeta" aria-labelledby="titulo-combo">
      <h2 id="titulo-combo">3. Combobox con mensaje</h2>
      {cargando ? <p>Cargando opciones…</p> : (
        <>
          <label htmlFor="lenguaje">Lenguaje</label>
          <select id="lenguaje" value={clave} onChange={(e) => elegir(e.target.value)}>
            <option value="">— Elige una opción —</option>
            {opciones.map((o) => <option key={o.clave} value={o.clave}>{o.texto}</option>)}
          </select>
        </>
      )}
      <Mensaje exito={seleccion?.mensaje} error={error} />
    </section>
  )
}
