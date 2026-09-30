"use client";

import { FormEvent, useState } from "react";
import { submitLead } from "@/lib/api/services";
import { Button, ErrorText, Field, TextArea, TextInput } from "./ui";

export function ContactoForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      await submitLead({
        nombre: String(form.get("nombre") ?? ""),
        email: String(form.get("email") ?? ""),
        empresa: String(form.get("empresa") ?? ""),
        mensaje: String(form.get("mensaje") ?? ""),
      });
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo enviar");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return <p className="border border-line bg-card p-6">Recibimos el mensaje. El servicio de contacto comercial lo guarda para el equipo.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nombre">
        <TextInput name="nombre" required autoComplete="name" />
      </Field>
      <Field label="Email">
        <TextInput name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="Empresa">
        <TextInput name="empresa" required />
      </Field>
      <Field label="Mensaje">
        <TextArea name="mensaje" required rows={5} />
      </Field>
      <ErrorText>{error}</ErrorText>
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}
