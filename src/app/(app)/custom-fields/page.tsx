import type { Metadata } from "next";
import { ListPageLayout } from "@/components/patterns/page-patterns";
import { CustomFieldsView } from "@/components/crm/custom-fields-view";
import { NewCustomFieldAction } from "@/components/crm/custom-fields-view.actions";

export const metadata: Metadata = {
  title: "Campos personalizados",
  description: "Campos próprios para contatos e organizações.",
  robots: { index: false, follow: false },
};

export default function CustomFieldsPage() {
  return (
    <ListPageLayout
      title="Campos personalizados"
      description="Defina campos próprios para contatos e organizações."
      actions={<NewCustomFieldAction />}
    >
      <CustomFieldsView />
    </ListPageLayout>
  );
}
