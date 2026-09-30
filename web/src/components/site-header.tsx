"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { homeFor, useClientReady, useSession } from "@/lib/api/session";
import { Brand, buttonClass } from "./ui";

const links = [
  { href: "/presentacion", label: "Producto" },
  { href: "/precios", label: "Precios" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const ready = useClientReady();
  const session = useSession();
  const signedIn = ready && session;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
        <Link href="/" className="shrink-0" aria-label="CustomerHub">
          <Brand />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink-soft md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "font-medium text-ink" : "hover:text-ink"}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {signedIn ? (
            <Link href={homeFor(session)} className={buttonClass("primary")}>
              Ir al panel
            </Link>
          ) : (
            <>
              <Link href="/entrar" className={buttonClass("ghost")}>
                Entrar
              </Link>
              <Link href="/registro" className={buttonClass("primary")}>
                Empezar
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-line px-5 py-2 text-sm text-ink-soft md:hidden">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="shrink-0">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
