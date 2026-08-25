"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/providers/session-provider";
import { CustomFieldFormModal } from "@/components/crm/custom-field-form-modal";

/** Ação de criar definição — oculta sem `crm.custom_fields.create`. */
export function NewCustomFieldAction() {
  const { can } = useSession();
  const [open, setOpen] = React.useState(false);

  if (!can("crm.custom_fields.create")) return null;

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus />
        Novo campo
      </Button>
      <CustomFieldFormModal open={open} onOpenChange={setOpen} />
    </>
  );
}
