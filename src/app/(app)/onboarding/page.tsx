import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { OnboardingWizard } from "@/components/admin/onboarding-wizard";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Configure sua conta em poucos passos.",
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Bem-vindo ao Foguetão 🚀" description="Crie sua empresa para ativar o seu centro de comando." />
      <OnboardingWizard />
    </div>
  );
}
