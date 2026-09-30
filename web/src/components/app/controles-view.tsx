"use client";

import { useEffect, useState } from "react";
import { getControls, setControl } from "@/lib/api/services";
import type { Controls } from "@/lib/api/types";
import { formatWhen } from "@/lib/format";
import { useWorkspace } from "./app-shell";
import { Card, PageHeader } from "../ui";

export function ControlesView() {
  const { session } = useWorkspace();
  const [controls, setControls] = useState<Controls | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"voice" | "whatsapp" | null>(null);

  useEffect(() => {
    getControls()
      .then(setControls)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "No se pudieron cargar los controles"));
  }, []);

  async function toggle(channel: "voice" | "whatsapp") {
    if (!controls) return;
    setPending(channel);
    setError("");
    try {
      setControls(await setControl(channel, !controls[channel].enabled));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cambiar el control");
    } finally {
      setPending(null);
    }
  }

  if (session.role === "analista") {
    return (
      <section>
        <PageHeader title="Controles" description="Este rol no opera los interruptores." />
        <Card className="p-5">
          <p className="text-sm leading-6 text-ink-soft">Los kill switches quedan para propietario y administrador.</p>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Controles"
        description="Cada bot se apaga por separado. La llamada conectada termina. Un WhatsApp que aún no salió se queda en espera."
      />
      {error ? <p className="mb-4 text-sm text-signal">{error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Switch
          title="Bot de llamadas"
          description="Apagado, no salen originaciones nuevas."
          enabled={controls?.voice.enabled ?? false}
          meta={controls ? `${controls.voice.updatedBy} · ${formatWhen(controls.voice.updatedAt)}` : ""}
          disabled={!controls || pending !== null}
          onToggle={() => toggle("voice")}
        />
        <Switch
          title="Bot de WhatsApp"
          description="Apagado, no sale el fallback ni otro mensaje del bot."
          enabled={controls?.whatsapp.enabled ?? false}
          meta={controls ? `${controls.whatsapp.updatedBy} · ${formatWhen(controls.whatsapp.updatedAt)}` : ""}
          disabled={!controls || pending !== null}
          onToggle={() => toggle("whatsapp")}
        />
      </div>
    </section>
  );
}

function Switch({
  title,
  description,
  enabled,
  meta,
  disabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  meta: string;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={title}
          disabled={disabled}
          onClick={onToggle}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${enabled ? "bg-pine" : "bg-ink/15"}`}
        >
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-[left] ${enabled ? "left-7" : "left-1"}`} />
        </button>
      </div>
      <p className={`mt-4 text-sm font-medium ${enabled ? "text-ok" : "text-ink-soft"}`}>{enabled ? "Encendido" : "Apagado"}</p>
      {meta ? <p className="mt-1 text-xs text-ink-soft">{meta}</p> : null}
    </Card>
  );
}
