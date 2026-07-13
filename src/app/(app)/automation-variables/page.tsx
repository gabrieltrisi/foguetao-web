import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AutomationNav } from "@/components/automations/automation-nav";
import { VariablesView } from "@/components/automations/variables-view";

export const metadata: Metadata = {
  title: "Variáveis",
  description: "Variáveis reutilizáveis nas automações.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Variáveis" description="Variáveis reutilizáveis nas automações." />
      <AutomationNav />
      <VariablesView />
    </div>
  );
}
