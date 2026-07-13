"use client";

import * as React from "react";
import { Eye, EyeOff, KeyRound, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { automationVariables, maskValue, variableEnvLabel, variableEnvTone } from "@/mocks/automations/variables";
import type { AutomationVariable } from "@/types/automations";

export function VariableTable() {
  const { toast } = useToast();
  const [revealed, setRevealed] = React.useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const columns: DataTableColumn<AutomationVariable>[] = [
    { id: "key", header: "Chave", sortable: true, sortAccessor: (v) => v.key, cell: (v) => <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-caption text-ink">{v.key}</code> },
    { id: "type", header: "Tipo", cell: (v) => <Badge tone="neutral" className="normal-case">{v.type}</Badge> },
    {
      id: "value", header: "Valor",
      cell: (v) => {
        const isSecret = v.type === "secret";
        const show = revealed.has(v.id);
        return (
          <span className="inline-flex max-w-[16rem] items-center gap-1.5">
            <code className="truncate font-mono text-caption text-ink-2">{isSecret && !show ? maskValue(v) : v.value}</code>
            {isSecret ? (
              <button type="button" aria-label={show ? "Ocultar valor" : "Revelar valor"} onClick={() => toggle(v.id)} className="shrink-0 text-ink-3 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded">
                {show ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
              </button>
            ) : null}
          </span>
        );
      },
    },
    { id: "env", header: "Ambiente", cell: (v) => <Badge tone={variableEnvTone[v.environment]}>{variableEnvLabel[v.environment]}</Badge> },
    { id: "scope", header: "Escopo", cell: (v) => <span className="text-ink-2">{v.scope === "global" ? "Global" : "Workflow"}</span> },
    { id: "desc", header: "Descrição", hideable: true, cell: (v) => <span className="text-ink-2">{v.description}</span> },
    {
      id: "actions", header: "", hideable: false, className: "text-right",
      cell: (v) => (
        <span className="inline-flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`Editar ${v.key}`} onClick={() => toast({ title: "Editar variável (mock)" })}><Pencil /></Button>
          <ConfirmDialog
            trigger={<Button variant="ghost" size="icon-sm" aria-label={`Excluir ${v.key}`} className="text-ink-2 hover:text-danger"><Trash2 /></Button>}
            title={`Excluir "${v.key}"?`}
            description="A variável será removida das automações que a utilizam."
            confirmLabel="Excluir"
            destructive
            onConfirm={() => toast({ title: "Variável excluída (mock)", variant: "warning" })}
          />
        </span>
      ),
    },
  ];

  return <DataTable data={automationVariables} columns={columns} getRowId={(v) => v.id} searchAccessor={(v) => `${v.key} ${v.description}`} searchPlaceholder="Buscar variável…" empty={{ icon: KeyRound, title: "Nenhuma variável." }} />;
}
