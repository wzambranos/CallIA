import type { Metadata } from "next";
import { Card } from "@/components/ui";
import { ContactoForm } from "@/components/contacto-form";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactoPage() {
  return (
    <article className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2">
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-pine uppercase">Contacto</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Si el volumen no cabe en autoservicio, escribe.</h1>
        <p className="mt-4 leading-7 text-ink-soft">
          Cuéntanos empresa, canal principal y tamaño de la base. El mensaje queda en el servicio de contacto comercial.
        </p>
      </div>
      <Card className="p-6">
        <ContactoForm />
      </Card>
    </article>
  );
}
