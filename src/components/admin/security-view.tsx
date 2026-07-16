"use client";

import { ShieldCheck, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SessionsList } from "@/components/admin/sessions-list";
import { PreviewNotice } from "@/components/admin/preview-notice";

/**
 * Segurança. As sessões são REAIS (`/auth/sessions`).
 *
 * A auditoria confirmou que NÃO existe backend para 2FA/MFA (nenhuma rota,
 * nenhum modelo), alertas de segurança nem histórico de eventos: o `AuditLog`
 * existe, mas nenhuma rota o expõe. Esses blocos ficam como prévia declarada —
 * sem simular persistência.
 */
export function SecurityView() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-5 lg:col-span-2">
        <Card className="p-5">
          <h3 className="mb-3 font-display text-h3 font-semibold text-ink">
            Sessões e dispositivos
          </h3>
          <SessionsList columns={1} />
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <h3 className="font-display text-h3 font-semibold text-ink">Alertas de segurança</h3>
          <PreviewNotice>
            Alertas de segurança não existem no backend: não há modelo de alerta nem rota que
            exponha os eventos de auditoria.
          </PreviewNotice>
        </Card>
      </div>

      <div className="flex flex-col gap-5">
        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-surface text-ink-2">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
                Autenticação em 2 etapas
                <Badge tone="warning">Prévia</Badge>
              </p>
              <p className="text-caption text-ink-3">Disponível em breve</p>
            </div>
          </div>
          <p className="text-body2 text-ink-2">
            O backend ainda não tem 2FA: não existe rota nem modelo de segundo fator. O acesso é
            protegido por senha forte, bloqueio progressivo após tentativas falhas e sessões
            revogáveis.
          </p>
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-surface text-ink-2">
              <KeyRound className="size-5" aria-hidden />
            </span>
            <p className="font-medium text-ink">Tokens &amp; chaves</p>
          </div>
          <p className="text-body2 text-ink-2">
            Gerencie tokens de acesso e chaves de API da organização.
          </p>
          <Button asChild variant="secondary" size="sm">
            <a href="/api-keys">Ver API Keys</a>
          </Button>
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <h3 className="font-display text-h3 font-semibold text-ink">Histórico</h3>
          <PreviewNotice>
            O histórico de segurança não existe no backend. Os eventos são auditados, mas nenhuma
            rota os expõe ainda.
          </PreviewNotice>
        </Card>
      </div>
    </div>
  );
}
