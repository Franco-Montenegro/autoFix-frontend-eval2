// Configuración entregada por /config.js antes de cargar la app (ver public/config.js).

interface AppRuntimeConfig {
  apiUrl?: string
}

interface Window {
  __APP_CONFIG__?: AppRuntimeConfig
}
