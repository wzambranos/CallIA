"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword, inviteMember, listMembers, resetLocalDemo, updateMemberRole } from "@/lib/api/services";
import type { Member, Role } from "@/lib/api/types";
import { permissionMatrix, roleCatalog, roleOrder, sortMembers } from "@/lib/format";
import { useWorkspace } from "./app-shell";
import {
  Avatar,
  Button,
  Card,
  CardTitle,
  CellYes,
  ErrorText,
  Field,
  Notice,
  PageHeader,
  RoleBadge,
  SelectInput,
  StatusBadge,
  TableWrap,
  Td,
  TextInput,
  Th,
} from "../ui";

const inviteRoles: Role[] = ["admin", "analista"];

export function EquipoView() {
  const router = useRouter();
  const { session } = useWorkspace();
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [inviteRole, setInviteRole] = useState<Role>("analista");
  const owner = session.role === "owner";
  const ordered = sortMembers(members);

  async function reload() {
    setMembers(await listMembers());
  }

  useEffect(() => {
    let cancelled = false;
    listMembers()
      .then((next) => {
        if (!cancelled) setMembers(next);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "No se pudo cargar el equipo");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    setNotice("");
    try {
      await inviteMember({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        role: inviteRole,
      });
      event.currentTarget.reset();
      setInviteRole("analista");
      setNotice("Invitación registrada. El acceso lo completa el servicio de identidad.");
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo invitar");
    } finally {
      setPending(false);
    }
  }

  async function onRole(memberId: string, role: Role) {
    setError("");
    setNotice("");
    try {
      await updateMemberRole(memberId, role);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cambiar el rol");
    }
  }

  async function onPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = String(form.get("next") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (next.length < 8) {
      setError("La contraseña nueva necesita al menos 8 caracteres");
      return;
    }
    if (next !== confirm) {
      setError("La confirmación no coincide");
      return;
    }
    setPending(true);
    setError("");
    setNotice("");
    try {
      await changePassword(String(form.get("current") ?? ""), next);
      event.currentTarget.reset();
      setNotice("Contraseña actualizada.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cambiar la contraseña");
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="Equipo y roles"
        description="Tres niveles de acceso. El menú se ajusta al rol; cada servicio vuelve a comprobar el permiso."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {roleOrder.map((role, index) => {
          const catalog = roleCatalog[role];
          const count = members.filter((member) => member.role === role).length;
          return (
            <Card key={role} className="p-5">
              <p className="text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">Nivel {index + 1}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <RoleBadge role={role} />
                <span className="text-xs text-ink-soft">{count === 1 ? "1 persona" : `${count} personas`}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{catalog.summary}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {catalog.scope.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pine" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 overflow-hidden">
        <CardTitle hint="Ordenados por nivel: propietario, administrador y analista.">Personas</CardTitle>
        <TableWrap minWidth="min-w-[760px]" framed={false}>
          <thead>
            <tr>
              {["Persona", "Rol", "Estado", "Permiso"].map((header) => (
                <Th key={header}>{header}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordered.map((member) => {
              const yours = member.id === session.memberId;
              return (
                <tr key={member.id} className="border-t border-line">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} />
                      <div>
                        <p className="font-medium">
                          {member.name}
                          {yours ? <span className="ml-2 text-xs font-normal text-ink-soft">Tú</span> : null}
                        </p>
                        <p className="text-xs text-ink-soft">{member.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    {owner && !yours ? (
                      <SelectInput
                        className="h-9 max-w-[180px]"
                        value={member.role}
                        onChange={(event) => onRole(member.id, event.target.value as Role)}
                        aria-label={`Rol de ${member.name}`}
                      >
                        {roleOrder.map((role) => (
                          <option key={role} value={role}>
                            {roleCatalog[role].label}
                          </option>
                        ))}
                      </SelectInput>
                    ) : (
                      <RoleBadge role={member.role} />
                    )}
                  </Td>
                  <Td>
                    <StatusBadge active={member.status === "activo"} />
                  </Td>
                  <Td className="text-ink-soft">{roleCatalog[member.role].summary}</Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </Card>

      <Card className="mt-8 overflow-hidden">
        <CardTitle hint="Qué ve y qué puede hacer cada nivel.">Matriz de permisos</CardTitle>
        <TableWrap framed={false}>
          <thead>
            <tr>
              <Th>Permiso</Th>
              {roleOrder.map((role) => (
                <Th key={role}>{roleCatalog[role].label}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionMatrix.map((row) => (
              <tr key={row.permiso} className="border-t border-line">
                <Td className="font-medium">{row.permiso}</Td>
                <Td>
                  <CellYes value={row.owner} />
                </Td>
                <Td>
                  <CellYes value={row.admin} />
                </Td>
                <Td>
                  <CellYes value={row.analista} />
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {owner ? (
          <Card>
            <CardTitle hint="El propietario no se invita: se crea en el alta de la empresa.">Invitar persona</CardTitle>
            <form onSubmit={onInvite} className="space-y-4 p-5">
              <Field label="Nombre">
                <TextInput name="name" required autoComplete="name" />
              </Field>
              <Field label="Email de trabajo">
                <TextInput name="email" type="email" required autoComplete="email" />
              </Field>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Rol</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {inviteRoles.map((role) => {
                    const selected = inviteRole === role;
                    return (
                      <label
                        key={role}
                        className={`cursor-pointer rounded-xl border p-3 ${selected ? "border-pine bg-pine/5" : "border-line"}`}
                      >
                        <input
                          type="radio"
                          name="invite-role"
                          className="sr-only"
                          checked={selected}
                          onChange={() => setInviteRole(role)}
                        />
                        <RoleBadge role={role} />
                        <p className="mt-2 text-xs leading-5 text-ink-soft">{roleCatalog[role].summary}</p>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <Button type="submit" disabled={pending}>
                Enviar invitación
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-5">
            <h2 className="text-sm font-semibold">Invitaciones</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Solo el propietario invita y cambia roles. Tú tienes acceso de {roleCatalog[session.role].label.toLowerCase()}.
            </p>
          </Card>
        )}
        <Card>
          <CardTitle hint="Afecta solo a tu usuario.">Tu cuenta</CardTitle>
          <form onSubmit={onPassword} className="space-y-4 p-5">
            <Field label="Contraseña actual">
              <TextInput name="current" type="password" required autoComplete="current-password" />
            </Field>
            <Field label="Nueva contraseña" hint="Mínimo 8 caracteres.">
              <TextInput name="next" type="password" required autoComplete="new-password" minLength={8} />
            </Field>
            <Field label="Confirmar">
              <TextInput name="confirm" type="password" required autoComplete="new-password" />
            </Field>
            <Button type="submit" disabled={pending}>
              Actualizar contraseña
            </Button>
          </form>
        </Card>
      </div>

      <div className="mt-6 space-y-3">
        {notice ? <Notice>{notice}</Notice> : null}
        <ErrorText>{error}</ErrorText>
      </div>

      <button
        type="button"
        className="mt-10 text-xs text-ink-soft hover:text-ink"
        onClick={() => {
          resetLocalDemo();
          router.push("/entrar");
        }}
      >
        Borrar datos locales de este navegador
      </button>
    </section>
  );
}
