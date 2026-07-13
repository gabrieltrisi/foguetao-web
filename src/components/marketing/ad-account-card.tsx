"use client";

import { BadgeDollarSign, MonitorPlay, Music2, RefreshCw, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { AdAccount, AdAccountStatus } from "@/types/marketing";

const platformIcon: Record<AdAccount["platform"], LucideIcon> = {
  meta: MonitorPlay,
  google: BadgeDollarSign,
  tiktok: Music2,
};

const statusConfig: Record<AdAccountStatus, { label: string; dot: string; text: string }> = {
  connected: { label: "Conectada", dot: "bg-success", text: "text-success" },
  syncing: { label: "Sincronizando", dot: "bg-info", text: "text-info" },
  error: { label: "Erro de conexão", dot: "bg-danger", text: "text-danger" },
  disconnected: { label: "Desconectada", dot: "bg-ink-3", text: "text-ink-3" },
};

export function AdAccountCard({ account }: { account: AdAccount }) {
  const { toast } = useToast();
  const Icon = platformIcon[account.platform];
  const s = statusConfig[account.status];

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-ink">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-h3 font-semibold text-ink">{account.name}</p>
          <p className="truncate text-caption text-ink-3">{account.externalId}</p>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 text-caption font-medium", s.text)}>
          <span className={cn("size-2 rounded-full", s.dot, account.status === "syncing" && "animate-pulse")} aria-hidden />
          {s.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 border-y border-line py-3">
        <div>
          <p className="text-caption text-ink-3">Investido</p>
          <p className="font-display text-h3 font-bold text-ink">{formatCurrency(account.spend)}</p>
        </div>
        <div>
          <p className="text-caption text-ink-3">Campanhas</p>
          <p className="font-display text-h3 font-bold text-ink">{formatNumber(account.campaigns)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-caption text-ink-3">Sinc.: {account.lastSync}</span>
        <Button
          variant={account.status === "error" ? "primary" : "secondary"}
          size="sm"
          onClick={() => toast({ title: account.status === "error" ? "Reconectando… (mock)" : "Sincronizando… (mock)" })}
        >
          <RefreshCw />
          {account.status === "error" ? "Reconectar" : "Sincronizar"}
        </Button>
      </div>
    </Card>
  );
}
