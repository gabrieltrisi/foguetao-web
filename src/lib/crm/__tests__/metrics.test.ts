import { describe, it, expect } from "vitest";
import {
  buildFunnel,
  buildMetrics,
  buildPerformanceKpis,
  formatBucketValue,
  formatMoneyValue,
  formatWinRate,
  isFunnelEmpty,
  isSummaryEmpty,
  messageForMetricsError,
  periodToRange,
} from "@/lib/crm/metrics";
import { metricsSummarySchema } from "@/types/api/crm-metrics";
import { ApiError } from "@/types/api/error";
import type { ApiMetricsSummary } from "@/types/api/crm-metrics";
import type { ApiStage } from "@/types/api/crm-deals";

const EMPTY_BUCKET = { count: 0, byCurrency: [] };

function summary(over: Partial<ApiMetricsSummary> = {}): ApiMetricsSummary {
  return {
    scope: { pipelineId: null, from: null, to: null },
    open: EMPTY_BUCKET,
    won: EMPTY_BUCKET,
    lost: EMPTY_BUCKET,
    winRate: 0,
    byStage: [],
    ...over,
  };
}

function stage(over: Partial<ApiStage> = {}): ApiStage {
  return {
    id: "s1",
    name: "Novo lead",
    description: null,
    color: null,
    position: 0,
    probability: 10,
    category: "OPEN",
    active: true,
    ...over,
  } as ApiStage;
}

function apiError(statusCode: number, code: string, message = "x") {
  return new ApiError({ statusCode, code, message });
}

describe("schema do resumo (contrato real)", () => {
  it("aceita a resposta exata de GET /metrics/summary", () => {
    const parsed = metricsSummarySchema.parse({
      scope: { pipelineId: "p1", from: "2026-07-01T00:00:00.000Z", to: null },
      open: { count: 2, byCurrency: [{ currency: "BRL", count: 2, totalValue: "1500.00" }] },
      won: { count: 1, byCurrency: [{ currency: "BRL", count: 1, totalValue: "500.00" }] },
      lost: { count: 1, byCurrency: [{ currency: "BRL", count: 1, totalValue: "100.00" }] },
      winRate: 50,
      byStage: [{ stageId: "s1", count: 2 }],
    });
    expect(parsed.winRate).toBe(50);
    expect(parsed.open.byCurrency[0].totalValue).toBe("1500.00");
  });

  it("aceita empresa sem dados (buckets zerados e listas vazias)", () => {
    const parsed = metricsSummarySchema.parse(summary());
    expect(parsed.open.byCurrency).toEqual([]);
    expect(parsed.byStage).toEqual([]);
  });
});

describe("periodToRange (janela real sobre createdAt)", () => {
  const now = new Date("2026-07-16T15:30:00.000Z");

  it("hoje começa à meia-noite local", () => {
    const r = periodToRange("hoje", now);
    expect(r.from).toBeTruthy();
    expect(new Date(r.from!).getTime()).toBeLessThan(now.getTime());
    expect(r.to).toBe(now.toISOString());
  });

  it("7d e 30d recuam a quantidade certa de dias", () => {
    const d7 = new Date(periodToRange("7d", now).from!);
    const d30 = new Date(periodToRange("30d", now).from!);
    expect(Math.round((now.getTime() - d7.getTime()) / 86_400_000)).toBeGreaterThanOrEqual(7);
    expect(d30.getTime()).toBeLessThan(d7.getTime());
  });

  it("mes começa no dia 1", () => {
    expect(new Date(periodToRange("mes", now).from!).getDate()).toBe(1);
  });

  it("custom não envia janela — melhor tudo do que um recorte inventado", () => {
    expect(periodToRange("custom", now)).toEqual({});
  });
});

describe("formatação monetária (por moeda, sem conversão)", () => {
  it("formata usando a moeda REAL do contrato", () => {
    expect(formatMoneyValue("1500.00", "BRL")).toContain("1.500,00");
    expect(formatMoneyValue("1500.00", "USD")).toContain("1.500,00");
  });

  it("degrada sem quebrar quando a moeda não é ISO", () => {
    expect(formatMoneyValue("10.00", "XYZ123")).toContain("XYZ123");
  });

  it("valor não numérico não quebra", () => {
    expect(formatMoneyValue("abc", "BRL")).toBe("BRL abc");
  });

  it("bucket sem moedas vira travessão", () => {
    expect(formatBucketValue(EMPTY_BUCKET)).toBe("—");
  });

  it("MÚLTIPLAS moedas são listadas, nunca somadas", () => {
    const out = formatBucketValue({
      count: 2,
      byCurrency: [
        { currency: "BRL", count: 1, totalValue: "100.00" },
        { currency: "USD", count: 1, totalValue: "50.00" },
      ],
    });
    expect(out).toContain("·");
    expect(out).toContain("100,00");
    expect(out).toContain("50,00");
  });

  it("winRate é exibido como percentual do backend", () => {
    expect(formatWinRate(66.67)).toBe("66,67%");
    expect(formatWinRate(0)).toBe("0%");
  });
});

describe("buildMetrics (KPIs só do contrato)", () => {
  const s = summary({
    open: { count: 5, byCurrency: [] },
    won: { count: 3, byCurrency: [] },
    lost: { count: 1, byCurrency: [] },
    winRate: 75,
  });

  it("expõe abertas, ganhas, perdidas e win rate", () => {
    const m = buildMetrics(s);
    expect(m.map((x) => x.id)).toEqual(["abertas", "ganhas", "perdidas", "win-rate"]);
    expect(m[0].value).toBe("5");
    expect(m[3].value).toBe("75%");
  });

  it("NENHUM KPI tem delta/trend — o contrato não compara períodos", () => {
    for (const m of buildMetrics(s)) {
      expect(m.deltaPercent).toBeUndefined();
      expect(m.trend).toBeUndefined();
    }
  });
});

describe("buildPerformanceKpis (valores por moeda)", () => {
  it("traz valor em aberto, ganho e perdido, sem delta", () => {
    const kpis = buildPerformanceKpis(
      summary({ won: { count: 1, byCurrency: [{ currency: "BRL", count: 1, totalValue: "500.00" }] } }),
    );
    expect(kpis.map((k) => k.id)).toEqual(["valor-aberto", "valor-ganho", "valor-perdido"]);
    expect(kpis[1].value).toContain("500,00");
    expect(kpis[1].delta).toBeUndefined();
  });
});

describe("buildFunnel (byStage + nomes das etapas)", () => {
  const stages = [
    stage({ id: "s1", name: "Novo lead", position: 0 }),
    stage({ id: "s2", name: "Proposta", position: 1 }),
    stage({ id: "won", name: "Ganho", category: "WON", position: 2 }),
    stage({ id: "off", name: "Inativa", active: false, position: 3 }),
  ];

  it("resolve nomes e mantém a ordem das ETAPAS", () => {
    const f = buildFunnel(summary({ byStage: [{ stageId: "s2", count: 3 }] }), stages);
    expect(f.map((s) => s.label)).toEqual(["Novo lead", "Proposta"]);
  });

  it("etapa sem deals aparece com 0 (não some do funil)", () => {
    const f = buildFunnel(summary({ byStage: [{ stageId: "s2", count: 3 }] }), stages);
    expect(f.find((s) => s.id === "s1")!.count).toBe(0);
    expect(f.find((s) => s.id === "s2")!.count).toBe(3);
  });

  it("descarta etapas WON/LOST e inativas — byStage só tem OPEN", () => {
    const ids = buildFunnel(summary(), stages).map((s) => s.id);
    expect(ids).not.toContain("won");
    expect(ids).not.toContain("off");
  });

  it("NÃO inventa valor por etapa (o contrato não tem)", () => {
    for (const s of buildFunnel(summary({ byStage: [{ stageId: "s1", count: 1 }] }), stages)) {
      expect(s.amount).toBeUndefined();
    }
  });

  it("sem etapas, o funil é vazio", () => {
    expect(buildFunnel(summary(), [])).toEqual([]);
  });
});

describe("estados vazios", () => {
  it("funil vazio quando toda etapa está zerada", () => {
    expect(isFunnelEmpty([{ id: "a", label: "A", count: 0 }])).toBe(true);
    expect(isFunnelEmpty([{ id: "a", label: "A", count: 1 }])).toBe(false);
  });

  it("resumo vazio quando não há aberta, ganha nem perdida", () => {
    expect(isSummaryEmpty(summary())).toBe(true);
    expect(isSummaryEmpty(summary({ won: { count: 1, byCurrency: [] } }))).toBe(false);
  });
});

describe("messageForMetricsError", () => {
  it("mapeia permissão negada", () => {
    expect(messageForMetricsError(apiError(403, "INSUFFICIENT_PERMISSION"))).toMatch(/permissão/i);
    expect(messageForMetricsError(apiError(403, "OUTRO"))).toMatch(/permissão/i);
  });

  it("mapeia indisponibilidade e tem fallback", () => {
    expect(messageForMetricsError(apiError(503, "SERVICE_UNAVAILABLE"))).toMatch(/indisponível/i);
    expect(messageForMetricsError(new Error("boom"))).toBeTruthy();
  });
});
