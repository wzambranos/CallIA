import Link from "next/link";
import { ContactBand } from "@/components/contact-band";
import { buttonClass } from "@/components/ui";

const channels = [
  { name: "Llamadas", text: "Un agente de voz llama con el perfil que confirmaste de tu negocio." },
  { name: "WhatsApp", text: "Si la llamada falla tres veces, el bot escribe una sola vez." },
  { name: "SMS", text: "El mismo contacto puede seguir por mensaje de texto." },
  { name: "Email", text: "Las piezas de correo salen del mismo registro de campaña." },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-line bg-card">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-[0.14em] text-pine uppercase">Contact center omnicanal</p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Tres intentos de llamada. Después, WhatsApp.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft">
                CustomerHub opera campañas de voz con IA, WhatsApp, SMS y email. El equipo carga clientes, mira resultados y puede apagar cada bot por separado.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/registro" className={buttonClass("primary")}>
                  Crear cuenta
                </Link>
                <Link href="/presentacion" className={buttonClass("secondary")}>
                  Ver el producto
                </Link>
              </div>
              <div className="mt-8">
                <ContactBand compact />
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-line bg-canvas p-5">
                <p className="text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">Operación en vivo</p>
                <p className="mt-3 text-lg font-semibold">Cobranza marzo</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <Row label="Bot de llamadas" value="Encendido" ok />
                  <Row label="Bot de WhatsApp" value="Encendido" ok />
                  <Row label="Luis Pérez · intento 3" value="Fallback en cola" />
                  <Row label="Ana Gómez" value="Contestó · 1 producto" ok />
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map((channel) => (
          <article key={channel.name} className="rounded-xl border border-line bg-card p-5">
            <h2 className="text-base font-semibold">{channel.name}</h2>
            <p className="mt-3 text-sm leading-6 text-ink-soft">{channel.text}</p>
          </article>
        ))}
      </section>
    </>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={ok ? "font-medium text-ok" : "text-right"}>{value}</dd>
    </div>
  );
}
