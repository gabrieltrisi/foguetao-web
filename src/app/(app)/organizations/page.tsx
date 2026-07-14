import type { Metadata } from "next";
import { ListPageLayout } from "@/components/patterns/page-patterns";
import { OrganizationsView } from "@/components/crm/organizations-view";
import { NewOrganizationAction } from "@/components/crm/organizations-view.actions";

export const metadata: Metadata = {
  title: "Organizações",
  description: "Empresas e contas da sua operação.",
  robots: { index: false, follow: false },
};

export default function OrganizationsPage() {
  return (
    <ListPageLayout
      title="Organizações"
      description="Empresas e contas vinculadas aos seus contatos."
      actions={<NewOrganizationAction />}
    >
      <OrganizationsView />
    </ListPageLayout>
  );
}
