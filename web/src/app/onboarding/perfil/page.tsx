import type { Metadata } from "next";
import { PerfilForm } from "@/components/perfil-form";

export const metadata: Metadata = { title: "Perfil" };

export default function PerfilPage() {
  return <PerfilForm />;
}
