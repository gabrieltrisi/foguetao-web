import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AutomationNav } from "@/components/automations/automation-nav";
import { ExecutionsView } from "@/components/automations/executions-view";

export const metadata: Metadata = {
  title: "Execuções",
  description: "Histórico de execuções das automações.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Execuções" description="Histórico de execuções das automações." />
      <AutomationNav />
      <ExecutionsView />
    </div>
  );
}
