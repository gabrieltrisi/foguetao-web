import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListPageLayout } from "@/components/patterns/page-patterns";
import { PipelineBoard } from "@/components/crm/pipeline-board";

export const metadata: Metadata = {
  title: "Pipeline",
  description: "Acompanhe as oportunidades por etapa.",
  robots: { index: false, follow: false },
};

export default function PipelinePage() {
  return (
    <ListPageLayout
      title="Pipeline"
      description="Acompanhe as oportunidades por etapa."
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
