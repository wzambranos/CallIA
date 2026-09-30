import type { Metadata } from "next";
import { RegistroForm } from "@/components/registro-form";

export const metadata: Metadata = { title: "Registro" };

export default function RegistroPage() {
  return <RegistroForm />;
}
