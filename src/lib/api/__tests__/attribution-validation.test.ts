import { describe, it, expect } from "vitest";
import {
  parseCampaignAttributionsQuery,
  parseCreateAttributionBody,
  parseCreateLeadSourceBody,
  parseLeadSourceListQuery,
  parseUpdateAttributionBody,
  parseUpdateLeadSourceBody,
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

describe("parseLeadSourceListQuery", () => {
  it("aceita os filtros do contrato", () => {
    expect(parseLeadSourceListQuery({ active: "true", kind: "REFERRAL" })).toMatchObject({
      active: "true",
      kind: "REFERRAL",
    });
    expect(parseLeadSourceListQuery({})).toEqual({});
  });

  it("rejeita kind fora dos 15 reais", () => {
    expectValidationError(() => parseLeadSourceListQuery({ kind: "INDICACAO" }));
    expectValidationError(() => parseLeadSourceListQuery({ kind: "meta" }));
  });
});

describe("parseCreateLeadSourceBody", () => {
  it("nome é o único obrigatório", () => {
    expect(parseCreateLeadSourceBody({ name: "Indicação de aluno" })).toEqual({
      name: "Indicação de aluno",
    });
    expectValidationError(() => parseCreateLeadSourceBody({}));
    expectValidationError(() => parseCreateLeadSourceBody({ name: "" }));
  });

  it("aceita kind, descrição, active e position", () => {
    expect(
      parseCreateLeadSourceBody({
        name: "X",
        kind: "REFERRAL",
        description: "d",
        active: false,
        position: 3,
      }),
    ).toMatchObject({ kind: "REFERRAL", active: false, position: 3 });
  });

  it("não repassa campos fora do contrato (system é do servidor)", () => {
    expect(parseCreateLeadSourceBody({ name: "X", system: true, leads: 10, cpl: 5 })).toEqual({
      name: "X",
    });
  });
});

describe("parseUpdateLeadSourceBody", () => {
  it("exige ao menos um campo", () => {
    expectValidationError(() => parseUpdateLeadSourceBody({}));
  });

  it("description aceita null para limpar", () => {
    expect(parseUpdateLeadSourceBody({ description: null })).toEqual({ description: null });
  });
});

describe("parseCreateAttributionBody", () => {
  it("leadSourceId é o único obrigatório — origem funciona sem campanha", () => {
    expect(parseCreateAttributionBody({ leadSourceId: UUID })).toEqual({ leadSourceId: UUID });
    expectValidationError(() => parseCreateAttributionBody({}));
    expectValidationError(() => parseCreateAttributionBody({ leadSourceId: "s1" }));
  });

  it("aceita as 5 UTMs, URLs e capturedAt", () => {
    expect(
      parseCreateAttributionBody({
        leadSourceId: UUID,
        campaignId: UUID,
        utmSource: "instagram",
        utmMedium: "cpc",
        utmCampaign: "black",
        utmTerm: "t",
        utmContent: "c",
        landingUrl: "https://site.com/promo",
        referrerUrl: "https://google.com",
        externalClickId: "gclid",
        capturedAt: ISO,
      }),
    ).toMatchObject({ utmSource: "instagram", landingUrl: "https://site.com/promo" });
  });

  it("rejeita URL que não seja http(s) absoluta", () => {
    for (const landingUrl of [
      "nao-e-url",
      "javascript:alert(1)",
      "data:text/html,x",
      "/relativo",
    ]) {
      expectValidationError(() => parseCreateAttributionBody({ leadSourceId: UUID, landingUrl }));
    }
  });

  it("rejeita data sem offset", () => {
    expectValidationError(() =>
      parseCreateAttributionBody({ leadSourceId: UUID, capturedAt: "2026-08-01" }),
    );
  });

  it("NÃO repassa dado sensível: cookie, IP, user-agent, headers, payload", () => {
    expect(
      parseCreateAttributionBody({
        leadSourceId: UUID,
        cookie: "session=abc",
        ip: "1.2.3.4",
        userAgent: "Mozilla/5.0",
        headers: { authorization: "Bearer x" },
        rawPayload: { tudo: "isso" },
      }),
    ).toEqual({ leadSourceId: UUID });
  });
});

describe("parseUpdateAttributionBody — só o vínculo é corrigível", () => {
  it("aceita corrigir origem, campanha e meio", () => {
    expect(parseUpdateAttributionBody({ leadSourceId: UUID })).toEqual({ leadSourceId: UUID });
    expect(parseUpdateAttributionBody({ campaignId: null })).toEqual({ campaignId: null });
    expect(parseUpdateAttributionBody({ medium: "stories" })).toEqual({ medium: "stories" });
  });

  it("REJEITA editar a captura: UTMs, URLs e capturedAt são imutáveis", () => {
    expectValidationError(() => parseUpdateAttributionBody({ utmSource: "google" }));
    expectValidationError(() => parseUpdateAttributionBody({ utmCampaign: "outra" }));
    expectValidationError(() => parseUpdateAttributionBody({ capturedAt: ISO }));
    expectValidationError(() => parseUpdateAttributionBody({ landingUrl: "https://x.com" }));
    expectValidationError(() => parseUpdateAttributionBody({ dedupeHash: "x" }));
    // um campo válido junto de um imutável também é barrado
    expectValidationError(() => parseUpdateAttributionBody({ medium: "ok", utmSource: "google" }));
  });

  it("exige ao menos um campo", () => {
    expectValidationError(() => parseUpdateAttributionBody({}));
  });
});

describe("parseCampaignAttributionsQuery", () => {
  it("aceita paginação e respeita o teto de 100", () => {
    expect(parseCampaignAttributionsQuery({ page: "2", limit: "20" })).toEqual({
      page: 2,
      limit: 20,
    });
    expectValidationError(() => parseCampaignAttributionsQuery({ limit: "101" }));
  });
});

describe("chaves de query de origens e atribuição", () => {
  it("origens e atribuições vivem sob marketing, sem colidir com CRM", () => {
    expect(queryKeys.marketing.leadSources()).toEqual(["marketing", "lead-sources", {}]);
    expect(queryKeys.marketing.contactAttributions("c1")).toEqual([
      "marketing",
      "attributions",
      "contact",
      "c1",
    ]);
    expect(queryKeys.marketing.campaignAttributions("k1")).toEqual([
      "marketing",
      "attributions",
      "campaign",
      "k1",
      {},
    ]);
    expect(queryKeys.marketing.contactAttributions("c1")[0]).not.toBe("crm");
  });

  it("o prefixo de invalidação cobre contatos e campanhas de uma vez", () => {
    const prefix = marketingInvalidation.allAttributions;
    expect(queryKeys.marketing.contactAttributions("c1").slice(0, 2)).toEqual(prefix);
    expect(queryKeys.marketing.campaignAttributions("k1").slice(0, 2)).toEqual(prefix);
  });

  it("contatos diferentes não compartilham cache", () => {
    expect(queryKeys.marketing.contactAttributions("c1")).not.toEqual(
      queryKeys.marketing.contactAttributions("c2"),
    );
  });

  it("invalidar origens não toca campanhas", () => {
    expect(marketingInvalidation.allLeadSources).toEqual(["marketing", "lead-sources"]);
    expect(marketingInvalidation.allLeadSources).not.toEqual(marketingInvalidation.allCampaigns);
  });
});
