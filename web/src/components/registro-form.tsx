"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { homeFor } from "@/lib/api/session";
import { register } from "@/lib/api/services";
import { OnboardingFrame } from "./onboarding-frame";
import { Button, ErrorText, Field, TextInput } from "./ui";

export function RegistroForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password.length < 8) {
      setError("La contraseña necesita al menos 8 caracteres");
      return;
    }
    setPending(true);
    setError("");
    try {
      const session = await register({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password,
        companyName: String(form.get("company") ?? ""),
      });
      router.push(homeFor(session));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear la cuenta");
    } finally {
      setPending(false);
    }
  }

  return (
    <OnboardingFrame step={1} title="Crea la cuenta de la empresa">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Tu nombre">
          <TextInput name="name" required autoComplete="name" />
        </Field>
        <Field label="Empresa">
          <TextInput name="company" required />
        </Field>
        <Field label="Email">
          <TextInput name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Contraseña" hint="Mínimo 8 caracteres.">
          <TextInput name="password" type="password" required autoComplete="new-password" minLength={8} />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={pending}>
          {pending ? "Creando…" : "Continuar al perfil"}
        </Button>
      </form>
    </OnboardingFrame>
  );
}
