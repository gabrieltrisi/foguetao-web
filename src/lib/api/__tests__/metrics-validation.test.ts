import { describe, it, expect } from "vitest";
import { parseMetricsSummaryQuery } from "@/lib/api/validation";
import { queryKeys } from "@/lib/query/keys";
import { isApiError } from "@/types/api/error";

const UUID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

function expectValidationError(fn: () => unknown) {
  try {
    fn();
    throw new Error("deveria ter lançado");
  } catch (e) {
    expect(isApiError(e)).toBe(true);
    if (isApiError(e)) {
      expect(e.statusCode).toBe(400);
      expect(e.code).toBe("VALIDATION_ERROR");
    }
  }
}

describe("parseMetricsSummaryQuery (espelha MetricsSummaryQueryDto)", () => {
  it("aceita os três filtros reais", () => {
    expect(
      parseMetricsSummaryQuery({
        pipelineId: UUID,
        from: "2026-07-01T00:00:00.000Z",
        to: "2026-07-16T00:00:00.000Z",
      }),
    ).toMatchObject({ pipelineId: UUID });
  });

  it("vazio é válido (todos opcionais)", () => {
    expect(parseMetricsSummaryQuery({})).toEqual({});
  });

  it("rejeita pipelineId que não é UUID", () => {
    expectValidationError(() => parseMetricsSummaryQuery({ pipelineId: "todos" }));
  });

  it("rejeita datas sem offset", () => {
    expectValidationError(() => parseMetricsSummaryQuery({ from: "2026-07-01" }));
  });

  it("ignora filtros que o contrato não tem (não são repassados)", () => {
    const out = parseMetricsSummaryQuery({ groupBy: "stage", currency: "BRL" });
    expect(out).toEqual({});
  });
});

describe("query key do resumo", () => {
  it("varia por filtro, isolando pipeline e período", () => {
    expect(queryKeys.crm.metricsSummary()).toEqual(["crm", "metrics", "summary", {}]);
    expect(queryKeys.crm.metricsSummary({ pipelineId: "p1" })).toEqual([
      "crm",
      "metrics",
      "summary",
      { pipelineId: "p1" },
    ]);
    expect(queryKeys.crm.metricsSummary({ pipelineId: "p1" })).not.toEqual(
      queryKeys.crm.metricsSummary({ pipelineId: "p2" }),
    );
  });
});
