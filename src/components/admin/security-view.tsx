"use client";

import { ShieldCheck, ShieldAlert, Info, KeyRound, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatList } from "@/components/business/kpi-block";
import { SessionCard } from "@/components/admin/session-card";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  sessions,
  securityAlerts,
  securityHistory,
  securityLevelTone,
  twoFactor,
} from "@/mocks/admin/security";
import type { SecurityAlert as SecurityAlertType } from "@/types/admin";

const levelIcon = { info: Info, warning: ShieldAlert, danger: ShieldAlert } as const;
const levelText = { info: "text-info", warning: "text-warning", danger: "text-danger" } as const;

export function SecurityAlert({ alert }: { alert: SecurityAlertType }) {
  const Icon = levelIcon[alert.level];
  return (
    <div className="flex items-start gap-3 rounded-lg border border-line bg-white p-3">
      <Icon className={cn("mt-0.5 size-4 shrink-0", levelText[alert.level])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-body2 font-medium text-ink">
          {alert.title}
          <Badge tone={securityLevelTone[alert.level]}>{alert.level === "danger" ? "Crítico" : alert.level === "warning" ? "Atenção" : "Info"}</Badge>
        </p>
        <p className="text-caption text-ink-2">{alert.description}</p>
        <p className="mt-0.5 text-caption text-ink-3">{alert.time}</p>
      </div>
    </div>
  );
}

export function SecurityView() {
  const { toast } = useToast();
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-5 lg:col-span-2">
        <Card className="p-5">
          <h3 className="mb-3 font-display text-h3 font-semibold text-ink">Sessões e dispositivos</h3>
          <div className="flex flex-col gap-3">
            {sessions.map((s) => <SessionCard key={s.id} session={s} />)}
          </div>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => toast({ title: "Todas as outras sessões encerradas (mock)", variant: "success" })}>
            Encerrar outras sessões
          </Button>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 font-display text-h3 font-semibold text-ink">Alertas de segurança</h3>
          <div className="flex flex-col gap-2">
            {securityAlerts.map((a) => <SecurityAlert key={a.id} alert={a} />)}
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-5">
        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-success/10 text-success"><ShieldCheck className="size-5" aria-hidden /></span>
            <div>
              <p className="font-medium text-ink">Autenticação em 2 etapas</p>
              <p className="text-caption text-success">{twoFactor.enabled ? "Ativada" : "Desativada"}</p>
            </div>
          </div>
          <StatList
            items={[
              { label: "Método", value: <span className="inline-flex items-center gap-1"><Smartphone className="size-3.5" aria-hidden /> {twoFactor.method}</span> },
              { label: "Códigos de backup", value: `${twoFactor.backupCodes} disponíveis` },
            ]}
          />
          <Button variant="secondary" size="sm" onClick={() => toast({ title: "Gerenciar 2FA (mock)" })}>Gerenciar 2FA</Button>
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-surface text-ink-2"><KeyRound className="size-5" aria-hidden /></span>
            <p className="font-medium text-ink">Tokens & chaves</p>
          </div>
          <p className="text-body2 text-ink-2">Gerencie tokens de acesso e chaves de API da organização.</p>
          <Button asChild variant="secondary" size="sm"><a href="/api-keys">Ver API Keys</a></Button>
        </Card>

        <Card className="p-5">
          <h3 className="mb-2 font-display text-h3 font-semibold text-ink">Histórico</h3>
          <StatList items={securityHistory.map((h) => ({ label: `${h.event} · ${h.actor}`, value: h.time }))} />
        </Card>
      </div>
    </div>
  );
}
