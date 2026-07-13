import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListPageLayout } from "@/components/patterns/page-patterns";
import { ContactsView } from "@/components/crm/contacts-view";

export const metadata: Metadata = {
  title: "Contatos",
  description: "Gerencie a base de contatos da sua operação.",
};

export default function ContactsPage() {
  return (
    <ListPageLayout
      title="Contatos"
      description="Gerencie a base de contatos da sua operação."
      actions={
        <Button asChild size="sm">
          <Link href="/contacts/new">
            <Plus />
            Novo contato
          </Link>
        </Button>
      }
    >
      <ContactsView />
    </ListPageLayout>
  );
}
