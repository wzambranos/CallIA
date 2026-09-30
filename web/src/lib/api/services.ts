"use client";

import { parseCsv, pick } from "../csv";
import { dispositionLabel, enrollmentLabel, maskCedula } from "../format";
import { serviceBase, type ServiceName } from "./endpoints";
import { ApiError, requestJson } from "./http";
import { clearDb, readDb, updateDb } from "./mock-db";
import { clearSession, readSession, writeSession } from "./session";
import type {
  AnalyticsFilters,
  AnalyticsReport,
  BusinessProfile,
  CampaignBoardItem,
  CheckoutResult,
  Contact,
  ContactInput,
  ContactList,
  Controls,
  ImportResult,
  LeadInput,
  Member,
  ProfileInput,
  RecordingItem,
  Role,
  Session,
  Subscription,
  Workspace,
} from "./types";

const emptyFilters: AnalyticsFilters = {
  negocio: "",
  cliente: "",
  cedula: "",
  ciudad: "",
  campana: "",
};

export async function register(input: {
  name: string;
  email: string;
  password: string;
  companyName: string;
}): Promise<Session> {
  return adapt("identity", async (base) => {
    const session = await requestJson<Session>(base, "/v1/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    writeSession(session);
    return session;
  }, async () => {
    const email = input.email.trim().toLowerCase();
    const db = readDb();
    if (db.members.some((item) => item.email === email)) {
      throw new ApiError("Ese correo ya está en el equipo");
    }
    const memberId = crypto.randomUUID();
    updateDb((draft) => {
      draft.draft = null;
      draft.members.push({
        id: memberId,
        name: input.name.trim(),
        email,
        role: "owner",
        status: "activo",
        onboardingStep: "perfil",
        secret: input.password,
      });
    });
    const session: Session = {
      token: crypto.randomUUID(),
      memberId,
      name: input.name.trim(),
      email,
      role: "owner",
      companyName: input.companyName.trim(),
      onboardingStep: "perfil",
    };
    writeSession(session);
    return session;
  });
}

export async function login(input: { email: string; password: string }): Promise<Session> {
  return adapt("identity", async (base) => {
    const session = await requestJson<Session>(base, "/v1/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    writeSession(session);
    return session;
  }, async () => {
    const email = input.email.trim().toLowerCase();
    const db = readDb();
    const member = db.members.find((item) => item.email === email);
    if (!member || member.status !== "activo" || member.secret !== input.password) {
      throw new ApiError("Correo o contraseña incorrectos");
    }
    const session: Session = {
      token: crypto.randomUUID(),
      memberId: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      companyName: db.companyName,
      onboardingStep: member.onboardingStep,
    };
    writeSession(session);
    return session;
  });
}

export async function logout() {
  clearSession();
}

export async function changePassword(current: string, next: string) {
  const session = requireSession();
  await adapt("identity", async (base) => {
    await requestJson(base, "/v1/password", {
      method: "POST",
      body: JSON.stringify({ current, next }),
    });
  }, async () => {
    const db = readDb();
    const member = db.members.find((item) => item.id === session.memberId);
    if (!member || member.secret !== current) {
      throw new ApiError("La contraseña actual no coincide");
    }
    updateDb((draft) => {
      const target = draft.members.find((item) => item.id === session.memberId);
      if (target) target.secret = next;
    });
  });
}

export async function listMembers(): Promise<Member[]> {
  return adapt("identity", (base) => requestJson<Member[]>(base, "/v1/members"), async () => {
    return readDb().members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      status: member.status,
    }));
  });
}

export async function inviteMember(input: { name: string; email: string; role: Role }) {
  const session = requireSession();
  if (session.role !== "owner") throw new ApiError("Solo el owner invita usuarios");
  await adapt("identity", (base) => requestJson(base, "/v1/members", {
    method: "POST",
    body: JSON.stringify(input),
  }), async () => {
    const email = input.email.trim().toLowerCase();
    if (readDb().members.some((item) => item.email === email)) {
      throw new ApiError("Ese correo ya está en el equipo");
    }
    updateDb((draft) => {
      draft.members.push({
        id: crypto.randomUUID(),
        name: input.name.trim(),
        email,
        role: input.role,
        status: "invitado",
        onboardingStep: "listo",
        secret: "",
      });
    });
  });
}

export async function updateMemberRole(memberId: string, role: Role) {
  const session = requireSession();
  if (session.role !== "owner") throw new ApiError("Solo el owner cambia roles");
  if (memberId === session.memberId) throw new ApiError("Tu propio rol lo cambia otro owner");
  await adapt("identity", (base) => requestJson(base, `/v1/members/${memberId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  }), async () => {
    const db = readDb();
    const owners = db.members.filter((item) => item.role === "owner");
    const target = db.members.find((item) => item.id === memberId);
    if (!target) throw new ApiError("Usuario no encontrado");
    if (target.role === "owner" && role !== "owner" && owners.length < 2) {
      throw new ApiError("Tiene que quedar al menos un owner");
    }
    updateDb((draft) => {
      const item = draft.members.find((member) => member.id === memberId);
      if (item) item.role = role;
    });
  });
}

export async function getOnboardingDraft(): Promise<ProfileInput | null> {
  return adapt("profile", async (base) => {
    const profile = await requestJson<BusinessProfile | null>(base, "/v1/profile");
    if (!profile || profile.confirmed) return null;
    return profile;
  }, async () => readDb().draft);
}
export async function getProfile(): Promise<BusinessProfile | null> {
  return adapt("profile", (base) => requestJson<BusinessProfile | null>(base, "/v1/profile"), async () => {
    return readDb().profile;
  });
}

export async function draftProfile(url: string): Promise<ProfileInput> {
  const session = requireSession();
  return adapt("profile", (base) => requestJson<ProfileInput>(base, "/v1/profile/draft", {
    method: "POST",
    body: JSON.stringify({ url }),
  }), async () => {
    const parsed = parsePublicUrl(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const next: ProfileInput = {
      url: parsed.toString(),
      tradeName: session.companyName,
      industry: "",
      offer: `Atención comercial de ${session.companyName}, a partir del sitio ${host}.`,
      products: "",
      tone: "Cercano y directo",
    };
    updateDb((draft) => {
      draft.draft = next;
    });
    return next;
  });
}

export async function confirmProfile(input: ProfileInput): Promise<void> {
  const session = requireSession();
  await adapt("profile", (base) => requestJson(base, "/v1/profile", {
    method: "PUT",
    body: JSON.stringify(input),
  }), async () => {
    updateDb((draft) => {
      draft.profile = { ...input, confirmed: true };
      draft.companyName = input.tradeName.trim() || draft.companyName;
      draft.draft = null;
      const member = draft.members.find((item) => item.id === session.memberId);
      if (member) member.onboardingStep = "pago";
    });
  });
  writeSession({ ...session, onboardingStep: "pago", companyName: input.tradeName.trim() || session.companyName });
}

export async function getSubscription(): Promise<Subscription | null> {
  return adapt("billing", (base) => requestJson<Subscription | null>(base, "/v1/subscription"), async () => {
    return readDb().subscription;
  });
}

export async function startTrial(): Promise<CheckoutResult> {
  const session = requireSession();
  const remote = serviceBase("billing");
  if (remote) {
    const result = await requestJson<CheckoutResult>(remote, "/v1/checkout", {
      method: "POST",
      body: JSON.stringify({ planId: "trial" }),
    });
    if (!result.checkoutUrl) {
      writeSession({ ...session, onboardingStep: "listo" });
    }
    return result;
  }
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  updateDb((draft) => {
    draft.subscription = { status: "trial", planId: "trial", trialEndsAt };
    const member = draft.members.find((item) => item.id === session.memberId);
    if (member) member.onboardingStep = "listo";
  });
  writeSession({ ...session, onboardingStep: "listo" });
  return { trialEndsAt };
}

export async function listContacts(): Promise<ContactList> {
  const session = requireSession();
  return adapt("contacts", (base) => requestJson<ContactList>(base, "/v1/contacts"), async () => {
    const visible = session.role !== "analista";
    return {
      personalDataVisible: visible,
      contacts: readDb().contacts.map((item) => presentContact(item, visible)),
    };
  });
}

export async function createContact(input: ContactInput): Promise<void> {
  requireSession();
  await adapt("contacts", (base) => requestJson(base, "/v1/contacts", {
    method: "POST",
    body: JSON.stringify(input),
  }), async () => {
    const contact = contactFromInput(input);
    updateDb((draft) => {
      const index = draft.contacts.findIndex((item) => item.cedula === contact.cedula);
      if (index >= 0) draft.contacts[index] = { ...draft.contacts[index], ...contact, id: draft.contacts[index].id };
      else draft.contacts.unshift(contact);
    });
  });
}

export async function importContacts(file: File): Promise<ImportResult> {
  requireSession();
  return adapt("contacts", async (base) => {
    const body = new FormData();
    body.append("file", file);
    return requestJson<ImportResult>(base, "/v1/contacts/imports", { method: "POST", body });
  }, async () => {
    const parsed = parseCsv(await file.text());
    const result: ImportResult = { created: 0, updated: 0, errors: [] };
    if (parsed.rows.length === 0) {
      throw new ApiError("El archivo no tiene filas de datos");
    }
    updateDb((draft) => {
      parsed.rows.forEach((row, index) => {
        const rowNumber = index + 2;
        const nombre = pick(row, "nombre");
        const cedula = pick(row, "cedula");
        const telefono = pick(row, "telefono");
        if (!nombre || !cedula || !telefono) {
          result.errors.push({ row: rowNumber, message: "Faltan nombre, cédula o teléfono" });
          return;
        }
        const edadRaw = pick(row, "edad");
        const edad = edadRaw ? Number(edadRaw) : null;
        if (edadRaw && Number.isNaN(edad)) {
          result.errors.push({ row: rowNumber, message: "La edad no es un número" });
          return;
        }
        const next: Contact = {
          id: crypto.randomUUID(),
          nombre,
          cedula,
          edad,
          genero: pick(row, "genero") || "no_informa",
          metodoPago: pick(row, "metodo_pago") || "otro",
          ciudad: pick(row, "ciudad"),
          telefono,
          email: pick(row, "email"),
          negocio: pick(row, "negocio") || readDb().companyName,
        };
        const existing = draft.contacts.findIndex((item) => item.cedula === cedula);
        if (existing >= 0) {
          draft.contacts[existing] = { ...next, id: draft.contacts[existing].id };
          result.updated += 1;
        } else {
          draft.contacts.unshift(next);
          result.created += 1;
        }
      });
    });
    return result;
  });
}

export async function getCampaignBoard(): Promise<CampaignBoardItem[]> {
  const session = requireSession();
  return adapt("campaigns", (base) => requestJson<CampaignBoardItem[]>(base, "/v1/campaigns"), async () => {
    const db = readDb();
    const visible = session.role !== "analista";
    return db.campaigns.map((campaign) => ({
      id: campaign.id,
      nombre: campaign.nombre,
      negocio: campaign.negocio,
      objetivo: campaign.objetivo,
      rows: db.enrollments
        .filter((item) => item.campaignId === campaign.id)
        .map((enrollment) => {
          const contact = db.contacts.find((item) => item.id === enrollment.contactId);
          const attempts = db.attempts
            .filter((item) => item.contactId === enrollment.contactId && item.campaignId === campaign.id)
            .sort((a, b) => a.number - b.number);
          return {
            contactId: enrollment.contactId,
            cliente: contact?.nombre ?? "Contacto",
            cedula: visible ? contact?.cedula ?? "" : maskCedula(contact?.cedula ?? ""),
            statusLabel: enrollmentLabel[enrollment.status],
            fallback: enrollment.status === "fallback_whatsapp",
            attempts: attempts.map((item) => ({
              number: item.number,
              disposition: dispositionLabel[item.disposition],
              at: item.at,
            })),
          };
        }),
    }));
  });
}

export async function getAnalytics(filters: AnalyticsFilters): Promise<AnalyticsReport> {
  const session = requireSession();
  return adapt("analytics", (base) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    const query = params.toString();
    return requestJson<AnalyticsReport>(base, `/v1/analytics${query ? `?${query}` : ""}`);
  }, async () => localAnalytics(filters, session.role !== "analista"));
}

export async function listRecordings(filters: AnalyticsFilters): Promise<RecordingItem[]> {
  const session = requireSession();
  if (session.role === "analista") return [];
  return adapt("analytics", (base) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    const query = params.toString();
    return requestJson<RecordingItem[]>(base, `/v1/recordings${query ? `?${query}` : ""}`);
  }, async () => {
    const db = readDb();
    return db.recordings
      .map((recording) => {
        const contact = db.contacts.find((item) => item.id === recording.contactId);
        const campaign = db.campaigns.find((item) => item.id === recording.campaignId);
        const attempt = db.attempts.find((item) => item.id === recording.attemptId);
        return {
          recording,
          contact,
          campaign,
          attempt,
        };
      })
      .filter(({ contact, campaign }) => {
        if (!contact || !campaign) return false;
        if (filters.negocio && contact.negocio !== filters.negocio) return false;
        if (filters.ciudad && contact.ciudad !== filters.ciudad) return false;
        if (filters.campana && campaign.id !== filters.campana) return false;
        if (filters.cliente && !contact.nombre.toLowerCase().includes(filters.cliente.toLowerCase())) return false;
        if (filters.cedula && !contact.cedula.includes(filters.cedula)) return false;
        return true;
      })
      .map(({ recording, contact, campaign, attempt }) => ({
        id: recording.id,
        cliente: contact?.nombre ?? "",
        cedula: contact?.cedula ?? "",
        campana: campaign?.nombre ?? "",
        disposition: attempt ? dispositionLabel[attempt.disposition] : "",
        durationSec: recording.durationSec,
        at: recording.at,
        playbackUrl: null,
      }));
  });
}

export async function getControls(): Promise<Controls> {
  requireSession();
  return adapt("controls", (base) => requestJson<Controls>(base, "/v1/controls"), async () => readDb().controls);
}

export async function setControl(channel: "voice" | "whatsapp", enabled: boolean): Promise<Controls> {
  const session = requireSession();
  if (session.role === "analista") throw new ApiError("El analista no cambia los controles");
  return adapt("controls", (base) => requestJson<Controls>(base, `/v1/controls/${channel}`, {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  }), async () => {
    updateDb((draft) => {
      draft.controls[channel] = {
        enabled,
        updatedAt: new Date().toISOString(),
        updatedBy: session.name,
      };
    });
    return readDb().controls;
  });
}

export async function submitLead(input: LeadInput) {
  await adapt("leads", (base) => requestJson(base, "/v1/leads", {
    method: "POST",
    body: JSON.stringify(input),
  }), async () => {
    updateDb((draft) => {
      draft.leads.push({ id: crypto.randomUUID(), ...input, at: new Date().toISOString() });
    });
  });
}

export async function getWorkspace(): Promise<Workspace> {
  const session = requireSession();
  const [profile, subscription] = await Promise.all([getProfile(), getSubscription()]);
  return { session, profile, subscription };
}

export function resetLocalDemo() {
  clearDb();
  clearSession();
}

export function parsePublicUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new ApiError("Escribe una URL válida, con https://");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ApiError("La URL debe usar http o https");
  }
  return url;
}

async function adapt<T>(name: ServiceName, remote: (base: string) => Promise<T>, local: () => Promise<T>) {
  const base = serviceBase(name);
  if (base) return remote(base);
  await wait();
  return local();
}

function requireSession() {
  const session = readSession();
  if (!session) throw new ApiError("Inicia sesión para continuar");
  return session;
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 220));
}

function presentContact(contact: Contact, visible: boolean): Contact {
  if (visible) return contact;
  return {
    ...contact,
    cedula: maskCedula(contact.cedula),
    edad: null,
    genero: "",
    email: "",
    telefono: "",
  };
}

function contactFromInput(input: ContactInput): Contact {
  const nombre = input.nombre.trim();
  const cedula = input.cedula.trim();
  const telefono = input.telefono.trim();
  if (!nombre || !cedula || !telefono) {
    throw new ApiError("Nombre, cédula y teléfono son obligatorios");
  }
  const edad = input.edad.trim() ? Number(input.edad) : null;
  if (input.edad.trim() && Number.isNaN(edad)) throw new ApiError("La edad no es un número");
  return {
    id: crypto.randomUUID(),
    nombre,
    cedula,
    edad,
    genero: input.genero || "no_informa",
    metodoPago: input.metodoPago || "otro",
    ciudad: input.ciudad.trim(),
    telefono,
    email: input.email.trim(),
    negocio: input.negocio.trim() || readDb().companyName,
  };
}

function localAnalytics(filters: AnalyticsFilters, personalDataVisible: boolean): AnalyticsReport {
  const db = readDb();
  const facets = {
    negocios: unique(db.contacts.map((item) => item.negocio)),
    ciudades: unique(db.contacts.map((item) => item.ciudad)),
    campanas: db.campaigns.map((item) => ({ id: item.id, nombre: item.nombre })),
  };
  const matchedContacts = db.contacts.filter((contact) => matchesContact(contact, filters));
  const matchedIds = new Set(matchedContacts.map((item) => item.id));
  const attempts = db.attempts.filter((attempt) => {
    if (!matchedIds.has(attempt.contactId)) return false;
    if (filters.campana && attempt.campaignId !== filters.campana) return false;
    return true;
  });
  const called = new Set(attempts.map((item) => item.contactId));
  const enrollments = db.enrollments.filter((item) => {
    if (!matchedIds.has(item.contactId)) return false;
    if (filters.campana && item.campaignId !== filters.campana) return false;
    return called.has(item.contactId);
  });
  const rows = attempts
    .slice()
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((attempt) => {
      const contact = db.contacts.find((item) => item.id === attempt.contactId);
      const campaign = db.campaigns.find((item) => item.id === attempt.campaignId);
      const enrollment = db.enrollments.find(
        (item) => item.contactId === attempt.contactId && item.campaignId === attempt.campaignId,
      );
      return {
        id: attempt.id,
        cliente: contact?.nombre ?? "",
        cedula: personalDataVisible ? contact?.cedula ?? "" : maskCedula(contact?.cedula ?? ""),
        ciudad: contact?.ciudad ?? "",
        negocio: contact?.negocio ?? "",
        campana: campaign?.nombre ?? "",
        intento: attempt.number,
        disposicion: dispositionLabel[attempt.disposition],
        resultado: resultLabel(enrollment?.status, enrollment?.converted ?? false),
      };
    });
  return {
    kpis: {
      clientesLlamados: called.size,
      conversiones: enrollments.filter((item) => item.converted).length,
      productosVendidos: enrollments.reduce((sum, item) => sum + item.productsSold, 0),
    },
    rows,
    facets,
    personalDataVisible,
  };
}

function matchesContact(contact: Contact, filters: AnalyticsFilters) {
  if (filters.negocio && contact.negocio !== filters.negocio) return false;
  if (filters.ciudad && contact.ciudad !== filters.ciudad) return false;
  if (filters.cliente && !contact.nombre.toLowerCase().includes(filters.cliente.toLowerCase())) return false;
  if (filters.cedula && !contact.cedula.includes(filters.cedula)) return false;
  return true;
}

function resultLabel(status: string | undefined, converted: boolean) {
  if (converted) return "Conversión";
  if (status === "fallback_whatsapp") return "WhatsApp de fallback";
  if (status === "contestada") return "Contestada, sin venta";
  return "Sin conversión";
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
}

export { emptyFilters };
