import type { Metadata } from "next";
import { ListPageLayout } from "@/components/patterns/page-patterns";
import { ContactsView } from "@/components/crm/contacts-view";
import { NewContactAction } from "@/components/crm/contacts-view.actions";

export const metadata: Metadata = {
  title: "Contatos",
  description: "Gerencie a base de contatos da sua operação.",
  robots: { index: false, follow: false },
};

export default function ContactsPage() {
  return (
    <ListPageLayout
      title="Contatos"
      description="Gerencie a base de contatos da sua operação."
      actions={<NewContactAction />}
    >
      <ContactsView />
    </ListPageLayout>
  );
}
