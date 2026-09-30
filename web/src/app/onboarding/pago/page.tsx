import type { Metadata } from "next";
import { PagoForm } from "@/components/pago-form";

export const metadata: Metadata = { title: "Pago" };

export default function PagoPage() {
  return <PagoForm />;
}
