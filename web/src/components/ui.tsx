import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import type { Role } from "@/lib/api/types";
import { initials, roleLabel } from "@/lib/format";

export function buttonClass(variant: "primary" | "secondary" | "ghost" = "primary") {
  const base =
    "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  if (variant === "secondary") return `${base} border border-line bg-card text-ink hover:bg-canvas`;
  if (variant === "ghost") return `${base} text-ink-soft hover:bg-ink/5 hover:text-ink`;
  return `${base} bg-pine text-white hover:bg-pine-dark`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return <button className={`${buttonClass(variant)} ${className}`} {...props} />;
}

export const fieldClass =
  "h-10 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-ink-soft/80 focus:border-pine focus:ring-2 focus:ring-pine/15";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-ink-soft">{hint}</span> : null}
    </label>
  );
}

export function TextInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClass} ${className}`} {...props} />;
}

export function SelectInput({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${fieldClass} ${className}`} {...props} />;
}

export function TextArea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldClass} h-auto py-2 ${className}`} {...props} />;
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="text-sm text-signal">{children}</p>;
}

export function Notice({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-lg bg-pine/10 px-3 py-2 text-sm text-pine-dark">{children}</p>;
}

export function Brand({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline text-[15px] leading-none tracking-[-0.04em] ${className}`}
      aria-label="CustomerHub"
    >
      <span className={light ? "font-medium text-white" : "font-medium text-ink"}>Customer</span>
      <span className={light ? "font-semibold text-[#5eead4]" : "font-semibold text-pine"}>Hub</span>
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-soft">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-card ${className}`}>{children}</div>;
}

export function CardTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="border-b border-line px-5 py-4">
      <h2 className="text-sm font-semibold">{children}</h2>
      {hint ? <p className="mt-1 text-sm text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pine/10 text-xs font-semibold text-pine">
      {initials(name)}
    </span>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    owner: "bg-ink text-white",
    admin: "bg-pine/10 text-pine-dark",
    analista: "bg-canvas text-ink-soft",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[role]}`}>
      {roleLabel[role]}
    </span>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-ok" : "bg-warn"}`} />
      {active ? "Activo" : "Invitado"}
    </span>
  );
}

export function TableWrap({
  children,
  minWidth = "min-w-[640px]",
  framed = true,
}: {
  children: ReactNode;
  minWidth?: string;
  framed?: boolean;
}) {
  return (
    <div className={framed ? "overflow-x-auto rounded-xl border border-line bg-card" : "overflow-x-auto"}>
      <table className={`w-full ${minWidth} text-left text-sm`}>{children}</table>
    </div>
  );
}

export function Th({ children, className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`bg-canvas px-4 py-3 text-xs font-semibold tracking-wide text-ink-soft uppercase ${className}`} {...props}>
      {children}
    </th>
  );
}

export function Td({ children, className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-3.5 ${className}`} {...props}>
      {children}
    </td>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-4 py-8 text-center text-sm text-ink-soft">{children}</p>;
}

export function CellYes({ value }: { value: string }) {
  const denied = value === "No";
  const partial = value.startsWith("Lectura");
  return (
    <span className={denied ? "text-ink-soft" : partial ? "text-ink" : "font-medium text-ok"}>
      {value}
    </span>
  );
}
