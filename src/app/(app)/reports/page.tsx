import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsNav } from "@/components/analytics/analytics-nav";
import { ReportsView } from "@/components/analytics/reports-view";

export const metadata: Metadata = {
  title: "Relatórios",
  description: "Catálogo de relatórios da sua operação.",
};

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Relatórios"
        description="Catálogo de relatórios, favoritos, compartilhados e agendados."
        actions={
          <Button asChild size="sm">
            <Link href="/reports/new">
              <Plus />
              Novo relatório
            </Link>
          </Button>
        }
      />
      <AnalyticsNav />
      <ReportsView />
    </div>
  );
}
