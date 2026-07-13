import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListPageLayout } from "@/components/patterns/page-patterns";
import { OrganizationsView } from "@/components/crm/organizations-view";

export const metadata: Metadata = {
  title: "Organizações",
  description: "Empresas e contas da sua operação.",
};

export default function OrganizationsPage() {
  return (
    <ListPageLayout
      title="Organizações"
      description="Empresas e contas vinculadas aos seus contatos."
      actions={
        <Button asChild size="sm">
          <Link href="/organizations/new">
            <Plus />
            Nova organização
          </Link>
        </Button>
      }
    >
      <OrganizationsView />
    </ListPageLayout>
  );
}
