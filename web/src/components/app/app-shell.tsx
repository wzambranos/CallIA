"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { adapterReport } from "@/lib/api/endpoints";
import { homeFor, useClientReady, useSession } from "@/lib/api/session";
import { getWorkspace, logout } from "@/lib/api/services";
import type { Role, Workspace } from "@/lib/api/types";
import { formatDay, initials, roleLabel } from "@/lib/format";
import { Brand } from "../ui";

const WorkspaceContext = createContext<Workspace | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Fuera del panel");
  return value;
}

const nav = [
  {
    label: "Operación",
    items: [
      { href: "/app", label: "Analítica" },
      { href: "/app/contactos", label: "Contactos" },
      { href: "/app/campanas", label: "Campañas" },
      { href: "/app/grabaciones", label: "Grabaciones", roles: ["owner", "admin"] as Role[] },
      { href: "/app/controles", label: "Controles", roles: ["owner", "admin"] as Role[] },
    ],
  },
  {
    label: "Organización",
    items: [{ href: "/app/equipo", label: "Equipo y roles" }],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const ready = useClientReady();
  const session = useSession();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/entrar");
      return;
    }
    if (session.onboardingStep !== "listo") {
      router.replace(homeFor(session));
      return;
    }
    let cancelled = false;
    getWorkspace()
      .then((data) => {
        if (!cancelled) setWorkspace(data);
      })
      .catch(() => {
        if (!cancelled) router.replace("/entrar");
      });
    return () => {
      cancelled = true;
    };
  }, [ready, session, router]);

  if (!workspace) {
    return (
      <div className="grid min-h-full flex-1 place-items-center">
        <p className="text-sm text-ink-soft">Abriendo el panel…</p>
      </div>
    );
  }

  const local = adapterReport().filter((item) => !item.remote);
  const company = workspace.profile?.tradeName || workspace.session.companyName;

  return (
    <WorkspaceContext.Provider value={workspace}>
      <div className="flex min-h-full flex-1 flex-col lg:flex-row">
        <aside className="flex w-full flex-col bg-sidebar text-white lg:w-64 lg:shrink-0">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <Link href="/app" aria-label="CustomerHub">
              <Brand light />
            </Link>
            <button
              type="button"
              className="text-sm text-sidebar-muted lg:hidden"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
            >
              Salir
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-1 lg:flex-col lg:overflow-visible">
            {nav.map((group) => {
              const items = group.items.filter((item) => !item.roles || item.roles.includes(workspace.session.role));
              if (items.length === 0) return null;
              return (
                <div key={group.label} className="flex gap-1 lg:flex-col">
                  <p className="hidden px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-sidebar-muted uppercase lg:block">
                    {group.label}
                  </p>
                  {items.map((item) => {
                    const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`shrink-0 rounded-lg px-3 py-2 text-sm ${active ? "bg-white/10 font-medium text-white" : "text-sidebar-muted hover:bg-white/5 hover:text-white"}`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
          <div className="hidden border-t border-white/10 px-4 py-4 lg:flex lg:items-center lg:gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xs font-semibold">
              {initials(workspace.session.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{workspace.session.name}</p>
              <p className="truncate text-xs text-sidebar-muted">{roleLabel[workspace.session.role]}</p>
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center gap-4 border-b border-line bg-card px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{company}</p>
              <p className="truncate text-xs text-ink-soft">{workspace.session.email}</p>
            </div>
            {workspace.subscription?.status === "trial" ? (
              <span className="hidden rounded-full bg-pine/10 px-3 py-1 text-xs font-medium text-pine-dark sm:inline">
                Trial hasta {formatDay(workspace.subscription.trialEndsAt)}
              </span>
            ) : null}
            <button
              type="button"
              className="ml-auto hidden text-sm font-medium text-ink-soft hover:text-ink lg:inline"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
            >
              Cerrar sesión
            </button>
          </header>
          {local.length > 0 ? (
            <p className="border-b border-line bg-canvas px-6 py-2 text-xs text-ink-soft">
              Modo local. Cada servicio se conecta con su URL de entorno.
            </p>
          ) : null}
          <div className="flex-1 px-6 py-8">{children}</div>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
