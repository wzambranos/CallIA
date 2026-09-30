"use client";

import { FormEvent, useEffect, useState } from "react";
import { createContact, importContacts, listContacts } from "@/lib/api/services";
import type { Contact, ImportResult } from "@/lib/api/types";
import { generoLabel, pagoLabel } from "@/lib/format";
import { useWorkspace } from "./app-shell";
import {
  Button,
  Card,
  CardTitle,
  ErrorText,
  Field,
  PageHeader,
  SelectInput,
  TableWrap,
  Td,
  TextInput,
  Th,
} from "../ui";

const empty = {
  nombre: "",
  cedula: "",
  edad: "",
  genero: "no_informa",
  metodoPago: "efectivo",
  ciudad: "",
  telefono: "",
  email: "",
  negocio: "",
};

export function ContactosView() {
  const { session } = useWorkspace();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [visible, setVisible] = useState(true);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(empty);
  const [pending, setPending] = useState(false);

  async function reload() {
    const list = await listContacts();
    setContacts(list.contacts);
    setVisible(list.personalDataVisible);
  }

  useEffect(() => {
    let cancelled = false;
    listContacts()
      .then((list) => {
        if (cancelled) return;
        setContacts(list.contacts);
        setVisible(list.personalDataVisible);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "No se pudieron cargar los contactos");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Elige un archivo CSV");
      return;
    }
    setPending(true);
    setError("");
    try {
      setResult(await importContacts(file));
      await reload();
      event.currentTarget.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo importar");
    } finally {
      setPending(false);
    }
  }

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await createContact(form);
      setForm(empty);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar");
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="Contactos"
        description={
          session.role === "analista"
            ? "Tu rol ve la cédula enmascarada. Edad y género no aparecen en el detalle."
            : "Carga masiva por CSV o un registro. Una cédula repetida actualiza el existente."
        }
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle hint="Columnas: nombre, cédula, edad, género, método de pago, ciudad, teléfono, email, negocio.">
            Importar CSV
          </CardTitle>
          <form onSubmit={onImport} className="space-y-4 p-5">
            <a href="/ejemplo-contactos.csv" className="text-sm font-medium text-pine hover:text-pine-dark">
              Descargar plantilla
            </a>
            <input name="file" type="file" accept=".csv,text/csv" className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-canvas file:px-3 file:py-2 file:text-sm" />
            <Button type="submit" disabled={pending}>
              Importar
            </Button>
            {result ? (
              <p className="text-sm text-ink-soft">
                {result.created} nuevos · {result.updated} actualizados · {result.errors.length} con error
              </p>
            ) : null}
            {result?.errors.map((item) => (
              <p key={item.row} className="text-sm text-signal">
                Fila {item.row}: {item.message}
              </p>
            ))}
          </form>
        </Card>
        <Card>
          <CardTitle>Nuevo registro</CardTitle>
          <form onSubmit={onCreate} className="grid gap-3 p-5 sm:grid-cols-2">
            <Field label="Nombre">
              <TextInput value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} required />
            </Field>
            <Field label="Cédula">
              <TextInput value={form.cedula} onChange={(event) => setForm({ ...form, cedula: event.target.value })} required />
            </Field>
            <Field label="Edad">
              <TextInput value={form.edad} onChange={(event) => setForm({ ...form, edad: event.target.value })} inputMode="numeric" />
            </Field>
            <Field label="Género">
              <SelectInput value={form.genero} onChange={(event) => setForm({ ...form, genero: event.target.value })}>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro</option>
                <option value="no_informa">No informa</option>
              </SelectInput>
            </Field>
            <Field label="Método de pago">
              <SelectInput value={form.metodoPago} onChange={(event) => setForm({ ...form, metodoPago: event.target.value })}>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </SelectInput>
            </Field>
            <Field label="Ciudad">
              <TextInput value={form.ciudad} onChange={(event) => setForm({ ...form, ciudad: event.target.value })} />
            </Field>
            <Field label="Teléfono">
              <TextInput value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} required />
            </Field>
            <Field label="Negocio">
              <TextInput value={form.negocio} onChange={(event) => setForm({ ...form, negocio: event.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={pending}>
                Guardar contacto
              </Button>
            </div>
          </form>
        </Card>
      </div>
      <div className="mt-4">
        <ErrorText>{error}</ErrorText>
      </div>
      <div className="mt-6">
        <TableWrap minWidth="min-w-[860px]">
          <thead>
            <tr>
              {["Nombre", "Cédula", ...(visible ? ["Edad", "Género"] : []), "Pago", "Ciudad", "Negocio"].map((header) => (
                <Th key={header}>{header}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-t border-line">
                <Td className="font-medium">{contact.nombre}</Td>
                <Td className="font-mono text-xs">{contact.cedula}</Td>
                {visible ? <Td>{contact.edad ?? "—"}</Td> : null}
                {visible ? <Td>{generoLabel[contact.genero] ?? "—"}</Td> : null}
                <Td>{pagoLabel[contact.metodoPago] ?? contact.metodoPago}</Td>
                <Td>{contact.ciudad}</Td>
                <Td>{contact.negocio}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </section>
  );
}
