// Configuración pública de la app (sin secretos).
// En el contenedor la entrega /config.js (window.__APP_CONFIG__), generado al arrancar;
// en desarrollo (pnpm dev) se usa la variable VITE_API_URL de .env.local.

function nonEmpty(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}

function readApiUrl(): string {
  const value = nonEmpty(window.__APP_CONFIG__?.apiUrl) ?? nonEmpty(import.meta.env.VITE_API_URL)
  if (value === undefined) {
    throw new Error('Falta la configuración apiUrl (config.js) o la variable VITE_API_URL (ver .env.example)')
  }
  return value.replace(/\/+$/, '')
}

export const config = {
  /** URL base de la API: siempre el API Gateway (ej. http://<minikube-ip>:30080/api). */
  apiUrl: readApiUrl(),
} as const
