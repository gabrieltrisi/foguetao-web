"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Progress, type ProgressTone } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignMetrics } from "@/hooks/campaigns/use-campaigns";
import {
  etaDisplay,
  formatDateTime,
  formatDuration,
  formatPercent,
  formatRate,
} from "@/lib/campaigns/display";
import type { ApiCampaign, ApiCampaignMetrics } from "@/types/api/campaigns";

/** Painel de métricas + progresso + ETA da campanha (Sprint C2B). */
export function CampaignMetricsPanel({ campaign }: { campaign: ApiCampaign }) {
  const q = useCampaignMetrics(campaign.id, campaign.status);

  if (q.isLoading && !q.data) return <MetricsSkeleton />;
  // Sem permissão de métricas ou erro: cai para os contadores do detalhe (não quebra).
  const m = q.data;

  if (!m) return <CountersFallback campaign={campaign} />;

  // P7: campanhas ainda não iniciadas NÃO mostram barra/percentual (seria enganoso).
  const notStarted = campaign.status === "DRAFT" || campaign.status === "SCHEDULED";
  const eta = etaDisplay(campaign.status, m);
  const tone: ProgressTone =
    campaign.status === "COMPLETED"
      ? "success"
      : campaign.status === "COMPLETED_WITH_ERRORS" || m.failed > 0
        ? "warning"
        : "brand";

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Progresso</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {notStarted ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-body2 text-ink-2">
                {campaign.status === "SCHEDULED" ? "Aguardando envio" : "Não iniciado"}
              </span>
              <span className="text-body2 text-ink-3">{m.eligible} elegíveis</span>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between gap-2">
                <span className="text-body2 text-ink">
                  {m.processed} de {m.eligible} processados
                </span>
                <span className="font-display text-h3 font-bold text-ink">
                  {formatPercent(m.progressPercentage)}
                </span>
              </div>
              <Progress value={m.progressPercentage} tone={tone} label="Progresso da campanha" />
              <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-small sm:grid-cols-3">
                <Stat label={eta.label} value={eta.value} />
                <Stat label="Início" value={formatDateTime(m.startedAt, campaign.timezone)} />
                <Stat
                  label="Conclusão"
                  value={
                    m.completedAt
                      ? formatDateTime(m.completedAt, campaign.timezone)
                      : m.remainingSeconds != null
                        ? `~ ${formatDuration(m.remainingSeconds)}`
                        : "—"
                  }
                />
              </dl>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          metric={{ id: "sent", label: "Enviadas", value: String(m.sent) }}
        />
        <MetricCard
          metric={{
            id: "delivered",
            label: "Entregues",
            value: String(m.delivered),
            hint: `Taxa de entrega: ${formatRate(m.deliveryRate)} dos enviados`,
          }}
        />
        <MetricCard
          metric={{
            id: "read",
            label: "Lidas",
            value: String(m.read),
            hint: `Taxa de leitura: ${formatRate(m.readRate)} dos entregues`,
          }}
        />
        <MetricCard metric={{ id: "failed", label: "Falhas", value: String(m.failed) }} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Pendentes" value={m.pending} />
        <MiniStat label="Enfileiradas" value={m.queued} />
        <MiniStat label="Canceladas" value={m.canceled} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-3">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-3">
      <p className="text-caption uppercase tracking-wide text-ink-3">{label}</p>
      <p className="mt-1 text-h4 font-semibold text-ink">{value}</p>
    </Card>
  );
}

/** Fallback aos contadores do detalhe quando as métricas não estão disponíveis. */
function CountersFallback({ campaign }: { campaign: ApiCampaign }) {
  const c = campaign.counters;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <MetricCard metric={{ id: "sent", label: "Enviadas", value: String(c.sent) }} />
      <MetricCard metric={{ id: "delivered", label: "Entregues", value: String(c.delivered) }} />
      <MetricCard metric={{ id: "read", label: "Lidas", value: String(c.read) }} />
      <MetricCard metric={{ id: "failed", label: "Falhas", value: String(c.failed) }} />
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export type { ApiCampaignMetrics };
