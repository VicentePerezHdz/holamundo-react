import { useState, type FormEvent } from 'react'
import { holaMundoApi } from '../api/holaMundoApi'
import type { Operacion } from '../api/contratos'
import { useHistorial } from '../estado/HistorialContext'
import { Mensaje } from './Mensaje'

const OPERACIONES: { valor: Operacion; simbolo: string }[] = [
  { valor: 'suma', simbolo: '+' },
  { valor: 'resta', simbolo: '−' },
  { valor: 'multiplicacion', simbolo: '×' },
  { valor: 'division', simbolo: '÷' },
]

/** Tarjeta 2: calculadora. La regla (incluida la división entre cero) vive en .NET. */
export function Calculadora() {
  // Un solo objeto de estado para el formulario; se actualiza con spread (inmutable).
  const [form, setForm] = useState({ a: '10', b: '5', operacion: 'suma' as Operacion })
  const [resultado, setResultado] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { agregar } = useHistorial()

  async function calcular(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setResultado(null)
    try {
      const r = await holaMundoApi.calcular({ a: Number(form.a), b: Number(form.b), operacion: form.operacion })
      setResultado(r.expresion)
      agregar('calculadora', r.expresion)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section className="tarjeta" aria-labelledby="titulo-calc">
      <h2 id="titulo-calc">2. Calculadora</h2>
      <form onSubmit={calcular} className="fila">
        <label className="oculto" htmlFor="a">Número A</label>
        <input id="a" type="number" value={form.a} onChange={(e) => setForm({ ...form, a: e.target.value })} />
        <label className="oculto" htmlFor="op">Operación</label>
        <select id="op" value={form.operacion}
          onChange={(e) => setForm({ ...form, operacion: e.target.value as Operacion })}>
          {OPERACIONES.map((o) => <option key={o.valor} value={o.valor}>{o.simbolo}</option>)}
        </select>
        <label className="oculto" htmlFor="b">Número B</label>
        <input id="b" type="number" value={form.b} onChange={(e) => setForm({ ...form, b: e.target.value })} />
        <button type="submit">Calcular</button>
      </form>
      <Mensaje exito={resultado} error={error} />
    </section>
  )
}
