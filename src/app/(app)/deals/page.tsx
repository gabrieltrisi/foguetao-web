import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListPageLayout } from "@/components/patterns/page-patterns";
import { DealsView } from "@/components/crm/deals-view";

export const metadata: Metadata = {
  title: "Oportunidades",
  description: "Todas as oportunidades da sua operação.",
};

export default function DealsPage() {
  return (
    <ListPageLayout
      title="Oportunidades"
      description="Todas as oportunidades da sua operação comercial."
      actions={
        <Button asChild size="sm">
          <Link href="/deals/new">
            <Plus />
            Nova oportunidade
          </Link>
        </Button>
      }
    >
      <DealsView />
    </ListPageLayout>
  );
}
