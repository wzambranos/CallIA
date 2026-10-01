# CustomerHub

SaaS B2B de contact center omnicanal: voz con IA, WhatsApp, SMS y email. El agente llama hasta tres veces; si falla, queda un único WhatsApp de fallback.

Este repositorio tiene el frontend y el esquema de PostgreSQL. Los backends se conectan después como APIs independientes.

## Requisitos

- Node.js 20+
- PostgreSQL 18 (base `CustomerHub` en `127.0.0.1:5432`)

## Arranque del frontend

```bash
cd web
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Sin URLs de API, el panel usa un adaptador local en el navegador.

Cuentas de demostración (solo local):

| Rol | Email | Contraseña |
| --- | --- | --- |
| Propietario | `demo@customerhub.local` | `central-demo` |
| Administrador | `admin@customerhub.local` | `central-demo` |
| Analista | `analista@customerhub.local` | `central-demo` |

## Base de datos

El esquema vive en `db/`. No guardes la clave de PostgreSQL en el repo.

```powershell
cd db
.\apply.ps1 -Password "TU_CLAVE"
```

O con variable de entorno:

```powershell
$env:PGPASSWORD = "TU_CLAVE"
.\apply.ps1
```

Cadena de ejemplo: ver `db/env.example`.

| Schema | Uso |
| --- | --- |
| `identity` | Organizaciones, usuarios, roles, sesiones |
| `profile` | Perfil de negocio |
| `billing` | Trial y planes |
| `crm` | Contactos, campañas, inscripciones |
| `ops` | Intentos de voz, WhatsApp, grabaciones, kill switches |
| `growth` | Leads del sitio público |

Regla de operación: máximo tres intentos de voz por inscripción; un solo mensaje de WhatsApp de fallback.

## Integrar un servicio

Publica la URL en el entorno del frontend y reinicia `npm run dev`. Si la variable está vacía, esa pantalla sigue con el adaptador local.

| Variable | Servicio |
| --- | --- |
| `NEXT_PUBLIC_IDENTITY_API_URL` | Registro, sesión, roles y contraseña |
| `NEXT_PUBLIC_PROFILE_API_URL` | Borrador y confirmación del perfil |
| `NEXT_PUBLIC_BILLING_API_URL` | Trial y suscripción |
| `NEXT_PUBLIC_CONTACTS_API_URL` | Ficha e importación CSV |
| `NEXT_PUBLIC_CAMPAIGNS_API_URL` | Campañas e intentos |
| `NEXT_PUBLIC_ANALYTICS_API_URL` | KPIs y grabaciones |
| `NEXT_PUBLIC_CONTROLS_API_URL` | Kill switches de voz y WhatsApp |
| `NEXT_PUBLIC_LEADS_API_URL` | Formulario de contacto |

Rutas: `web/src/lib/api/endpoints.ts`.  
Sesión: `Authorization: Bearer <token>`.  
Errores: `{ "message": "..." }`.

## Estructura

```
db/          Esquema y seed de PostgreSQL
web/         Next.js (App Router, TypeScript, Tailwind)
```
