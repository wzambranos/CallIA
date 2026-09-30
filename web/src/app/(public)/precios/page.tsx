import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui";

export const metadata: Metadata = { title: "Precios" };

const plans = [
  {
    name: "Inicial",
    price: "Al conectar facturación",
    detail: "Para una operación diaria",
    points: ["10 llamadas simultáneas", "1 originación por segundo", "10.000 contactos"],
    cta: "Crear cuenta",
    href: "/registro",
    featured: true,
  },
  {
    name: "Crecimiento",
    price: "Al conectar facturación",
    detail: "Para más volumen",
    points: ["25 llamadas simultáneas", "2 originaciones por segundo", "50.000 contactos"],
    cta: "Hablar con el equipo",
    href: "/contacto",
    featured: false,
  },
];

export default function PreciosPage() {
  return (
    <article className="mx-auto max-w-6xl px-5 py-16">
      <p className="text-xs font-semibold tracking-[0.14em] text-pine uppercase">Precios</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight">Planes según el tamaño de la operación.</h1>
      <p className="mt-4 max-w-2xl text-ink-soft leading-7">
        Los cupos de abajo son la referencia comercial. El cobro lo hace el servicio de facturación en el momento de la compra.
      </p>
      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <section key={plan.name} className={`rounded-xl border bg-card p-6 ${plan.featured ? "border-pine" : "border-line"}`}>
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="mt-4 text-2xl font-semibold tracking-tight">{plan.price}</p>
            <p className="text-sm text-ink-soft">{plan.detail}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {plan.points.map((point) => (
                <li key={point} className="border-t border-line pt-2">
                  {point}
                </li>
              ))}
            </ul>
            <Link href={plan.href} className={`${buttonClass(plan.featured ? "primary" : "secondary")} mt-8 w-full`}>
              {plan.cta}
            </Link>
          </section>
        ))}
      </div>
    </article>
  );
}
