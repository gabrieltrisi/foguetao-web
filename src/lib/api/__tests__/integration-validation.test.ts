import { describe, it, expect } from "vitest";
import {
  requireUuid,
  requireCatalogKey,
  parseCatalogQuery,
  parseConnectionListQuery,
  parseCreateConnectionBody,
  parseLogListQuery,
  parseUpdateConnectionBody,
} from "@/lib/api/validation";
import { queryKeys, integrationsInvalidation, crmInvalidation } from "@/lib/query/keys";
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

describe("requireCatalogKey", () => {
  it("aceita chaves estáveis do catálogo", () => {
    expect(requireCatalogKey("MOCK")).toBe("MOCK");
    expect(requireCatalogKey("GOOGLE_ANALYTICS_4")).toBe("GOOGLE_ANALYTICS_4");
  });

  it("bloqueia path traversal e formatos arbitrários", () => {
    expectValidationError(() => requireCatalogKey("../../secrets"));
    expectValidationError(() => requireCatalogKey("mock"));
    expectValidationError(() => requireCatalogKey("MOCK; DROP TABLE"));
    expectValidationError(() => requireCatalogKey(""));
    expectValidationError(() => requireCatalogKey("A".repeat(61)));
  });
});

describe("connectionId de rota", () => {
  it("exige UUID antes de chamar o backend", () => {
    expect(requireUuid(UUID, "connectionId")).toBe(UUID);
    expectValidationError(() => requireUuid("conn-1", "connectionId"));
  });
});

describe("parseCreateConnectionBody", () => {
  it("aceita o corpo real de criação", () => {
    expect(
      parseCreateConnectionBody({
        provider: "MOCK",
        category: "CUSTOM",
        name: "Mock 1",
        environment: "SANDBOX",
        config: { scenario: "success" },
      }),
    ).toMatchObject({ provider: "MOCK", name: "Mock 1" });
  });

  it("exige provider, category e name", () => {
    expectValidationError(() => parseCreateConnectionBody({}));
    expectValidationError(() => parseCreateConnectionBody({ provider: "MOCK" }));
    expectValidationError(() =>
      parseCreateConnectionBody({ provider: "MOCK", category: "CUSTOM", name: "   " }),
    );
  });

  it("REJEITA segredo na configuração pública, em qualquer convenção de nome", () => {
    for (const key of [
      // camelCase, snake_case e kebab-case são o mesmo risco
      "apiKey",
      "api_key",
      "api-key",
      "privateKey",
      "private_key",
      "private-key",
      "token",
      "accessToken",
      "refresh_token",
      "clientSecret",
      "password",
      "passwd",
      "webhookSecret",
      "authorization",
      "bearerToken",
      "credential",
      "credentials",
    ]) {
      expectValidationError(() =>
        parseCreateConnectionBody({
          provider: "MOCK",
          category: "CUSTOM",
          name: "x",
          config: { [key]: "sk_live_123" },
        }),
      );
    }
  });

  it("config sem segredo passa", () => {
    expect(
      parseCreateConnectionBody({
        provider: "MOCK",
        category: "CUSTOM",
        name: "x",
        config: { scenario: "timeout", latencyMs: 10 },
      }),
    ).toMatchObject({ config: { scenario: "timeout", latencyMs: 10 } });
  });

  it("environment inválido é rejeitado", () => {
    expectValidationError(() =>
      parseCreateConnectionBody({
        provider: "MOCK",
        category: "CUSTOM",
        name: "x",
        environment: "PROD",
      }),
    );
  });
});

describe("parseUpdateConnectionBody", () => {
  it("aceita nome, ambiente e config", () => {
    expect(parseUpdateConnectionBody({ name: "Novo" })).toEqual({ name: "Novo" });
  });

  it("recusa alterar provider/category (imutáveis no backend)", () => {
    expectValidationError(() => parseUpdateConnectionBody({ provider: "META_ADS" }));
    expectValidationError(() => parseUpdateConnectionBody({ category: "ADVERTISING" }));
  });

  it("recusa companyId vindo do corpo (tenant nunca vem do body)", () => {
    expectValidationError(() => parseUpdateConnectionBody({ companyId: UUID }));
  });

  it("também bloqueia segredo na config", () => {
    expectValidationError(() => parseUpdateConnectionBody({ config: { apiKey: "x" } }));
  });
});

describe("parseCatalogQuery", () => {
  it("aceita os filtros reais", () => {
    expect(parseCatalogQuery({ category: "ADVERTISING", availability: "AVAILABLE", search: "meta" })).toEqual(
      { category: "ADVERTISING", availability: "AVAILABLE", search: "meta" },
    );
  });

  it("rejeita categoria e disponibilidade fora do enum", () => {
    expectValidationError(() => parseCatalogQuery({ category: "NAO_EXISTE" }));
    expectValidationError(() => parseCatalogQuery({ availability: "TALVEZ" }));
  });

  it("ignora vazios e descarta desconhecidos", () => {
    expect(parseCatalogQuery({ search: "", companyId: UUID })).toEqual({});
  });
});

describe("parseConnectionListQuery", () => {
  it("aceita os filtros reais do ListConnectionsQueryDto", () => {
    expect(
      parseConnectionListQuery({
        page: "2",
        limit: "20",
        provider: "MOCK",
        status: "CONNECTED",
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    ).toMatchObject({ page: 2, limit: 20, provider: "MOCK", status: "CONNECTED" });
  });

  it("sortBy respeita a allowlist", () => {
    expectValidationError(() => parseConnectionListQuery({ sortBy: "config" }));
    expectValidationError(() => parseConnectionListQuery({ sortBy: "id; DROP TABLE" }));
  });

  it("rejeita provider e status fora do enum", () => {
    expectValidationError(() => parseConnectionListQuery({ provider: "TELEGRAM" }));
    expectValidationError(() => parseConnectionListQuery({ status: "PAUSED" }));
  });

  it("paginação limitada ao teto do backend", () => {
    expectValidationError(() => parseConnectionListQuery({ limit: "101" }));
    expectValidationError(() => parseConnectionListQuery({ page: "0" }));
    expect(parseConnectionListQuery({ limit: "100" })).toEqual({ limit: 100 });
  });

  it("descarta companyId da query (tenant vem do cookie/sessão)", () => {
    expect(parseConnectionListQuery({ companyId: UUID, page: "1" })).toEqual({ page: 1 });
  });
});

describe("parseLogListQuery", () => {
  it("aceita status e operação", () => {
    expect(parseLogListQuery({ status: "FAILURE", operation: "TEST_CONNECTION" })).toEqual({
      status: "FAILURE",
      operation: "TEST_CONNECTION",
    });
  });

  it("rejeita status inexistente", () => {
    expectValidationError(() => parseLogListQuery({ status: "RETRYING" }));
  });
});

describe("query keys de integrações", () => {
  it("são centralizadas e estáveis", () => {
    expect(queryKeys.integrations.catalog({ category: "ADVERTISING" })).toEqual([
      "integrations",
      "catalog",
      { category: "ADVERTISING" },
    ]);
    expect(queryKeys.integrations.connection("c1")).toEqual(["integrations", "connection", "c1"]);
  });

  it("os logs são subchave da conexão (invalidar a conexão alcança os logs)", () => {
    const logs = queryKeys.integrations.logs("c1", { page: 1 });
    expect(logs.slice(0, 3)).toEqual([...integrationsInvalidation.connection("c1")]);
    expect(logs.slice(0, 4)).toEqual([...integrationsInvalidation.logs("c1")]);
  });

  it("prefixos de invalidação alcançam as listas", () => {
    expect(queryKeys.integrations.connections({ page: 3 }).slice(0, 2)).toEqual([
      ...integrationsInvalidation.allConnections,
    ]);
    expect(queryKeys.integrations.catalog().slice(0, 2)).toEqual([
      ...integrationsInvalidation.allCatalog,
    ]);
  });

  it("NUNCA colidem com o CRM: invalidar integrações não toca deals/tarefas", () => {
    for (const crmKey of [
      crmInvalidation.allDeals,
      crmInvalidation.allTasks,
      crmInvalidation.allContacts,
      crmInvalidation.allPipelines,
    ]) {
      expect(crmKey[0]).toBe("crm");
      expect(integrationsInvalidation.allConnections[0]).toBe("integrations");
      expect(crmKey[0]).not.toBe(integrationsInvalidation.allConnections[0]);
    }
  });
});
