"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { homeFor, useClientReady, useSession } from "@/lib/api/session";
import { confirmProfile, draftProfile, getOnboardingDraft } from "@/lib/api/services";
import type { ProfileInput } from "@/lib/api/types";
import { OnboardingFrame } from "./onboarding-frame";
import { Button, ErrorText, Field, TextArea, TextInput } from "./ui";

const empty: ProfileInput = {
  url: "",
  tradeName: "",
  industry: "",
  offer: "",
  products: "",
  tone: "",
};

export function PerfilForm() {
  const router = useRouter();
  const ready = useClientReady();
  const session = useSession();
  const [draft, setDraft] = useState<ProfileInput>(empty);
  const [opened, setOpened] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/entrar");
      return;
    }
    if (session.onboardingStep !== "perfil") {
      router.replace(homeFor(session));
      return;
    }
    getOnboardingDraft()
      .then((profile) => {
        if (!profile) return;
        setDraft(profile);
        setOpened(true);
      })
      .catch(() => undefined);
  }, [ready, session, router]);

  async function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const next = await draftProfile(String(form.get("url") ?? ""));
      setDraft(next);
      setOpened(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo preparar el perfil");
    } finally {
      setPending(false);
    }
  }

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.industry.trim() || !draft.products.trim() || !draft.offer.trim()) {
      setError("Completa rubro, oferta y productos antes de confirmar");
      return;
    }
    setPending(true);
    setError("");
    try {
      await confirmProfile(draft);
      router.push("/onboarding/pago");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el perfil");
    } finally {
      setPending(false);
    }
  }

  return (
    <OnboardingFrame step={2} title="Perfil del negocio">
      <p className="mb-6 text-sm leading-relaxed text-ink-soft">
        Pega la URL pública de la empresa. Hoy el borrador se arma en el navegador a partir del dominio. Al publicar el servicio de perfilado, esta misma pantalla recibe el texto extraído del sitio.
      </p>
      <form onSubmit={prepare} className="space-y-4">
        <Field label="URL de la empresa">
          <TextInput
            name="url"
            type="url"
            required
            placeholder="https://tuempresa.com"
            value={draft.url}
            onChange={(event) => setDraft({ ...draft, url: event.target.value })}
          />
        </Field>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending && !opened ? "Preparando…" : "Preparar borrador"}
        </Button>
      </form>
      {opened ? (
        <form onSubmit={confirm} className="mt-8 space-y-4 border-t border-line pt-8">
          <Field label="Nombre comercial">
            <TextInput value={draft.tradeName} onChange={(event) => setDraft({ ...draft, tradeName: event.target.value })} required />
          </Field>
          <Field label="Rubro">
            <TextInput value={draft.industry} onChange={(event) => setDraft({ ...draft, industry: event.target.value })} required />
          </Field>
          <Field label="Oferta">
            <TextArea rows={3} value={draft.offer} onChange={(event) => setDraft({ ...draft, offer: event.target.value })} required />
          </Field>
          <Field label="Productos">
            <TextInput value={draft.products} onChange={(event) => setDraft({ ...draft, products: event.target.value })} required />
          </Field>
          <Field label="Tono del agente">
            <TextInput value={draft.tone} onChange={(event) => setDraft({ ...draft, tone: event.target.value })} required />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando…" : "Confirmar y continuar"}
          </Button>
        </form>
      ) : (
        <ErrorText>{error}</ErrorText>
      )}
    </OnboardingFrame>
  );
}
