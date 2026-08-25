"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Can } from "@/hooks/company/use-permissions";

/** Botão "Novo pipeline" visível apenas com permissão crm.pipelines.create. */
export function NewPipelineAction() {
  return (
    <Can permission="crm.pipelines.create">
      <Button asChild size="sm">
        <Link href="/pipelines/new">
          <Plus />
          Novo pipeline
        </Link>
      </Button>
    </Can>
  );
}
