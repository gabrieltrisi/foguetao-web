import { describe, it, expect } from "vitest";
import {
  parseCampaignListQuery,
  parseCreateCampaignBody,
  parseUpdateCampaignBody,
  requireCampaignAction,
  requireUuid,
} from "@/lib/api/validation";
import { queryKeys, marketingInvalidation } from "@/lib/query/keys";
import { isApiError } from "@/types/api/error";

const UUID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const ISO = "2026-08-01T00:00:00.000Z";

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

describe("parseCampaignListQuery (filtros reais do ListCampaignsQueryDto)", () => {
  it("aceita os filtros do contrato", () => {
    expect(
      parseCampaignListQuery({
        page: "2",
        limit: "20",
        search: "black",
        status: "ACTIVE",
        channel: "META_ADS",
        objective: "SALES",
        ownerUserId: UUID,
        pipelineId: UUID,
        startFrom: ISO,
        endTo: ISO,
        sortBy: "budget",
        sortOrder: "desc",
      }),
    ).toMatchObject({
      page: 2,
      limit: 20,
      status: "ACTIVE",
      channel: "META_ADS",
      sortBy: "budget",
    });
  });

  it("vazio é válido", () => {
    expect(parseCampaignListQuery({})).toEqual({});
  });

  it("rejeita limit acima do teto (100)", () => {
    expectValidationError(() => parseCampaignListQuery({ limit: "101" }));
  });

  it("rejeita enums fora do contrato", () => {
    expectValidationError(() => parseCampaignListQuery({ status: "ativa" }));
    expectValidationError(() => parseCampaignListQuery({ channel: "meta" }));
    expectValidationError(() => parseCampaignListQuery({ objective: "conversao" }));
  });

  it("rejeita sortBy fora da allowlist", () => {
    expectValidationError(() => parseCampaignListQuery({ sortBy: "roas" }));
    expectValidationError(() => parseCampaignListQuery({ sortBy: "spent" }));
  });

  it("rejeita datas sem offset e uuids inválidos", () => {
    expectValidationError(() => parseCampaignListQuery({ startFrom: "2026-08-01" }));
    expectValidationError(() => parseCampaignListQuery({ ownerUserId: "u1" }));
  });
});

describe("parseCreateCampaignBody", () => {
  it("aceita o mínimo do contrato (só nome)", () => {
    expect(parseCreateCampaignBody({ name: "Captação agosto" })).toEqual({
      name: "Captação agosto",
    });
  });

  it("aceita budget como STRING decimal", () => {
    expect(parseCreateCampaignBody({ name: "x", budget: "1500.00" })).toMatchObject({
      budget: "1500.00",
    });
    expect(parseCreateCampaignBody({ name: "x", budget: "0" })).toMatchObject({ budget: "0" });
  });

  it("rejeita budget float ou com mais de 2 casas", () => {
    expectValidationError(() => parseCreateCampaignBody({ name: "x", budget: 1500 }));
    expectValidationError(() => parseCreateCampaignBody({ name: "x", budget: "1500.999" }));
    expectValidationError(() => parseCreateCampaignBody({ name: "x", budget: "-10" }));
  });

  it("nome é obrigatório", () => {
    expectValidationError(() => parseCreateCampaignBody({}));
    expectValidationError(() => parseCreateCampaignBody({ name: "" }));
  });

  it("não aceita status: a campanha nasce em DRAFT", () => {
    expect(parseCreateCampaignBody({ name: "x", status: "ACTIVE" })).toEqual({ name: "x" });
  });

  it("não repassa metadata/config/version — campos que não existem no contrato", () => {
    expect(
      parseCreateCampaignBody({ name: "x", metadata: { a: 1 }, config: {}, expectedVersion: 1 }),
    ).toEqual({ name: "x" });
  });

  it("rejeita métricas de mídia enviadas por engano", () => {
    expect(parseCreateCampaignBody({ name: "x", spent: "10", leads: 5, roas: 2 })).toEqual({
      name: "x",
    });
  });
});

describe("parseUpdateCampaignBody", () => {
  it("aceita null para limpar campos nullable", () => {
    expect(
      parseUpdateCampaignBody({ description: null, budget: null, ownerUserId: null, endAt: null }),
    ).toEqual({ description: null, budget: null, ownerUserId: null, endAt: null });
  });

  it("exige ao menos um campo", () => {
    expectValidationError(() => parseUpdateCampaignBody({}));
  });

  it("não aceita status: mudar de estado é só pelas ações", () => {
    expectValidationError(() => parseUpdateCampaignBody({ status: "ACTIVE" }));
  });

  it("rejeita budget float", () => {
    expectValidationError(() => parseUpdateCampaignBody({ budget: 10.5 }));
  });
});

describe("requireCampaignAction (allowlist das 6 ações reais)", () => {
  it("aceita as ações do contrato", () => {
    for (const a of ["activate", "pause", "complete", "cancel", "archive", "restore"]) {
      expect(requireCampaignAction(a)).toBe(a);
    }
  });

  it("rejeita ação inexistente ou path traversal", () => {
    expectValidationError(() => requireCampaignAction("publish"));
    expectValidationError(() => requireCampaignAction("delete"));
    expectValidationError(() => requireCampaignAction("../metrics"));
  });
});

describe("requireUuid nas rotas de campanha", () => {
  it("aceita uuid e rejeita o resto", () => {
    expect(requireUuid(UUID, "id")).toBe(UUID);
    expectValidationError(() => requireUuid("c1", "id"));
  });
});

describe("chaves de query de marketing", () => {
  it("campanhas têm chave própria e não colidem com outros domínios", () => {
    expect(queryKeys.marketing.campaigns({ page: 1 })).toEqual([
      "marketing",
      "campaigns",
      { page: 1 },
    ]);
    expect(queryKeys.marketing.campaign("c1")).toEqual(["marketing", "campaign", "c1"]);
    expect(queryKeys.marketing.campaigns()[0]).not.toBe("crm");
    expect(queryKeys.marketing.campaigns()[0]).not.toBe("messaging");
    expect(queryKeys.marketing.campaigns()[0]).not.toBe("integrations");
  });

  it("filtros diferentes geram chaves diferentes", () => {
    expect(queryKeys.marketing.campaigns({ status: "ACTIVE" })).not.toEqual(
      queryKeys.marketing.campaigns({ status: "PAUSED" }),
    );
  });

  it("o prefixo de invalidação cobre todas as listas", () => {
    expect(marketingInvalidation.allCampaigns).toEqual(["marketing", "campaigns"]);
    expect(queryKeys.marketing.campaigns({ page: 3 }).slice(0, 2)).toEqual(
      marketingInvalidation.allCampaigns,
    );
  });
});
