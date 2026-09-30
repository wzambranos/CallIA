import Link from "next/link";
import { buttonClass } from "@/components/ui";

export function ContactBand({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "" : "px-5 py-16"}>
      <div
        className={`rounded-xl border border-line bg-canvas ${
          compact ? "p-5" : "mx-auto max-w-4xl p-6 sm:p-8"
        }`}
      >
        {compact ? null : (
          <p className="text-xs font-semibold tracking-[0.14em] text-pine uppercase">Contacto</p>
        )}
        <h2 className={`font-semibold tracking-tight ${compact ? "text-center text-lg" : "mt-3 text-2xl"}`}>
          Mira nuestra operación
        </h2>
        {compact ? null : (
          <p className="mt-3 text-base leading-7 text-ink-soft">Ponte en contacto con nosotros.</p>
        )}
        {compact ? null : (
          <Link href="/contacto" className={`${buttonClass("primary")} mt-5`}>
            Contacta
          </Link>
        )}
      </div>
    </section>
  );
}
