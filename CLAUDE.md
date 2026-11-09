# autoFix-frontend-eval2

Frontend web del proyecto autoFix para la Evaluación 2. Este repo es solo el frontend; la API la exponen los microservicios M1–M4 (`../autoFix-ms-*`) **a través del API Gateway** (`../autoFix-gateway`). El plan está en `../docs-evaluacion-2/plan.md` (Fase 6). No hay autenticación: Keycloak se eliminó.

## Stack
- React + TypeScript (modo `strict`) con Vite (plantilla `react-ts`)
- pnpm 11 como gestor de paquetes (nunca npm ni yarn)
- MUI (Material UI) + `@mui/icons-material`
- React Router
- TanStack Query para el estado del servidor
- `fetch` nativo con un wrapper propio (sin axios)

## Documentación
- Contrato de cada microservicio: el README de `../autoFix-ms-*` (rutas, bodies y errores). Tipa las respuestas según lo que dicen.
- `../docs-evaluacion-2/plan.md` y `enunciado-evaluacion2.md`: plan y reglas de negocio.

No leas estos documentos completos en cada tarea: lee solo la sección relevante.
Si el frontend necesita algo que la API no ofrece, no lo resuelvas con lógica duplicada en el cliente: avísame para cambiar primero el backend.

## Arquitectura (`src/`)
- `api/`: `client.ts` (URL base del Gateway, JSON, `ApiError`) y un módulo por recurso. Los componentes nunca llaman a `fetch` directamente.
- `types/`: tipos que reflejan las respuestas de la API.
- `components/`: componentes reutilizables (layout, alertas, diálogos, selector de mes y año de los reportes).
- `pages/`: una carpeta por módulo (`vehicles`, `repair-orders`, `bonuses`, `reports`).
- `utils/`: formato de montos (CLP), fechas y horas (`es-CL`) y etiquetas en español de los enums.

## Convenciones de código
- Componentes funcionales y hooks; nada de componentes de clase.
- Sin `any`; si un tipo no se conoce, usa `unknown` y estréchalo.
- Nombres en inglés para archivos, componentes, funciones y variables; **todos los textos visibles en español**.
- Los enums de la API se muestran traducidos (ej. `VAN` → "Furgoneta", `IN_REPAIR` → "En reparación").
- Montos siempre formateados como pesos chilenos; `null` se muestra como "—".
- Validación en el navegador solo básica (obligatorios, formato de patente); la que vale es la del backend. Muestra `errors[]` de la API en el campo correspondiente y `message` en una alerta.
- Cambios pequeños y enfocados: una funcionalidad por vez.

## Seguridad
- Dependencias: versiones exactas (sin `^`/`~`), `pnpm-lock.yaml` versionado, scripts de instalación bloqueados salvo autorización explícita y antigüedad mínima de versiones configurada en pnpm.
- Parches de dependencias transitivas en `overrides` de `pnpm-workspace.yaml`. Al cambiarlos, pnpm puede saltarse la instalación: borra `node_modules` y vuelve a ejecutar `pnpm install`.
- Antes de agregar una dependencia nueva, propónla y justifícala; espera mi aprobación.
- Las variables `VITE_*` son públicas (quedan en el bundle): nunca pongas secretos en ellas.
- Nunca escribas credenciales en código, en archivos versionados ni en el chat.

## Configuración
- Variable: `VITE_API_URL` (URL del API Gateway, ej. `http://localhost:8080/api`). En el contenedor: `API_URL`.
- Se versiona `.env.example`; los valores locales van en `.env.local` (ignorado por git).
- Dev server en el puerto **5173** fijo (`strictPort`): es el origen permitido por el CORS del Gateway.

## Entorno local para probar
- Gateway: `http://localhost:8080`, con Config Server (8888), Eureka (8761) y M1–M4 corriendo.

## Cómo trabajar conmigo
- Para tareas grandes, propón primero un plan y espera mi aprobación antes de escribir código.
- Trabaja solo la subfase que te pida; no avances a la siguiente por tu cuenta.
- Al terminar cada subfase: `pnpm build` y `pnpm lint` sin errores, y `pnpm audit` revisado.
- Al terminar, indícame cómo probar lo que hiciste (pasos en el navegador y resultado esperado).
- Puedes hacer commit y push cuando termines una fase. El único autor y colaborador es Franco: los commits van **sin** la línea `Co-Authored-By` ni ninguna otra mención a Claude.
