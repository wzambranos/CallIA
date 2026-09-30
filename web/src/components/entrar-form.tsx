"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { homeFor } from "@/lib/api/session";
import { login } from "@/lib/api/services";
import { Button, Card, ErrorText, Field, TextInput } from "./ui";

export function EntrarForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function enter(email: string, password: string) {
    setPending(true);
    setError("");
    try {
      const session = await login({ email, password });
      router.push(homeFor(session));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo entrar");
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await enter(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
      <p className="mt-2 text-sm text-ink-soft">Usa tu correo de trabajo o una cuenta de ejemplo.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Email">
          <TextInput name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Contraseña">
          <TextInput name="password" type="password" required autoComplete="current-password" />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
      <Card className="mt-10 p-5">
        <p className="text-sm text-ink-soft">
          Cuentas de ejemplo, contraseña <span className="font-medium text-ink">central-demo</span>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={pending} onClick={() => enter("demo@central.local", "central-demo")}>
            Propietario
          </Button>
          <Button type="button" variant="secondary" disabled={pending} onClick={() => enter("analista@central.local", "central-demo")}>
            Analista
          </Button>
        </div>
      </Card>
    </div>
  );
}
