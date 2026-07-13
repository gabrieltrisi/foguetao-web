import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AutomationNav } from "@/components/automations/automation-nav";
import { SchedulerView } from "@/components/automations/scheduler-view";

export const metadata: Metadata = {
  title: "Agendador",
  description: "Recorrências e agendamentos.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Agendador" description="Recorrências e agendamentos." />
      <AutomationNav />
      <SchedulerView />
    </div>
  );
}
