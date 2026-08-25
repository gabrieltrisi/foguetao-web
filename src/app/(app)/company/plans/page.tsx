import type { Metadata } from "next";
import { PlansView } from "@/components/admin/plans-view";

export const metadata: Metadata = {
  title: "Plano",
  description: "Assinatura e comparação de planos.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PlansView />;
}
