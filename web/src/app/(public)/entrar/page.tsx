import type { Metadata } from "next";
import { EntrarForm } from "@/components/entrar-form";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return <EntrarForm />;
}
