import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { HistorialProvider, historialReducer } from '../estado/HistorialContext'

// React Testing Library: se prueba como lo usa una persona (por etiquetas y roles), no por detalles internos.
// fetch se reemplaza con un doble (vi.fn) para no depender de la API real.

function respuesta(status: number, cuerpo: unknown) {
  return Promise.resolve(new Response(JSON.stringify(cuerpo), {
    status, headers: { 'Content-Type': 'application/json' },
  }))
}

function montar(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <HistorialProvider><App /></HistorialProvider>
    </MemoryRouter>,
  )
}

afterEach(() => vi.restoreAllMocks())

describe('Saludo', () => {
  it('envía el nombre a la API, muestra el saludo y lo agrega al historial', async () => {
    const fetchFalso = vi.spyOn(globalThis, 'fetch')
      .mockImplementation(() => respuesta(200, { mensaje: '¡Hola, Vicente!', fechaUtc: '2026-11-23T00:00:00Z' }))

    montar('/saludo')
    await userEvent.type(screen.getByLabelText('Nombre'), 'Vicente')
    await userEvent.click(screen.getByRole('button', { name: 'Saludar' }))

    expect(await screen.findByRole('status')).toHaveTextContent('¡Hola, Vicente!')
    expect(screen.getByRole('complementary', { name: 'Historial' })).toHaveTextContent('¡Hola, Vicente!')
    const [url, init] = fetchFalso.mock.calls[0]
    expect(url).toBe('http://localhost:5080/api/saludo')
    expect(JSON.parse(init!.body as string)).toEqual({ nombre: 'Vicente' })
  })

  it('muestra el error de validación que manda .NET (ProblemDetails)', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      respuesta(400, { title: 'Validación', errors: { Nombre: ['El nombre es obligatorio.'] } }))

    montar('/saludo')
    await userEvent.click(screen.getByRole('button', { name: 'Saludar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El nombre es obligatorio.')
  })
})

describe('Calculadora', () => {
  it('muestra el detail del ProblemDetails al dividir entre cero', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      respuesta(400, { title: 'Regla de negocio', detail: 'No se puede dividir entre cero.' }))

    montar('/calculadora')
    await userEvent.selectOptions(screen.getByLabelText('Operación'), 'division')
    await userEvent.click(screen.getByRole('button', { name: 'Calcular' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se puede dividir entre cero.')
  })
})

describe('Combobox', () => {
  it('carga las opciones al montar y muestra el mensaje de la elegida', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => respuesta(200, [
      { clave: 'react', texto: 'React', mensaje: 'Hooks y componentes.' },
    ]))

    montar('/combo')
    await userEvent.selectOptions(await screen.findByLabelText('Lenguaje'), 'react')

    expect(screen.getByRole('status')).toHaveTextContent('Hooks y componentes.')
  })

  it('avisa si la API no está corriendo', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    montar('/combo')
    expect(await screen.findByRole('alert')).toHaveTextContent('No hay conexión con la API')
  })
})

describe('historialReducer (función pura)', () => {
  it('agrega al inicio y limpia', () => {
    const uno = historialReducer([], { tipo: 'agregar', origen: 'saludo', texto: 'a' })
    const dos = historialReducer(uno, { tipo: 'agregar', origen: 'combo', texto: 'b' })
    expect(dos.map((h) => h.texto)).toEqual(['b', 'a'])
    expect(historialReducer(dos, { tipo: 'limpiar' })).toEqual([])
  })
})
