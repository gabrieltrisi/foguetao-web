import type { Metadata } from "next";
import { EvolutionOnboarding } from "@/components/integrations/evolution/evolution-onboarding";

export const metadata: Metadata = {
  title: "WhatsApp (Evolution)",
  description: "Conecte e gerencie uma instância da Evolution API.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <EvolutionOnboarding />;
}
