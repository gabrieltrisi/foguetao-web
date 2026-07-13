import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { AutomationNav } from "@/components/automations/automation-nav";
import { AutomationsView } from "@/components/automations/automations-view";

export const metadata: Metadata = {
  title: "Automações",
  description: "Automatize fluxos de vendas e comunicação.",
};

export default function AutomationsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Automações"
        description="Automatize fluxos de vendas, marketing e atendimento."
        actions={
          <Button asChild size="sm">
            <Link href="/automations/new">
              <Plus />
              Nova automação
            </Link>
          </Button>
        }
      />
      <AutomationNav />
      <AutomationsView />
    </div>
  );
}
