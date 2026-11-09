# autoFix-frontend-eval2

Frontend web de AutoFix para la Evaluación 2 (React + TypeScript + Vite + MUI). Consume la API **solo a través del API Gateway** (`autoFix-gateway`), que enruta a los microservicios M1–M4. No tiene login.

## Pantallas

| Menú | Historia | Microservicio |
|---|---|---|
| Vehículos | HU1: registro y consulta | M1 |
| Catálogo de reparaciones | HU2: agregar y modificar reparaciones y precios | M2 |
| Nuevo ingreso / detalle | HU3: ingreso con fecha y hora por reparación, salida, retiro, bono y costo | M3 |
| Bonos | Cupos mensuales por marca | M3 |
| Historial de reparaciones | HU4: todos los vehículos con todos los campos del historial | M3 |
| Reporte 1 | HU5: reparaciones por tipo de vehículo de un mes | M4 |
| Reporte 2 | HU6: comparativo del mes con los dos anteriores | M4 |

## Requisitos

- Node.js 24 y pnpm 11 (versión fijada en `packageManager`).
- Backend levantado: Config Server, Eureka, Gateway (`http://localhost:8080`) y M1–M4.

## Puesta en marcha

```sh
pnpm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:8080/api
pnpm dev                     # http://localhost:5173 (puerto fijo, origen permitido por el CORS del Gateway)
```

En el contenedor, la URL del Gateway se entrega al arrancar con la variable `API_URL` (ver `docker/40-generate-config.sh`), por ejemplo `http://<minikube-ip>:30080/api`.

## Scripts

| Script | Uso |
|---|---|
| `pnpm dev` | Servidor de desarrollo en el puerto 5173 |
| `pnpm build` | Chequeo de tipos y build de producción |
| `pnpm lint` | ESLint |
| `pnpm audit` | Revisión de vulnerabilidades de dependencias |

## Seguridad de dependencias

Configurada en `pnpm-workspace.yaml`: versiones exactas, antigüedad mínima de 7 días y scripts de instalación bloqueados (se autorizan por nombre en `allowBuilds`).
