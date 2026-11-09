/** Error por campo del formato común de error de la API. */
export interface FieldError {
  field: string
  message: string
}

/** Cuerpo común de error de la API (docs/api.md, "Formato de error"). */
export interface ApiErrorBody {
  timestamp: string
  status: number
  message: string
  errors: FieldError[]
}
