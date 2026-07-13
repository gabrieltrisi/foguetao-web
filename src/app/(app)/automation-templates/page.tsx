import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AutomationNav } from "@/components/automations/automation-nav";
import { TemplatesView } from "@/components/automations/templates-view";

export const metadata: Metadata = {
  title: "Templates",
  description: "Biblioteca de templates de automação.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Templates" description="Biblioteca de templates de automação." />
      <AutomationNav />
      <TemplatesView />
    </div>
  );
}
