"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Can } from "@/hooks/company/use-permissions";

/** Botão "Novo contato" visível apenas com permissão crm.contacts.create. */
export function NewContactAction() {
  return (
    <Can permission="crm.contacts.create">
      <Button asChild size="sm">
        <Link href="/contacts/new">
          <Plus />
          Novo contato
        </Link>
      </Button>
    </Can>
  );
}
