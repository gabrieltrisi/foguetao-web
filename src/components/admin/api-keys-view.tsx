"use client";

import { KeyRound, Plus, Copy, Ban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/toast";
import { apiKeys, apiKeyStatusLabel, apiKeyStatusTone } from "@/mocks/admin/api-keys";
import type { ApiKey } from "@/types/admin";

export function ApiKeysView() {
  const { toast } = useToast();

  const columns: DataTableColumn<ApiKey>[] = [
    { id: "name", header: "Nome", cell: (k) => <span className="font-medium text-ink">{k.name}</span> },
    { id: "scope", header: "Escopo", cell: (k) => <Badge tone="neutral" className="normal-case">{k.scope}</Badge> },
    { id: "masked", header: "Chave", cell: (k) => (
      <span className="inline-flex items-center gap-1.5">
        <code className="font-mono text-caption text-ink-2">{k.masked}</code>
        <Button size="sm" variant="ghost" onClick={() => toast({ title: "Chave copiada (mock)", variant: "success" })} aria-label="Copiar chave">
          <Copy className="size-3.5" aria-hidden />
        </Button>
      </span>
    ) },
    { id: "createdAt", header: "Criada em", hideable: true, cell: (k) => <span className="text-ink-2">{k.createdAt}</span> },
    { id: "lastUsed", header: "Último uso", hideable: true, cell: (k) => <span className="text-ink-2">{k.lastUsed}</span> },
    { id: "expiresAt", header: "Expiração", hideable: true, cell: (k) => <span className="text-ink-2">{k.expiresAt}</span> },
    { id: "status", header: "Status", cell: (k) => <Badge tone={apiKeyStatusTone[k.status]}>{apiKeyStatusLabel[k.status]}</Badge> },
    { id: "actions", header: "", hideable: false, className: "text-right", cell: (k) => (
      k.status === "active" ? (
        <Button size="sm" variant="ghost" onClick={() => toast({ title: `Chave "${k.name}" revogada (mock)`, variant: "error" })} aria-label="Revogar">
          <Ban className="size-4" aria-hidden /> Revogar
        </Button>
      ) : <span className="text-caption text-ink-3">—</span>
    ) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="flex items-center gap-2 text-body2 text-ink-2">
          <KeyRound className="size-4 text-ink-3" aria-hidden />
          Chaves exibidas de forma mascarada. O valor completo só aparece uma vez, na criação.
        </p>
        <Button size="sm" onClick={() => toast({ title: "Nova chave gerada (mock)", variant: "success" })}>
          <Plus className="size-4" aria-hidden /> Nova chave
        </Button>
      </Card>
      <DataTable data={apiKeys} columns={columns} getRowId={(k) => k.id} pageSize={8} empty={{ icon: KeyRound, title: "Nenhuma chave de API." }} />
    </div>
  );
}
