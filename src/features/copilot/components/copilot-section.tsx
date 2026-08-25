"use client";

import * as React from "react";
import {
  AlertTriangle,
  DollarSign,
  HelpCircle,
  LifeBuoy,
  ShoppingCart,
  Sparkles,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PanelSection } from "@/features/inbox/components/context/panel-section";
import { useCopilotContext } from "@/features/copilot/hooks/use-copilot-context";
import {
  useCopilotIntent,
  useCopilotNextAction,
  useCopilotRisks,
  useCopilotSummary,
} from "@/features/copilot/hooks/use-copilot";
import type { CopilotIntentKind, RiskSeverity } from "@/features/copilot/types";

const INTENT_UI: Record<CopilotIntentKind, { Icon: typeof ShoppingCart; className: string }> = {
  compra: { Icon: ShoppingCart, className: "text-success" },
  suporte: { Icon: LifeBuoy, className: "text-info" },
  financeiro: { Icon: DollarSign, className: "text-warning" },
  cancelamento: { Icon: XCircle, className: "text-danger" },
  duvida: { Icon: HelpCircle, className: "text-ink-3" },
};

const RISK_TONE: Record<RiskSeverity, "danger" | "warning" | "neutral"> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

/**
 * Seção COPILOT no painel contextual (F7). Só OBSERVA (nunca envia). Cada bloco tem seu
 * estado (loading/erro). Intenção/próxima ação/riscos são AUTO; o resumo é sob demanda.
 * A UI não conhece o provedor (MOCK hoje) — daí o selo "IA (mock)".
 */
export const CopilotSection = React.memo(function CopilotSection({
  conversationId,
  contactId,
}: {
  conversationId: string;
  contactId: string;
}) {
  const { context, ready } = useCopilotContext(conversationId, contactId);
  const intent = useCopilotIntent(context, ready);
  const nextAction = useCopilotNextAction(context, ready);
  const risks = useCopilotRisks(context, ready);
  const summary = useCopilotSummary(context);

  const intentUi = intent.data ? INTENT_UI[intent.data.kind] : null;

  return (
    <div aria-label="Copilot">
      <div className="flex items-center gap-1.5 border-b border-line bg-brand-soft/40 px-3 py-2">
        <Sparkles className="size-4 text-brand" aria-hidden />
        <span className="text-caption font-semibold text-ink">Copilot</span>
        <Badge tone="info">IA (mock)</Badge>
      </div>

      {/* Resumo (sob demanda). */}
      <PanelSection
        title="Resumo"
        action={
          <Button
            size="sm"
            variant="secondary"
            loading={summary.isPending}
            onClick={() => summary.mutate()}
          >
            {summary.data ? "Regerar" : "Gerar resumo"}
          </Button>
        }
      >
        {summary.isPending ? (
          <p className="text-caption text-ink-3">Gerando…</p>
        ) : summary.isError ? (
          <p className="text-caption text-danger">Não foi possível gerar o resumo.</p>
        ) : summary.data ? (
          <p className="whitespace-pre-wrap text-caption text-ink">{summary.data.text}</p>
        ) : (
          <p className="text-caption text-ink-3">Clique em “Gerar resumo” para um resumo do atendimento.</p>
        )}
      </PanelSection>

      {/* Intenção (auto). */}
      <PanelSection title="Intenção detectada" isLoading={intent.isLoading} isError={intent.isError} onRetry={() => void intent.refetch()}>
        {intent.data && intentUi ? (
          <div className="flex items-start gap-2">
            <intentUi.Icon className={cn("mt-0.5 size-4 shrink-0", intentUi.className)} aria-hidden />
            <div className="min-w-0">
              <p className="text-caption font-medium text-ink">
                {intent.data.label}{" "}
                <span className="text-ink-3">· {Math.round(intent.data.confidence * 100)}% confiança</span>
              </p>
              <p className="text-micro text-ink-3">{intent.data.description}</p>
            </div>
          </div>
        ) : null}
      </PanelSection>

      {/* Próxima ação (auto). */}
      <PanelSection title="Próxima ação sugerida" isLoading={nextAction.isLoading} isError={nextAction.isError} onRetry={() => void nextAction.refetch()}>
        {nextAction.data ? (
          <div>
            <p className="text-caption font-medium text-ink">{nextAction.data.label}</p>
            <p className="text-micro text-ink-3">{nextAction.data.reason}</p>
          </div>
        ) : null}
      </PanelSection>

      {/* Riscos (auto). */}
      <PanelSection
        title="Riscos detectados"
        isLoading={risks.isLoading}
        isError={risks.isError}
        isEmpty={!risks.isLoading && !risks.isError && (risks.data?.length ?? 0) === 0}
        emptyLabel="Nenhum risco no momento."
        onRetry={() => void risks.refetch()}
      >
        <ul className="space-y-1.5">
          {(risks.data ?? []).map((r) => (
            <li key={r.id} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
              <span className="text-caption text-ink">{r.label}</span>
              <Badge tone={RISK_TONE[r.severity]}>{r.severity}</Badge>
            </li>
          ))}
        </ul>
      </PanelSection>
    </div>
  );
});
