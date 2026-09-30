# Central

Frontend del contact center. El backend no vive aquí: cada módulo es un servicio de API que se conecta después.

## Arranque

```bash
npm run dev
```

Abre http://localhost:3000.

Cuentas locales: `demo@central.local` y `analista@central.local`, contraseña `central-demo`.

## Integrar un servicio

Publica la URL en el entorno y reinicia `npm run dev`. Si la variable está vacía, esa pantalla sigue con el adaptador local.

| Variable | Servicio |
| --- | --- |
| `NEXT_PUBLIC_IDENTITY_API_URL` | Registro, sesión, roles y contraseña |
| `NEXT_PUBLIC_PROFILE_API_URL` | Borrador y confirmación del perfil |
| `NEXT_PUBLIC_BILLING_API_URL` | Trial y suscripción |
| `NEXT_PUBLIC_CONTACTS_API_URL` | Ficha e importación CSV |
| `NEXT_PUBLIC_CAMPAIGNS_API_URL` | Campañas e intentos |
| `NEXT_PUBLIC_ANALYTICS_API_URL` | KPIs y grabaciones |
| `NEXT_PUBLIC_CONTROLS_API_URL` | Kill switches |
| `NEXT_PUBLIC_LEADS_API_URL` | Formulario de contacto |

Las rutas que el front ya llama están en `src/lib/api/endpoints.ts`.
El header de sesión es `Authorization: Bearer <token>`.
Los errores se leen de `{ "message": "..." }`.
