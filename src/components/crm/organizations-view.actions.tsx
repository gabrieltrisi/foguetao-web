"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Can } from "@/hooks/company/use-permissions";

/** Botão "Nova organização" visível apenas com permissão crm.organizations.create. */
export function NewOrganizationAction() {
  return (
    <Can permission="crm.organizations.create">
      <Button asChild size="sm">
        <Link href="/organizations/new">
          <Plus />
          Nova organização
        </Link>
      </Button>
    </Can>
  );
}
