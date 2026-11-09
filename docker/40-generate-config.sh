#!/bin/sh
# Genera /usr/share/nginx/html/config.js desde variables de entorno al arrancar el contenedor.
# Lo ejecuta /docker-entrypoint.sh de la imagen nginx antes de iniciar Nginx.
set -eu

CONFIG_FILE=/usr/share/nginx/html/config.js

if [ -z "${API_URL:-}" ]; then
  echo "ERROR: falta la variable de entorno obligatoria API_URL (URL del API Gateway, ej. http://<minikube-ip>:30080/api)." >&2
  exit 1
fi

# Escapa \ y " para que el valor quede como literal de cadena JavaScript válido.
js_string() {
  printf '"%s"' "$(printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')"
}

cat > "$CONFIG_FILE" <<EOF
window.__APP_CONFIG__ = {
  apiUrl: $(js_string "$API_URL"),
};
EOF

echo "config.js generado (API_URL=$API_URL)"
