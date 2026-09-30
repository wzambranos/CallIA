"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { homeFor, useClientReady, useSession } from "@/lib/api/session";
import { startTrial } from "@/lib/api/services";
import { OnboardingFrame } from "./onboarding-frame";
import { Button, ErrorText } from "./ui";

export function PagoForm() {
  const router = useRouter();
  const ready = useClientReady();
  const session = useSession();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/entrar");
      return;
    }
    if (session.onboardingStep !== "pago") {
      router.replace(homeFor(session));
    }
  }, [ready, session, router]);

  async function activate() {
    setPending(true);
    setError("");
    try {
      const result = await startTrial();
      if (!result.checkoutUrl) router.push("/app");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo activar el trial");
      setPending(false);
    }
  }

  return (
    <OnboardingFrame step={3} title="Trial de 14 días">
      <div className="rounded-xl border border-line bg-card p-5">
        <p className="text-sm text-ink-soft">Plan</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">Trial</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="border-t border-line pt-2">14 días antes del primer cobro</li>
          <li className="border-t border-line pt-2">2 llamadas simultáneas</li>
          <li className="border-t border-line pt-2">500 contactos</li>
        </ul>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-ink-soft">
        El medio de pago lo pide el servicio de facturación. Si ese servicio responde con una pasarela, esta pantalla te lleva allá. Mientras la URL no esté publicada, el trial queda activo en este navegador y no se cobra nada.
      </p>
      <ErrorText>{error}</ErrorText>
      <Button className="mt-6" type="button" disabled={pending} onClick={activate}>
        {pending ? "Activando…" : "Activar trial"}
      </Button>
    </OnboardingFrame>
  );
}
