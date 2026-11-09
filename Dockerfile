# Etapa 1: build de la app con pnpm (versión exacta del campo packageManager)
FROM node:24-alpine AS build
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && corepack install && pnpm install --frozen-lockfile

COPY . .
# Sin variables VITE_*: las URLs se entregan al arrancar mediante /config.js
RUN pnpm build

# Etapa 2: Nginx sirve los archivos estáticos
FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 docker/40-generate-config.sh /docker-entrypoint.d/40-generate-config.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
