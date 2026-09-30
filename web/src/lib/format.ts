import type { Role } from "./api/types";

export const dispositionLabel: Record<string, string> = {
  contestada: "Contestada",
  no_contestada: "No contestada",
  ocupado: "Ocupado",
  fallo: "Fallo",
  buzon: "Buzón",
};

export const enrollmentLabel: Record<string, string> = {
  en_voz: "En curso de voz",
  contestada: "Contestada",
  fallback_whatsapp: "Fallback a WhatsApp",
  cerrada: "Cerrada",
};

export const roleOrder: Role[] = ["owner", "admin", "analista"];

export const roleCatalog: Record<
  Role,
  { label: string; summary: string; scope: string[] }
> = {
  owner: {
    label: "Propietario",
    summary: "Dueño de la cuenta. Facturación, equipo y operación completa.",
    scope: ["Facturación", "Equipo y roles", "Campañas", "Contactos", "Grabaciones", "Controles", "Analítica"],
  },
  admin: {
    label: "Administrador",
    summary: "Opera el día a día. No toca facturación ni el ownership.",
    scope: ["Campañas", "Contactos", "Grabaciones", "Controles", "Analítica"],
  },
  analista: {
    label: "Analista",
    summary: "Consulta resultados. Cédula enmascarada. Sin audio ni interruptores.",
    scope: ["Analítica", "Contactos en lectura", "Campañas en lectura"],
  },
};

export const roleLabel: Record<Role, string> = {
  owner: roleCatalog.owner.label,
  admin: roleCatalog.admin.label,
  analista: roleCatalog.analista.label,
};

export const permissionMatrix: { permiso: string; owner: string; admin: string; analista: string }[] = [
  { permiso: "Analítica y KPIs", owner: "Sí", admin: "Sí", analista: "Sí" },
  { permiso: "Contactos", owner: "Total", admin: "Total", analista: "Lectura enmascarada" },
  { permiso: "Campañas", owner: "Total", admin: "Total", analista: "Lectura" },
  { permiso: "Grabaciones", owner: "Sí", admin: "Sí", analista: "No" },
  { permiso: "Kill switches", owner: "Sí", admin: "Sí", analista: "No" },
  { permiso: "Equipo y roles", owner: "Sí", admin: "Lectura", analista: "Lectura" },
  { permiso: "Facturación", owner: "Sí", admin: "No", analista: "No" },
];

export const pagoLabel: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  otro: "Otro",
};

export const generoLabel: Record<string, string> = {
  femenino: "Femenino",
  masculino: "Masculino",
  otro: "Otro",
  no_informa: "No informa",
};

export function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(iso));
}

export function formatDay(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeZone: "America/Bogota",
  }).format(new Date(iso));
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function maskCedula(value: string) {
  const tail = value.slice(-4);
  return `••••${tail}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function sortMembers<T extends { role: Role; name: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const rank = roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
    if (rank !== 0) return rank;
    return a.name.localeCompare(b.name, "es");
  });
}
