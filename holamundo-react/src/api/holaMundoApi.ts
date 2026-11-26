import type {
  CalculoRequest, CalculoResponse, OpcionCatalogo, ProblemDetails, SaludoResponse,
} from './contratos'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5080/api'

/** Error con un mensaje ya listo para mostrarse al usuario. */
export class ApiError extends Error {
  readonly status: number
  constructor(mensaje: string, status: number) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Único lugar donde React habla con .NET (igual que HolaMundoApiService en Angular).
 * Usa fetch nativo. El AbortSignal permite cancelar la petición si el componente se desmonta;
 * en .NET eso llega como CancellationToken.
 */
async function pedir<T>(ruta: string, init: RequestInit = {}): Promise<T> {
  let resp: Response
  try {
    resp = await fetch(`${BASE}${ruta}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e // cancelación: no es un error real
    throw new ApiError('No hay conexión con la API. ¿Está corriendo "dotnet run" en el puerto 5080?', 0)
  }

  if (!resp.ok) throw new ApiError(await aMensaje(resp), resp.status)
  return (await resp.json()) as T
}

/** Traduce el ProblemDetails de .NET a un texto legible. */
async function aMensaje(resp: Response): Promise<string> {
  try {
    const p = (await resp.json()) as ProblemDetails
    const validacion = p.errors ? Object.values(p.errors).flat().join(' ') : ''
    return validacion || p.detail || p.title || `Error ${resp.status}`
  } catch {
    return `Error ${resp.status}`
  }
}

export const holaMundoApi = {
  saludar: (nombre: string, signal?: AbortSignal) =>
    pedir<SaludoResponse>('/saludo', { method: 'POST', body: JSON.stringify({ nombre }), signal }),

  calcular: (req: CalculoRequest, signal?: AbortSignal) =>
    pedir<CalculoResponse>('/calculadora', { method: 'POST', body: JSON.stringify(req), signal }),

  lenguajes: (signal?: AbortSignal) =>
    pedir<OpcionCatalogo[]>('/catalogos/lenguajes', { signal }),
}
