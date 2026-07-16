import { formatNumber } from "@/lib/format";
import { isApiError } from "@/types/api/error";
import type { ApiMetricsSummary, ApiStatusBucket, MetricsFilters } from "@/types/api/crm-metrics";
import type { ApiStage } from "@/types/api/crm-deals";
import type { FunnelStage, Metric, PeriodValue, PerformanceKpi } from "@/types";

/**
 * Derivações do resumo comercial.
 *
 * Regra desta camada: NADA que não venha do contrato. `GET /metrics/summary`
 * não devolve comparação entre períodos nem valor por etapa, então não há
 * delta/tendência nem valor no funil — os campos ficam ausentes em vez de
 * inventados. Os totais são POR MOEDA: o backend soma por moeda e converter
 * seria arbitrar câmbio.
 */

/* ---------- Período ---------- */

/**
 * Converte o período da UI na janela real do contrato (`from`/`to` ISO, sobre
 * `createdAt`). "custom" ainda não tem seletor de datas: sem intervalo definido,
 * não envia janela — melhor mostrar tudo do que inventar um recorte.
 */
export function periodToRange(period: PeriodValue, now: Date = new Date()): MetricsFilters {
  const to = now.toISOString();

  switch (period) {
    case "hoje": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to };
    }
    case "7d":
      return { from: daysAgo(now, 7).toISOString(), to };
    case "30d":
      return { from: daysAgo(now, 30).toISOString(), to };
    case "mes": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { from: start.toISOString(), to };
    }
    case "custom":
    default:
      return {};
  }
}

function daysAgo(now: Date, days: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const periodLabel: Record<PeriodValue, string> = {
  hoje: "hoje",
  "7d": "nos últimos 7 dias",
  "30d": "nos últimos 30 dias",
  mes: "neste mês",
  custom: "em todo o período",
};

/* ---------- Moeda ---------- */

/**
 * Formata um valor monetário do contrato (string decimal + código da moeda).
 * Usa a moeda REAL devolvida pelo backend — nunca assume BRL.
 */
export function formatMoneyValue(totalValue: string, currency: string): string {
  const num = Number(totalValue);
  if (!Number.isFinite(num)) return `${currency} ${totalValue}`;
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    // moeda fora do padrão ISO → degrada para "CODIGO 1.234,56"
    return `${currency} ${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(num)}`;
  }
}

/**
 * Resume um bucket por moeda em texto. Sem moedas → "—". Uma moeda → o valor.
 * Várias moedas → todas, separadas por " · " (não somamos moedas diferentes).
 */
export function formatBucketValue(bucket: ApiStatusBucket): string {
  if (bucket.byCurrency.length === 0) return "—";
  return bucket.byCurrency.map((c) => formatMoneyValue(c.totalValue, c.currency)).join(" · ");
}

/** Percentual do contrato (0–100, 2 casas) para exibição. */
export function formatWinRate(winRate: number): string {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(winRate)}%`;
}

/* ---------- KPIs ---------- */

/**
 * KPIs do dashboard, exclusivamente de `/metrics/summary`. Sem `deltaPercent`
 * e sem `trend`: o contrato não compara períodos.
 */
export function buildMetrics(summary: ApiMetricsSummary): Metric[] {
  return [
    {
      id: "abertas",
      label: "Oportunidades abertas",
      value: formatNumber(summary.open.count),
      hint: "Oportunidades em aberto no escopo selecionado.",
    },
    {
      id: "ganhas",
      label: "Oportunidades ganhas",
      value: formatNumber(summary.won.count),
      hint: "Oportunidades marcadas como ganhas.",
    },
    {
      id: "perdidas",
      label: "Oportunidades perdidas",
      value: formatNumber(summary.lost.count),
      hint: "Oportunidades marcadas como perdidas.",
    },
    {
      id: "win-rate",
      label: "Win rate",
      value: formatWinRate(summary.winRate),
      hint: "Ganhas sobre o total de fechadas (ganhas + perdidas). Calculado pelo backend.",
    },
  ];
}

/**
 * Painel de performance: os VALORES por status, já distribuídos por moeda.
 * Sem `delta`/`trend` — o contrato não os fornece.
 */
export function buildPerformanceKpis(summary: ApiMetricsSummary): PerformanceKpi[] {
  return [
    { id: "valor-aberto", label: "Valor em aberto", value: formatBucketValue(summary.open) },
    { id: "valor-ganho", label: "Valor ganho", value: formatBucketValue(summary.won) },
    { id: "valor-perdido", label: "Valor perdido", value: formatBucketValue(summary.lost) },
  ];
}

/* ---------- Funil ---------- */

/**
 * Funil real: `byStage` (só deals OPEN) resolvido contra as etapas do pipeline.
 *
 * - A ordem é a das ETAPAS (`position`), não a do agrupamento.
 * - Etapa sem deals aparece com 0 — some do `byStage`, mas existe no funil.
 * - Só etapas OPEN: `byStage` nunca traz WON/LOST.
 * - Sem `amount`: não há valor por etapa no contrato.
 */
export function buildFunnel(
  summary: ApiMetricsSummary,
  stages: readonly ApiStage[],
): FunnelStage[] {
  const countByStage = new Map(summary.byStage.map((s) => [s.stageId, s.count]));
  return stages
    .filter((s) => s.category === "OPEN" && s.active)
    .map((s) => ({ id: s.id, label: s.name, count: countByStage.get(s.id) ?? 0 }));
}

/** O funil só é "vazio" quando nenhuma etapa tem oportunidade. */
export function isFunnelEmpty(funnel: readonly FunnelStage[]): boolean {
  return funnel.every((s) => s.count === 0);
}

/** Empresa/escopo sem nenhum dado comercial. */
export function isSummaryEmpty(summary: ApiMetricsSummary): boolean {
  return summary.open.count === 0 && summary.won.count === 0 && summary.lost.count === 0;
}

/* ---------- Erros ---------- */

export function messageForMetricsError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "INSUFFICIENT_PERMISSION":
      case "INSUFFICIENT_ROLE":
        return "Você não tem permissão para ver as métricas comerciais.";
      case "COMPANY_CONTEXT_REQUIRED":
        return "Nenhuma empresa ativa selecionada.";
      case "VALIDATION_ERROR":
        return error.message || "Filtro inválido.";
      default:
        if (error.isForbidden) return "Você não tem permissão para ver as métricas comerciais.";
        if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
        return error.message;
    }
  }
  return "Não foi possível carregar as métricas.";
}
