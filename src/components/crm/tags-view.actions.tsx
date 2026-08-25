"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/providers/session-provider";
import { TagFormModal } from "@/components/crm/tag-form-modal";

/** Ação de criar etiqueta — oculta sem `crm.tags.create`. */
export function NewTagAction() {
  const { can } = useSession();
  const [open, setOpen] = React.useState(false);

  if (!can("crm.tags.create")) return null;

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus />
        Nova etiqueta
      </Button>
      <TagFormModal open={open} onOpenChange={setOpen} />
    </>
  );
}
