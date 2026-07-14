"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { PermissionMatrix } from "@/components/admin/permission-matrix";
import { useToast } from "@/components/ui/toast";
import { roles } from "@/mocks/admin/roles";

export function PermissionsView() {
  const { toast } = useToast();
  const [role, setRole] = React.useState("manager");
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <span className="text-body2 text-ink-2">Papel</span>
        <div className="w-56"><Combobox options={roleOptions} value={role} onValueChange={setRole} /></div>
        <Button size="sm" className="sm:ml-auto" onClick={() => toast({ title: "Permissões salvas (mock)", variant: "success" })}>
          <Save className="size-4" aria-hidden /> Salvar permissões
        </Button>
      </FilterBar>
      <p className="text-caption text-ink-3">
        Ative as ações permitidas por módulo. Alterações aplicam-se a todos os usuários com este papel.
      </p>
      <PermissionMatrix key={role} />
    </div>
  );
}
