import type { FieldError } from '../types/api'

/** Error de una llamada a la API, con el mensaje general y los errores por campo. */
export class ApiError extends Error {
  readonly status: number
  readonly errors: FieldError[]

  constructor(status: number, message: string, errors: FieldError[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  /** Mensaje del error para un campo del formulario, si la API lo informó. */
  fieldError(field: string): string | undefined {
    return this.errors.find((error) => error.field === field)?.message
  }
}
