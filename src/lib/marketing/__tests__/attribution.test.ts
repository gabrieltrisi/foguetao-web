import { describe, it, expect } from "vitest";
import {
  LEAD_SOURCE_KINDS,
  UTM_KEYS,
  buildUtmUrl,
  filledUtms,
  formatCapturedAt,
  hasUtms,
  kindLabel,
  messageForAttributionError,
  slugifyUtm,
  touchpointOriginLabel,
} from "@/lib/marketing/attribution";
import { ApiError } from "@/types/api/error";
import type { ApiErrorCode } from "@/types/api/error";
import type { ApiAttribution } from "@/types/api/marketing";

describe("enums espelham o contrato", () => {
  it("os 15 kinds do backend", () => {
    expect(LEAD_SOURCE_KINDS).toHaveLength(15);
    expect(LEAD_SOURCE_KINDS).toContain("INSTAGRAM");
    expect(LEAD_SOURCE_KINDS).toContain("REFERRAL");
    expect(LEAD_SOURCE_KINDS).toContain("OTHER");
  });

  it("kind desconhecido cai no próprio valor (não quebra a tela)", () => {
    expect(kindLabel("FUTURO")).toBe("FUTURO");
    expect(kindLabel("REFERRAL")).toBe("Indicação");
  });

  it("os dois touchpoint origins reais", () => {
    expect(Object.keys(touchpointOriginLabel)).toEqual(["MANUAL", "API"]);
  });

  it("os 5 parâmetros UTM padrão — nem um a mais", () => {
    expect(UTM_KEYS).toEqual(["source", "medium", "campaign", "term", "content"]);
  });
});

describe("slugifyUtm", () => {
  it("normaliza para minúscula, sem acento e sem espaço", () => {
    expect(slugifyUtm("  Black Friday  ")).toBe("black-friday");
    expect(slugifyUtm("Promoção Início")).toBe("promocao-inicio");
    expect(slugifyUtm("CPC")).toBe("cpc");
  });

  it("remove caractere que quebraria a URL", () => {
    expect(slugifyUtm("a&b=c?d#e")).toBe("abcde");
    expect(slugifyUtm("café/açaí")).toBe("cafeacai");
  });

  it("preserva o que é válido em UTM", () => {
    expect(slugifyUtm("black_week-2026.v1")).toBe("black_week-2026.v1");
  });

  it("vazio continua vazio", () => {
    expect(slugifyUtm("   ")).toBe("");
  });
});

describe("buildUtmUrl — serialização da URL final", () => {
  const empty = { source: "", medium: "", campaign: "", term: "", content: "" };

  it("monta a URL com os parâmetros preenchidos", () => {
    const url = buildUtmUrl("https://site.com/promo", {
      ...empty,
      source: "Instagram",
      medium: "Stories",
      campaign: "Black Week",
    });
    expect(url).toBe(
      "https://site.com/promo?utm_source=instagram&utm_medium=stories&utm_campaign=black-week",
    );
  });

  it("omite os parâmetros vazios (não gera utm_term=)", () => {
    const url = buildUtmUrl("https://site.com", { ...empty, source: "google" });
    expect(url).toBe("https://site.com/?utm_source=google");
    expect(url).not.toContain("utm_term");
    expect(url).not.toContain("utm_content");
  });

  it("PRESERVA a query que já existe na URL base", () => {
    const url = buildUtmUrl("https://site.com/promo?plano=anual", { ...empty, source: "google" });
    expect(url).toContain("plano=anual");
    expect(url).toContain("utm_source=google");
  });

  it("substitui uma UTM já presente na base em vez de duplicar", () => {
    const url = buildUtmUrl("https://site.com?utm_source=antigo", { ...empty, source: "novo" });
    expect(url).toContain("utm_source=novo");
    expect(url).not.toContain("antigo");
    expect(url.match(/utm_source/g)).toHaveLength(1);
  });

  it("mantém o fragmento no fim, depois da query", () => {
    const url = buildUtmUrl("https://site.com/promo#planos", { ...empty, source: "ig" });
    expect(url).toBe("https://site.com/promo?utm_source=ig#planos");
  });

  it("URL base inválida devolve string vazia (a UI mostra o erro)", () => {
    expect(buildUtmUrl("nao-e-url", { ...empty, source: "ig" })).toBe("");
    expect(buildUtmUrl("", empty)).toBe("");
    expect(buildUtmUrl("   ", empty)).toBe("");
  });

  it("recusa protocolo que não seja http(s)", () => {
    expect(buildUtmUrl("javascript:alert(1)", empty)).toBe("");
    expect(buildUtmUrl("data:text/html,x", empty)).toBe("");
    expect(buildUtmUrl("ftp://site.com", empty)).toBe("");
  });
});

function attribution(over: Partial<ApiAttribution> = {}): ApiAttribution {
  return {
    id: "a1",
    contactId: "c1",
    leadSource: {
      id: "s1",
      name: "Indicação",
      kind: "REFERRAL",
      description: null,
      active: true,
      position: 0,
      system: false,
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    },
    campaign: null,
    medium: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
    referrerUrl: null,
    landingUrl: null,
    externalClickId: null,
    touchpointOrigin: "MANUAL",
    capturedAt: "2026-08-01T10:00:00.000Z",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    ...over,
  };
}

describe("filledUtms", () => {
  it("lista só as UTMs preenchidas, na ordem do padrão", () => {
    const a = attribution({ utmSource: "instagram", utmCampaign: "black-week" });
    expect(filledUtms(a)).toEqual([
      { label: "utm_source", value: "instagram" },
      { label: "utm_campaign", value: "black-week" },
    ]);
    expect(hasUtms(a)).toBe(true);
  });

  it("atribuição sem UTM não gera linha vazia", () => {
    expect(filledUtms(attribution())).toEqual([]);
    expect(hasUtms(attribution())).toBe(false);
  });
});

describe("formatCapturedAt", () => {
  it("formata data e hora", () => {
    expect(formatCapturedAt("2026-08-01T10:00:00.000Z")).toMatch(/01\/08\/2026/);
  });

  it("data inválida não vira 'Invalid Date' na tela", () => {
    expect(formatCapturedAt("nao-e-data")).toBe("—");
  });
});

describe("mensagens dos ErrorCodes reais", () => {
  function apiError(code: string, message = "msg", statusCode = 409) {
    return new ApiError({ statusCode, code: code as ApiErrorCode, message });
  }

  it("mapeia os códigos do domínio de origem/atribuição", () => {
    expect(messageForAttributionError(apiError("LEAD_SOURCE_NOT_FOUND"))).toContain(
      "não encontrada",
    );
    expect(messageForAttributionError(apiError("LEAD_SOURCE_NAME_ALREADY_EXISTS"))).toContain(
      "este nome",
    );
    expect(messageForAttributionError(apiError("LEAD_SOURCE_INACTIVE"))).toContain("inativa");
    expect(messageForAttributionError(apiError("LEAD_SOURCE_SYSTEM_READONLY"))).toContain("padrão");
    expect(messageForAttributionError(apiError("ATTRIBUTION_NOT_FOUND"))).toContain(
      "não encontrada",
    );
    expect(messageForAttributionError(apiError("CAMPAIGN_ARCHIVED"))).toContain("arquivada");
  });

  it("preserva a mensagem do backend quando ela explica o motivo", () => {
    expect(
      messageForAttributionError(
        apiError("LEAD_SOURCE_IN_USE", "Origem usada por 3 atribuição(ões)"),
      ),
    ).toBe("Origem usada por 3 atribuição(ões)");
  });

  it("erro desconhecido não vaza detalhe técnico", () => {
    expect(messageForAttributionError(new Error("boom"))).toBe("Não foi possível concluir a ação.");
  });
});
