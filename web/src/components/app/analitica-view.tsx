"use client";

import { useEffect, useState } from "react";
import { getAnalytics } from "@/lib/api/services";
import type { AnalyticsFilters, AnalyticsReport } from "@/lib/api/types";
import { Card, EmptyState, PageHeader, TableWrap, Td, Th, fieldClass } from "../ui";

const initial: AnalyticsFilters = { negocio: "", cliente: "", cedula: "", ciudad: "", campana: "" };

export function AnaliticaView() {
  const [filters, setFilters] = useState(initial);
  const [cliente, setCliente] = useState("");
  const [cedula, setCedula] = useState("");
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, cliente, cedula }));
    }, 250);
    return () => clearTimeout(timer);
  }, [cliente, cedula]);

  useEffect(() => {
    let cancelled = false;
    getAnalytics(filters)
      .then((next) => {
        if (!cancelled) setReport(next);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "No se pudo cargar la analítica");
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <section>
      <PageHeader
        title="Analítica"
        description="Clientes llamados, conversiones y productos vendidos. Los filtros se combinan."
      />
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select
            className={fieldClass}
            value={filters.negocio}
            onChange={(event) => setFilters({ ...filters, negocio: event.target.value })}
            aria-label="Negocio"
          >
            <option value="">Todos los negocios</option>
            {report?.facets.negocios.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input className={fieldClass} placeholder="Cliente" value={cliente} onChange={(event) => setCliente(event.target.value)} aria-label="Cliente" />
          <input className={fieldClass} placeholder="Cédula" value={cedula} onChange={(event) => setCedula(event.target.value)} aria-label="Cédula" />
          <select
            className={fieldClass}
            value={filters.ciudad}
            onChange={(event) => setFilters({ ...filters, ciudad: event.target.value })}
            aria-label="Ciudad"
          >
            <option value="">Todas las ciudades</option>
            {report?.facets.ciudades.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className={fieldClass}
            value={filters.campana}
            onChange={(event) => setFilters({ ...filters, campana: event.target.value })}
            aria-label="Campaña"
          >
            <option value="">Todas las campañas</option>
            {report?.facets.campanas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
      </Card>
      {error ? <p className="mt-4 text-sm text-signal">{error}</p> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Kpi label="Clientes llamados" value={report?.kpis.clientesLlamados} />
        <Kpi label="Conversiones" value={report?.kpis.conversiones} />
        <Kpi label="Productos vendidos" value={report?.kpis.productosVendidos} />
      </div>
      <div className="mt-6">
        <TableWrap minWidth="min-w-[760px]">
          <thead>
            <tr>
              {["Cliente", "Cédula", "Ciudad", "Negocio", "Campaña", "Intento", "Estado", "Resultado"].map((header) => (
                <Th key={header}>{header}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report?.rows.map((row) => (
              <tr key={row.id} className="border-t border-line">
                <Td className="font-medium">{row.cliente}</Td>
                <Td className="font-mono text-xs">{row.cedula}</Td>
                <Td>{row.ciudad}</Td>
                <Td>{row.negocio}</Td>
                <Td>{row.campana}</Td>
                <Td>{row.intento}</Td>
                <Td>{row.disposicion}</Td>
                <Td>{row.resultado}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        {report && report.rows.length === 0 ? <EmptyState>Ningún intento con esos filtros.</EmptyState> : null}
      </div>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: number | undefined }) {
  return (
    <Card className="px-5 py-6">
      <p className="text-3xl font-semibold tracking-tight">{value ?? "—"}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </Card>
  );
}
