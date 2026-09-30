export type Role = "owner" | "admin" | "analista";

export type OnboardingStep = "perfil" | "pago" | "listo";

export type Session = {
  token: string;
  memberId: string;
  name: string;
  email: string;
  role: Role;
  companyName: string;
  onboardingStep: OnboardingStep;
};

export type BusinessProfile = {
  url: string;
  tradeName: string;
  industry: string;
  offer: string;
  products: string;
  tone: string;
  confirmed: boolean;
};

export type Subscription = {
  status: "trial" | "activo" | "impago" | "cancelado";
  planId: "trial" | "inicial" | "crecimiento";
  trialEndsAt: string;
};

export type Contact = {
  id: string;
  nombre: string;
  cedula: string;
  edad: number | null;
  genero: string;
  metodoPago: string;
  ciudad: string;
  telefono: string;
  email: string;
  negocio: string;
};

export type Campaign = {
  id: string;
  nombre: string;
  negocio: string;
  objetivo: string;
};

export type Disposition =
  | "contestada"
  | "no_contestada"
  | "ocupado"
  | "fallo"
  | "buzon";

export type Attempt = {
  id: string;
  contactId: string;
  campaignId: string;
  number: number;
  disposition: Disposition;
  at: string;
};

export type EnrollmentStatus =
  | "en_voz"
  | "contestada"
  | "fallback_whatsapp"
  | "cerrada";

export type Enrollment = {
  id: string;
  contactId: string;
  campaignId: string;
  status: EnrollmentStatus;
  converted: boolean;
  productsSold: number;
};

export type Recording = {
  id: string;
  attemptId: string;
  contactId: string;
  campaignId: string;
  durationSec: number;
  at: string;
};

export type ChannelControl = {
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
};

export type Controls = {
  voice: ChannelControl;
  whatsapp: ChannelControl;
};

export type AnalyticsFilters = {
  negocio: string;
  cliente: string;
  cedula: string;
  ciudad: string;
  campana: string;
};

export type Kpis = {
  clientesLlamados: number;
  conversiones: number;
  productosVendidos: number;
};

export type AnalyticsRow = {
  id: string;
  cliente: string;
  cedula: string;
  ciudad: string;
  negocio: string;
  campana: string;
  intento: number;
  disposicion: string;
  resultado: string;
};

export type Facets = {
  negocios: string[];
  ciudades: string[];
  campanas: { id: string; nombre: string }[];
};

export type AnalyticsReport = {
  kpis: Kpis;
  rows: AnalyticsRow[];
  facets: Facets;
  personalDataVisible: boolean;
};

export type ContactList = {
  contacts: Contact[];
  personalDataVisible: boolean;
};

export type ImportResult = {
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
};

export type CampaignRow = {
  contactId: string;
  cliente: string;
  cedula: string;
  statusLabel: string;
  fallback: boolean;
  attempts: { number: number; disposition: string; at: string }[];
};

export type CampaignBoardItem = {
  id: string;
  nombre: string;
  negocio: string;
  objetivo: string;
  rows: CampaignRow[];
};

export type RecordingItem = {
  id: string;
  cliente: string;
  cedula: string;
  campana: string;
  disposition: string;
  durationSec: number;
  at: string;
  playbackUrl: string | null;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "activo" | "invitado";
};

export type LeadInput = {
  nombre: string;
  email: string;
  empresa: string;
  mensaje: string;
};

export type ProfileInput = {
  url: string;
  tradeName: string;
  industry: string;
  offer: string;
  products: string;
  tone: string;
};

export type CheckoutResult = {
  trialEndsAt: string;
  checkoutUrl?: string;
};

export type Workspace = {
  session: Session;
  profile: BusinessProfile | null;
  subscription: Subscription | null;
};

export type ContactInput = {
  nombre: string;
  cedula: string;
  edad: string;
  genero: string;
  metodoPago: string;
  ciudad: string;
  telefono: string;
  email: string;
  negocio: string;
};
