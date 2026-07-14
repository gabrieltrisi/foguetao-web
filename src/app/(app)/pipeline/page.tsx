import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListPageLayout } from "@/components/patterns/page-patterns";
import { PipelineBoard } from "@/components/crm/pipeline-board";
import { deals } from "@/mocks/crm/deals";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Pipeline",
  description: "Acompanhe as oportunidades por etapa.",
};

export default function PipelinePage() {
  const openValue = deals.filter((d) => d.status === "aberta").reduce((s, d) => s + d.value, 0);
  const openCount = deals.filter((d) => d.status === "aberta").length;

  return (
    <ListPageLayout
      title="Pipeline"
      description={`${openCount} oportunidades em aberto · ${formatCurrency(openValue)}`}
      actions={
        <>
          <Button asChild size="sm" variant="secondary">
            <Link href="/pipelines">
              <Settings2 />
              Gerenciar pipelines
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/deals/new">
              <Plus />
              Nova oportunidade
            </Link>
          </Button>
        </>
      }
    >
      <PipelineBoard />
    </ListPageLayout>
  );
}
