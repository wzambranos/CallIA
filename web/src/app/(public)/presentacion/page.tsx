import type { Metadata } from "next";
import { ContactBand } from "@/components/contact-band";

export const metadata: Metadata = { title: "Producto" };

const blocks = [
  {
    title: "El agente llama con tu perfil",
    text: "En el alta pegas la URL de la empresa. El servicio de perfilado arma un borrador y tú lo confirmas. Ese texto es lo que el agente puede decir: rubro, oferta, productos y tono.",
  },
  {
    title: "Tres fallos y un solo WhatsApp",
    text: "No contesta, ocupado, fallo de red o buzón cuentan como intento fallido. A la tercera, la voz se detiene y queda un mensaje de WhatsApp, si hay consentimiento y el bot está encendido. Si una persona contesta, la llamada cierra el ciclo.",
  },
  {
    title: "El equipo decide qué sigue vivo",
    text: "Dos interruptores separados apagan el bot de llamadas y el de WhatsApp. Apagar la voz detiene originaciones nuevas. La llamada que ya está en curso termina.",
  },
  {
    title: "Lo que opera el panel",
    text: "Carga masiva en CSV, ficha con edad, género y método de pago, roles de propietario, administrador y analista, y un tablero con clientes llamados, conversiones, productos vendidos y el repositorio de grabaciones.",
  },
];

export default function PresentacionPage() {
  return (
    <>
      <article className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-xs font-semibold tracking-[0.14em] text-pine uppercase">Producto</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Cómo trabaja la operación</h1>
        <p className="mt-4 text-base leading-7 text-ink-soft">
          Cuatro canales sobre un mismo registro de clientes. La primera entrega deja la voz y el fallback de WhatsApp en el centro. SMS y email entran como servicios de canal cuando se conecten.
        </p>
        <div className="mt-12 space-y-8">
          {blocks.map((block, index) => (
            <section key={block.title} className="border-t border-line pt-6">
              <p className="text-xs font-semibold text-pine">0{index + 1}</p>
              <h2 className="mt-2 text-xl font-semibold">{block.title}</h2>
              <p className="mt-3 leading-7 text-ink-soft">{block.text}</p>
            </section>
          ))}
        </div>
      </article>
      <ContactBand />
    </>
  );
}
