import { describe, it, expect } from "vitest";
import {
  pipelineSchema,
  pipelineListSchema,
  pipelineSetupResponseSchema,
  stageSchema,
  stageListSchema,
  stageCategorySchema,
  pipelineSetupModeSchema,
} from "@/types/api/crm-deals";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
import { apiErrorFromResponse } from "@/types/api/error";

const pipeline = {
  id: "p1",
  companyId: "c1",
  name: "Funil de vendas",
  normalizedName: "funil de vendas",
  description: null,
  isDefault: true,
  active: true,
  createdAt: "2026-07-14T00:00:00.000Z",
  updatedAt: "2026-07-14T00:00:00.000Z",
  deletedAt: null,
};

const stage = {
  id: "s1",
  companyId: "c1",
  pipelineId: "p1",
  name: "Novo lead",
  normalizedName: "novo lead",
  description: null,
  color: null,
  position: 0,
  probability: 10,
  category: "OPEN",
  active: true,
  createdAt: "2026-07-14T00:00:00.000Z",
  updatedAt: "2026-07-14T00:00:00.000Z",
  deletedAt: null,
};

describe("schemas de pipelines/etapas", () => {
  it("valida pipeline (modelo cru, campos extras preservados)", () => {
    const p = pipelineSchema.parse(pipeline);
    expect(p.isDefault).toBe(true);
    expect(p.name).toBe("Funil de vendas");
  });

  it("valida lista paginada de pipelines", () => {
    const list = pipelineListSchema.parse({ items: [pipeline], page: 1, limit: 20, total: 1, totalPages: 1 });
    expect(list.items).toHaveLength(1);
  });

  it("valida etapa e rejeita categoria inválida", () => {
    expect(stageSchema.parse(stage).category).toBe("OPEN");
    expect(() => stageSchema.parse({ ...stage, category: "FOO" })).toThrow();
    expect(stageListSchema.parse([stage])).toHaveLength(1);
  });

  it("enums de categoria e setupMode", () => {
    expect(stageCategorySchema.options).toEqual(["OPEN", "WON", "LOST"]);
    expect(pipelineSetupModeSchema.options).toEqual(["STANDARD", "CUSTOM", "EMPTY"]);
  });

  it("valida PipelineSetupResponse (EMPTY incompleto)", () => {
    const r = pipelineSetupResponseSchema.parse({
      id: "p2",
      name: "Vazio",
      description: null,
      isDefault: false,
      active: true,
      createdAt: "x",
      updatedAt: "x",
      setupMode: "EMPTY",
      setupComplete: false,
      missingRequirements: ["OPEN_STAGE", "WON_STAGE", "LOST_STAGE"],
      stages: [],
    });
    expect(r.setupComplete).toBe(false);
    expect(r.missingRequirements).toContain("WON_STAGE");
    expect(r.stages).toEqual([]);
  });

  it("valida PipelineSetupResponse (STANDARD completo com etapas)", () => {
    const r = pipelineSetupResponseSchema.parse({
      id: "p3",
      name: "Padrão",
      description: null,
      isDefault: false,
      active: true,
      createdAt: "x",
      updatedAt: "x",
      setupMode: "STANDARD",
      setupComplete: true,
      missingRequirements: [],
      stages: [
        { id: "s1", name: "Aberto", description: null, color: null, position: 0, probability: 30, category: "OPEN", active: true },
      ],
    });
    expect(r.setupComplete).toBe(true);
    expect(r.stages[0].category).toBe("OPEN");
  });
});

describe("query keys de pipelines", () => {
  it("chaves e prefixos de invalidação", () => {
    expect(queryKeys.crm.pipeline("p1")).toEqual(["crm", "pipeline", "p1"]);
    expect(queryKeys.crm.pipelineStages("p1")).toEqual(["crm", "pipeline", "p1", "stages"]);
    expect(crmInvalidation.allPipelines).toEqual(["crm", "pipelines"]);
    // invalidar o pipeline atinge suas etapas (prefixo)
    expect(queryKeys.crm.pipelineStages("p1").slice(0, 3)).toEqual(crmInvalidation.pipeline("p1"));
    // a chave de lista é prefixada por allPipelines
    expect(queryKeys.crm.pipelines({ limit: 50 }).slice(0, 2)).toEqual(crmInvalidation.allPipelines);
  });
});

describe("erros de pipeline/etapa", () => {
  it("mapeia códigos reais do backend", () => {
    expect(apiErrorFromResponse(409, { statusCode: 409, code: "PIPELINE_ALREADY_CONFIGURED", message: "x" }).code).toBe("PIPELINE_ALREADY_CONFIGURED");
    expect(apiErrorFromResponse(409, { statusCode: 409, code: "PIPELINE_SETUP_INCOMPLETE", message: "x" }).statusCode).toBe(409);
    expect(apiErrorFromResponse(409, { statusCode: 409, code: "PIPELINE_HAS_ACTIVE_DEALS", message: "x" }).code).toBe("PIPELINE_HAS_ACTIVE_DEALS");
    expect(apiErrorFromResponse(400, { statusCode: 400, code: "STAGE_REORDER_INVALID", message: "x" }).statusCode).toBe(400);
    expect(apiErrorFromResponse(403, { statusCode: 403, code: "INSUFFICIENT_PERMISSION", message: "x" }).isForbidden).toBe(true);
    expect(apiErrorFromResponse(404, { statusCode: 404, code: "PIPELINE_NOT_FOUND", message: "x" }).statusCode).toBe(404);
  });
});
