import { Alert } from '@mui/material'
import { ApiError } from '../api/ApiError'

/** Muestra el `message` de un error de la API (o uno genérico) en una alerta. */
export function ErrorAlert({ error }: { error: unknown }) {
  const message =
    error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Intente nuevamente.'
  return <Alert severity="error">{message}</Alert>
}
