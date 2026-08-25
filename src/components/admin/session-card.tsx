"use client";

import * as React from "react";
import { Monitor, Smartphone, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { useRevokeSession } from "@/hooks/auth/use-sessions";
import {
  deviceLabel,
  expiresLabel,
  formatDateTime,
  maskIp,
  messageForSessionError,
  parseUserAgent,
} from "@/lib/auth/session-display";
import type { ApiSession } from "@/types/api/auth";

/**
 * Card de uma sessão REAL. Navegador e dispositivo são derivados do
 * `userAgent` (o backend não guarda esses campos); o IP é mascarado só na
 * exibição. Localização e "último acesso" não existem no contrato — e por isso
 * não aparecem.
 */
export function SessionCard({ session }: { session: ApiSession }) {
  const { toast } = useToast();
  const revoke = useRevokeSession();
  const [confirm, setConfirm] = React.useState(false);

  const ua = parseUserAgent(session.userAgent);
  const Icon = ua.isMobile ? Smartphone : Monitor;

  return (
    <Card className="flex items-start justify-between gap-3 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-2">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
            <span className="truncate">{deviceLabel(session.userAgent)}</span>
            {session.current ? <Badge tone="success">Este dispositivo</Badge> : null}
          </p>
          <p className="text-caption text-ink-2">{ua.label ?? "Navegador desconhecido"}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption text-ink-3">
            <span className="font-mono">{maskIp(session.ipAddress)}</span>
            <span>· iniciada em {formatDateTime(session.createdAt)}</span>
            <span>· {expiresLabel(session.expiresAt)}</span>
          </p>
        </div>
      </div>

      {/* A sessão atual se encerra pelo logout, não por aqui. */}
      {!session.current ? (
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Encerrar sessão em ${deviceLabel(session.userAgent)}`}
          loading={revoke.isPending}
          onClick={() => setConfirm(true)}
        >
          <LogOut className="size-4" aria-hidden />
        </Button>
      ) : null}

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Encerrar esta sessão?"
        description="O dispositivo precisará entrar novamente."
        confirmLabel="Encerrar"
        destructive
        onConfirm={() => {
          setConfirm(false);
          revoke.mutate(session.id, {
            onSuccess: () => toast({ title: "Sessão encerrada", variant: "success" }),
            onError: (e) => toast({ title: messageForSessionError(e), variant: "error" }),
          });
        }}
      />
    </Card>
  );
}
