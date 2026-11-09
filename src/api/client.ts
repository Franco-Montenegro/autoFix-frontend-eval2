import { config } from '../config'
import type { FieldError } from '../types/api'
import { ApiError } from './ApiError'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  query?: Record<string, string | number | undefined>
}

const NETWORK_MESSAGE = 'No se pudo conectar con el servidor. Intente nuevamente.'
const UNEXPECTED_MESSAGE = 'Ocurrió un error inesperado. Intente nuevamente.'

function buildUrl(path: string, query: RequestOptions['query']): string {
  const url = new URL(`${config.apiUrl}${path}`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseFieldErrors(value: unknown): FieldError[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.flatMap((item: unknown) =>
    isRecord(item) && typeof item.field === 'string' && typeof item.message === 'string'
      ? [{ field: item.field, message: item.message }]
      : [],
  )
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    // Respuesta sin cuerpo JSON: se usa el mensaje genérico.
  }
  if (isRecord(body) && typeof body.message === 'string') {
    return new ApiError(response.status, body.message, parseFieldErrors(body.errors))
  }
  return new ApiError(response.status, UNEXPECTED_MESSAGE)
}

/** Llama a la API (siempre a través del API Gateway) y devuelve el JSON de la respuesta. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError(0, NETWORK_MESSAGE)
  }

  if (!response.ok) {
    throw await toApiError(response)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}
