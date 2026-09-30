"use client";

import { useEffect, useState } from "react";
import { getCampaignBoard } from "@/lib/api/services";
import type { CampaignBoardItem } from "@/lib/api/types";
import { formatWhen } from "@/lib/format";
import { Card, PageHeader, TableWrap, Td, Th } from "../ui";

export function CampanasView() {
  const [board, setBoard] = useState<CampaignBoardItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getCampaignBoard()
      .then(setBoard)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "No se pudieron cargar las campañas"));
  }, []);

  return (
    <section>
      <PageHeader
        title="Campañas"
        description="Historial de intentos por contacto. El tercer fallo de voz deja un WhatsApp de fallback."
      />
      {error ? <p className="mb-4 text-sm text-signal">{error}</p> : null}
      <div className="space-y-6">
        {board.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold">{campaign.nombre}</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {campaign.negocio} · {campaign.objetivo}
              </p>
            </div>
            <TableWrap minWidth="min-w-[680px]" framed={false}>
              <thead>
                <tr>
                  {["Cliente", "Cédula", "Intentos", "Estado"].map((header) => (
                    <Th key={header}>{header}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaign.rows.map((row) => (
                  <tr key={row.contactId} className="border-t border-line align-top">
                    <Td className="font-medium">{row.cliente}</Td>
                    <Td className="font-mono text-xs">{row.cedula}</Td>
                    <Td>
                      {row.attempts.length === 0 ? (
                        <span className="text-ink-soft">Sin marcar</span>
                      ) : (
                        <ol className="space-y-1">
                          {row.attempts.map((attempt) => (
                            <li key={attempt.number}>
                              {attempt.number}. {attempt.disposition}
                              <span className="text-ink-soft"> · {formatWhen(attempt.at)}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </Td>
                    <Td>
                      <p>{row.statusLabel}</p>
                      {row.fallback ? <p className="mt-1 text-xs font-medium text-warn">WhatsApp encolado</p> : null}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </Card>
        ))}
      </div>
    </section>
  );
}
