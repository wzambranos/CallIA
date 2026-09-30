/**
 * Cada capacidad del backend es un servicio aparte.
 * Si la variable está vacía, el frontend usa el adaptador local.
 * Cuando se integre el back, basta con publicar la URL: el front ya llama estas rutas.
 *
 * Identidad   NEXT_PUBLIC_IDENTITY_API_URL
 *   POST /v1/register   { name, email, password, companyName } -> Session
 *   POST /v1/login      { email, password } -> Session
 *   POST /v1/password   { current, next }
 *   GET  /v1/members
 *   POST /v1/members    { name, email, role }
 *   PATCH /v1/members/:id  { role }
 *
 * Perfilado   NEXT_PUBLIC_PROFILE_API_URL
 *   GET  /v1/profile
 *   POST /v1/profile/draft  { url } -> ProfileInput
 *   PUT  /v1/profile        ProfileInput
 *
 * Facturación NEXT_PUBLIC_BILLING_API_URL
 *   GET  /v1/subscription
 *   POST /v1/checkout  { planId: "trial" } -> { trialEndsAt, checkoutUrl? }
 *
 * Contactos   NEXT_PUBLIC_CONTACTS_API_URL
 *   GET  /v1/contacts
 *   POST /v1/contacts
 *   POST /v1/contacts/imports   multipart field "file"
 *
 * Campañas    NEXT_PUBLIC_CAMPAIGNS_API_URL
 *   GET /v1/campaigns
 *
 * Analítica   NEXT_PUBLIC_ANALYTICS_API_URL
 *   GET /v1/analytics?negocio&cliente&cedula&ciudad&campana
 *   GET /v1/recordings?negocio&cliente&cedula&ciudad&campana
 *
 * Controles   NEXT_PUBLIC_CONTROLS_API_URL
 *   GET /v1/controls
 *   PUT /v1/controls/:channel   { enabled }   channel = voice | whatsapp
 *
 * Leads       NEXT_PUBLIC_LEADS_API_URL
 *   POST /v1/leads
 *
 * Las respuestas de error usan { message: string }.
 * Authorization: Bearer <session.token>
 */

export const serviceUrls = {
  identity: trim(process.env.NEXT_PUBLIC_IDENTITY_API_URL),
  profile: trim(process.env.NEXT_PUBLIC_PROFILE_API_URL),
  billing: trim(process.env.NEXT_PUBLIC_BILLING_API_URL),
  contacts: trim(process.env.NEXT_PUBLIC_CONTACTS_API_URL),
  campaigns: trim(process.env.NEXT_PUBLIC_CAMPAIGNS_API_URL),
  analytics: trim(process.env.NEXT_PUBLIC_ANALYTICS_API_URL),
  controls: trim(process.env.NEXT_PUBLIC_CONTROLS_API_URL),
  leads: trim(process.env.NEXT_PUBLIC_LEADS_API_URL),
} as const;

export type ServiceName = keyof typeof serviceUrls;

export const serviceLabels: Record<ServiceName, string> = {
  identity: "Identidad",
  profile: "Perfilado",
  billing: "Facturación",
  contacts: "Contactos",
  campaigns: "Campañas",
  analytics: "Analítica",
  controls: "Controles",
  leads: "Contacto comercial",
};

export function serviceBase(name: ServiceName): string | null {
  return serviceUrls[name] || null;
}

export function adapterReport(): { name: string; label: string; remote: boolean }[] {
  return (Object.keys(serviceUrls) as ServiceName[]).map((name) => ({
    name,
    label: serviceLabels[name],
    remote: Boolean(serviceUrls[name]),
  }));
}

function trim(value: string | undefined): string {
  return value?.replace(/\/$/, "") ?? "";
}
