"use client";

import * as React from "react";
import { Check, Copy, RefreshCw, Webhook as WebhookIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { maskSecret } from "@/mocks/automations/webhooks";
import type { Webhook } from "@/types/automations";

export function WebhookCard({ webhook: w }: { webhook: Webhook }) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try { await navigator.clipboard?.writeText(w.endpoint); } catch {}
    setCopied(true);
    toast({ title: "URL copiada", variant: "success" });
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-ink"><WebhookIcon className="size-5" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-h3 font-semibold text-ink">{w.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge tone="neutral" className="normal-case">{w.method}</Badge>
            <Badge tone={w.status === "active" ? "success" : "neutral"}>{w.status === "active" ? "Ativo" : "Inativo"}</Badge>
          </div>
        </div>
      </div>

      {/* Endpoint */}
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2.5">
        <code className="min-w-0 flex-1 truncate font-mono text-caption text-ink-2">{w.endpoint}</code>
        <Button variant="ghost" size="icon-sm" aria-label="Copiar URL" onClick={copy}>{copied ? <Check /> : <Copy />}</Button>
      </div>

      {/* Segredo */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-2">
          <span className="text-caption text-ink-3">Segredo:</span>
          <code className="truncate font-mono text-caption text-ink-2">{maskSecret(w.secret)}</code>
        </span>
        <ConfirmDialog
          trigger={<Button variant="secondary" size="sm"><RefreshCw />Rotacionar</Button>}
          title="Rotacionar segredo?"
          description="O segredo atual deixará de ser válido imediatamente."
          confirmLabel="Rotacionar"
          onConfirm={() => toast({ title: "Segredo rotacionado (mock)", variant: "success" })}
        />
      </div>

      {/* Últimas chamadas */}
      <div className="border-t border-line pt-3">
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">Últimas chamadas</p>
        <ul className="flex flex-col gap-1.5">
          {w.calls.map((c) => (
            <li key={c.id} className="flex items-center gap-2 text-caption">
              <span className={cn("inline-flex w-10 justify-center rounded px-1 py-0.5 font-mono font-semibold", c.status < 300 ? "bg-success/10 text-success" : c.status < 500 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger")}>{c.status}</span>
              <span className="text-ink-2">{c.ip}</span>
              <span className="ml-auto text-ink-3">{c.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
