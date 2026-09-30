import type {
  Attempt,
  BusinessProfile,
  Campaign,
  Contact,
  Controls,
  Enrollment,
  Member,
  OnboardingStep,
  ProfileInput,
  Recording,
  Role,
  Subscription,
} from "./types";

const KEY = "central.demo.v1";

export type MemberRecord = Member & { secret: string; onboardingStep: OnboardingStep };

export type LeadRecord = {
  id: string;
  nombre: string;
  email: string;
  empresa: string;
  mensaje: string;
  at: string;
};

export type Db = {
  companyName: string;
  members: MemberRecord[];
  profile: BusinessProfile | null;
  draft: ProfileInput | null;
  subscription: Subscription | null;
  contacts: Contact[];
  campaigns: Campaign[];
  attempts: Attempt[];
  enrollments: Enrollment[];
  recordings: Recording[];
  controls: Controls;
  leads: LeadRecord[];
};

let memory: Db | null = null;

export function readDb(): Db {
  if (typeof window === "undefined") {
    throw new Error("El adaptador local solo corre en el navegador");
  }
  if (memory) return memory;
  const raw = localStorage.getItem(KEY);
  if (raw) {
    memory = JSON.parse(raw) as Db;
    return memory;
  }
  memory = createSeed();
  localStorage.setItem(KEY, JSON.stringify(memory));
  return memory;
}

export function writeDb(db: Db) {
  memory = db;
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function updateDb(mutate: (db: Db) => void) {
  const db = readDb();
  mutate(db);
  writeDb(db);
  return db;
}

export function clearDb() {
  memory = null;
  localStorage.removeItem(KEY);
}

function createSeed(): Db {
  const contacts: Contact[] = [
    contact("c1", "Ana Gómez", "1000000001", 41, "femenino", "tarjeta", "Bogotá", "3000000001", "ana@ejemplo.com", "Andes Hogar"),
    contact("c2", "Luis Pérez", "1000000002", 36, "masculino", "efectivo", "Medellín", "3000000002", "luis@ejemplo.com", "Andes Hogar"),
    contact("c3", "Marta Ruiz", "1000000003", 29, "femenino", "transferencia", "Cali", "3000000003", "marta@ejemplo.com", "Andes Hogar"),
    contact("c4", "Jorge Díaz", "1000000004", 52, "masculino", "tarjeta", "Bogotá", "3000000004", "jorge@ejemplo.com", "Andes Hogar"),
    contact("c5", "Elena Vargas", "1000000005", 33, "femenino", "efectivo", "Barranquilla", "3000000005", "elena@ejemplo.com", "Taller Norte"),
    contact("c6", "Camilo Ortiz", "1000000006", 44, "masculino", "transferencia", "Bogotá", "3000000006", "camilo@ejemplo.com", "Taller Norte"),
    contact("c7", "Sofía Herrera", "1000000007", 27, "femenino", "tarjeta", "Medellín", "3000000007", "sofia@ejemplo.com", "Taller Norte"),
    contact("c8", "Pedro Ramos", "1000000008", 38, "masculino", "efectivo", "Cali", "3000000008", "pedro@ejemplo.com", "Taller Norte"),
  ];

  const campaigns: Campaign[] = [
    { id: "k1", nombre: "Cobranza marzo", negocio: "Andes Hogar", objetivo: "Acordar pago de cartera vencida" },
    { id: "k2", nombre: "Bienvenida", negocio: "Taller Norte", objetivo: "Presentar el servicio y ofrecer el primer producto" },
  ];

  const attempts: Attempt[] = [
    attempt("a1", "c1", "k1", 1, "contestada", "2026-09-22T14:10:00.000Z"),
    attempt("a2", "c2", "k1", 1, "no_contestada", "2026-09-22T15:00:00.000Z"),
    attempt("a3", "c2", "k1", 2, "ocupado", "2026-09-22T19:30:00.000Z"),
    attempt("a4", "c2", "k1", 3, "fallo", "2026-09-23T14:05:00.000Z"),
    attempt("a5", "c3", "k1", 1, "no_contestada", "2026-09-23T16:20:00.000Z"),
    attempt("a6", "c4", "k1", 1, "contestada", "2026-09-24T13:40:00.000Z"),
    attempt("a7", "c5", "k2", 1, "ocupado", "2026-09-24T18:00:00.000Z"),
    attempt("a8", "c6", "k2", 1, "contestada", "2026-09-25T15:15:00.000Z"),
    attempt("a9", "c7", "k2", 1, "buzon", "2026-09-25T17:45:00.000Z"),
  ];

  const enrollments: Enrollment[] = [
    { id: "e1", contactId: "c1", campaignId: "k1", status: "contestada", converted: true, productsSold: 1 },
    { id: "e2", contactId: "c2", campaignId: "k1", status: "fallback_whatsapp", converted: false, productsSold: 0 },
    { id: "e3", contactId: "c3", campaignId: "k1", status: "en_voz", converted: false, productsSold: 0 },
    { id: "e4", contactId: "c4", campaignId: "k1", status: "contestada", converted: false, productsSold: 0 },
    { id: "e5", contactId: "c5", campaignId: "k2", status: "en_voz", converted: false, productsSold: 0 },
    { id: "e6", contactId: "c6", campaignId: "k2", status: "contestada", converted: true, productsSold: 2 },
    { id: "e7", contactId: "c7", campaignId: "k2", status: "en_voz", converted: false, productsSold: 0 },
    { id: "e8", contactId: "c8", campaignId: "k2", status: "en_voz", converted: false, productsSold: 0 },
  ];

  const recordings: Recording[] = [
    { id: "r1", attemptId: "a1", contactId: "c1", campaignId: "k1", durationSec: 186, at: "2026-09-22T14:10:00.000Z" },
    { id: "r2", attemptId: "a6", contactId: "c4", campaignId: "k1", durationSec: 94, at: "2026-09-24T13:40:00.000Z" },
    { id: "r3", attemptId: "a8", contactId: "c6", campaignId: "k2", durationSec: 210, at: "2026-09-25T15:15:00.000Z" },
  ];

  return {
    companyName: "Andes Hogar",
    members: [
      member("m-owner", "Marina López", "demo@central.local", "owner", "central-demo", "activo", "listo"),
      member("m-admin", "Julián Mora", "admin@central.local", "admin", "central-demo", "activo", "listo"),
      member("m-analyst", "Paula Nieto", "analista@central.local", "analista", "central-demo", "activo", "listo"),
    ],
    profile: {
      url: "https://andeshogar.example",
      tradeName: "Andes Hogar",
      industry: "Retail de hogar",
      offer: "Muebles y electrodomésticos con pago en cuotas.",
      products: "Sofás, neveras, lavadoras",
      tone: "Cercano y directo",
      confirmed: true,
    },
    draft: null,
    subscription: {
      status: "trial",
      planId: "trial",
      trialEndsAt: "2026-10-06T00:00:00.000Z",
    },
    contacts,
    campaigns,
    attempts,
    enrollments,
    recordings,
    controls: {
      voice: { enabled: true, updatedAt: "2026-09-22T12:00:00.000Z", updatedBy: "Marina López" },
      whatsapp: { enabled: true, updatedAt: "2026-09-22T12:00:00.000Z", updatedBy: "Marina López" },
    },
    leads: [],
  };
}

function contact(
  id: string,
  nombre: string,
  cedula: string,
  edad: number,
  genero: string,
  metodoPago: string,
  ciudad: string,
  telefono: string,
  email: string,
  negocio: string,
): Contact {
  return { id, nombre, cedula, edad, genero, metodoPago, ciudad, telefono, email, negocio };
}

function attempt(
  id: string,
  contactId: string,
  campaignId: string,
  number: number,
  disposition: Attempt["disposition"],
  at: string,
): Attempt {
  return { id, contactId, campaignId, number, disposition, at };
}

function member(
  id: string,
  name: string,
  email: string,
  role: Role,
  secret: string,
  status: Member["status"],
  onboardingStep: OnboardingStep,
): MemberRecord {
  return { id, name, email, role, status, secret, onboardingStep };
}
