// Espejo en TypeScript de Contracts/Contratos.cs de la API .NET.
// .NET serializa en camelCase: Mensaje -> mensaje.

export interface SaludoResponse {
  mensaje: string
  fechaUtc: string
}

export type Operacion = 'suma' | 'resta' | 'multiplicacion' | 'division'

export interface CalculoRequest {
  a: number
  b: number
  operacion: Operacion
}

export interface CalculoResponse {
  resultado: number
  expresion: string
}

export interface OpcionCatalogo {
  clave: string
  texto: string
  mensaje: string
}

/** Formato estándar de error (RFC 7807) que devuelve ManejadorErroresGlobal o la validación de [ApiController]. */
export interface ProblemDetails {
  title?: string
  detail?: string
  status?: number
  errors?: Record<string, string[]>
}
