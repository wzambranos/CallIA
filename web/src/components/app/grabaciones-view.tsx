"use client";

import { useEffect, useState } from "react";
import { listRecordings } from "@/lib/api/services";
import type { RecordingItem } from "@/lib/api/types";
import { formatDuration, formatWhen } from "@/lib/format";
import { useWorkspace } from "./app-shell";
import { Card, PageHeader, TableWrap, Td, Th } from "../ui";

export function GrabacionesView() {
  const { session } = useWorkspace();
  const [items, setItems] = useState<RecordingItem[]>([]);
  const [selected, setSelected] = useState<RecordingItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session.role === "analista") return;
    listRecordings({ negocio: "", cliente: "", cedula: "", ciudad: "", campana: "" })
      .then(setItems)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "No se pudieron cargar las grabaciones"));
  }, [session.role]);

  if (session.role === "analista") {
    return (
      <section>
        <PageHeader title="Grabaciones" description="Este rol no reproduce audio." />
        <Card className="p-5">
          <p className="text-sm leading-6 text-ink-soft">El analista consulta KPIs. Las grabaciones quedan para propietario y administrador.</p>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Grabaciones"
        description="El audio llega con una URL firmada. En local ves la ficha, sin archivo."
      />
      {error ? <p className="mb-4 text-sm text-signal">{error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <TableWrap minWidth="min-w-[560px]">
          <thead>
            <tr>
              {["Cliente", "Campaña", "Duración", "Fecha"].map((header) => (
                <Th key={header}>{header}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={`border-t border-line ${selected?.id === item.id ? "bg-pine/5" : ""}`}>
                <Td>
                  <button type="button" className="font-medium hover:text-pine" onClick={() => setSelected(item)}>
                    {item.cliente}
                  </button>
                </Td>
                <Td>{item.campana}</Td>
                <Td>{formatDuration(item.durationSec)}</Td>
                <Td className="text-ink-soft">{formatWhen(item.at)}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        <Card className="p-5">
          {selected ? (
            <>
              <h2 className="text-base font-semibold">{selected.cliente}</h2>
              <p className="mt-2 text-sm text-ink-soft">
                {selected.campana} · {selected.disposition} · {formatDuration(selected.durationSec)}
              </p>
              {selected.playbackUrl ? (
                <audio className="mt-4 w-full" controls src={selected.playbackUrl} />
              ) : (
                <p className="mt-4 rounded-lg bg-canvas px-3 py-3 text-sm text-ink-soft">
                  Pendiente del servicio de grabaciones. No hay URL firmada todavía.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-soft">Elige una llamada para ver la ficha.</p>
          )}
        </Card>
      </div>
    </section>
  );
}
