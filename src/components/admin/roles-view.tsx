"use client";

import { ShieldCheck, Users, Plus, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { roles } from "@/mocks/admin/roles";
import type { Role } from "@/types/admin";

const dotTone: Record<Role["tone"], string> = {
  brand: "bg-brand",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-ink-3",
};

const iconTone: Record<Role["tone"], string> = {
  brand: "text-brand",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-ink-2",
};

function RoleCard({ role }: { role: Role }) {
  const { toast } = useToast();
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-surface">
            <ShieldCheck className={cn("size-5", iconTone[role.tone])} aria-hidden />
          </span>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-h3 font-semibold text-ink">{role.name}</h3>
            {role.system ? <Lock className="size-3.5 text-ink-3" aria-label="Papel do sistema" /> : null}
          </div>
        </div>
        <span className={cn("mt-1 size-2.5 rounded-full", dotTone[role.tone])} aria-hidden />
      </div>
      <p className="min-h-[2.5rem] text-body2 text-ink-2">{role.description}</p>
      <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className="inline-flex items-center gap-1.5 text-caption text-ink-3">
          <Users className="size-4" aria-hidden /> {role.members} membro(s)
        </span>
        <Button size="sm" variant="ghost" onClick={() => toast({ title: `Editar papel ${role.name} (mock)` })}>
          Configurar
        </Button>
      </div>
    </Card>
  );
}

export function RolesView() {
  const { toast } = useToast();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body2 text-ink-2">{roles.length} papéis · <Badge tone="neutral" className="normal-case">2 do sistema</Badge></p>
        <Button size="sm" onClick={() => toast({ title: "Novo papel (mock)" })}>
          <Plus className="size-4" aria-hidden /> Novo papel
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {roles.map((r) => <RoleCard key={r.id} role={r} />)}
      </div>
    </div>
  );
}
