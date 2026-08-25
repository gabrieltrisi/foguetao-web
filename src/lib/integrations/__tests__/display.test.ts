import { describe, it, expect } from "vitest";
import {
  availabilityMeta,
  connectionStatusMeta,
  catalogCategoryMeta,
  authModeMeta,
  logStatusMeta,
  capabilityLabel,
  formatDateTime,
  formatDuration,
  messageForIntegrationError,
} from "@/lib/integrations/display";
import {
  availabilitySchema,
  integrationStatusSchema,
  catalogCategorySchema,
  catalogAuthModeSchema,
  integrationLogStatusSchema,
  capabilitySchema,
  catalogItemSchema,
  catalogSchema,
  integrationConnectionSchema,
  integrationLogSchema,
  connectionOperationResultSchema,
} from "@/types/api/integrations";
import { ApiError } from "@/types/api/error";

const connection = {
  id: "c1",
  provider: "MOCK",
  category: "CUSTOM",
  name: "Mock 1",
  status: "DRAFT",
  environment: "SANDBOX",
  config: { scenario: "success" },
  implemented: true,
  capabilities: ["CONNECTION_TEST"],
  externalAccountId: null,
  externalAccountName: null,
  lastConnectedAt: null,
  lastSuccessfulAt: null,
  lastFailureAt: null,
  lastErrorCode: null,
  lastErrorMessageSanitized: null,
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

const catalogItem = {
  key: "MOCK",
  provider: "MOCK",
  connectionCategory: "CUSTOM",
  name: "Integração MOCK",
  description: "desc",
  category: "CUSTOM",
  icon: "flask-conical",
  authMode: "NONE",
  docsSummary: "doc",
  limitations: "lim",
  availability: "AVAILABLE",
  implemented: true,
  mock: true,
  connectable: true,
  capabilities: ["CONNECTION_TEST"],
  order: 10,
};

describe("schemas (contrato real do backend)", () => {
  it("aceita a conexão como o backend devolve", () => {
    expect(integrationConnectionSchema.parse(connection)).toMatchObject({ id: "c1" });
  });

  it("credentialsSummary é opcional e nunca traz valor de segredo", () => {
    const parsed = integrationConnectionSchema.parse({
      ...connection,
      credentialsSummary: { total: 1, types: ["API_KEY"], expired: 0, revoked: 0 },
    });
    expect(parsed.credentialsSummary).toEqual({
      total: 1,
      types: ["API_KEY"],
      expired: 0,
      revoked: 0,
    });
    expect(JSON.stringify(parsed)).not.toMatch(/value|secret/i);
  });

  it("rejeita status de conexão fora do enum do backend", () => {
    expect(integrationConnectionSchema.safeParse({ ...connection, status: "PAUSED" }).success).toBe(
      false,
    );
  });

  it("catálogo aceita item sem provider (somente vitrine)", () => {
    const parsed = catalogItemSchema.parse({
      ...catalogItem,
      key: "N8N",
      provider: null,
      connectionCategory: null,
      availability: "COMING_SOON",
      implemented: false,
      mock: false,
      connectable: false,
      capabilities: [],
    });
    expect(parsed.provider).toBeNull();
    expect(parsed.connectable).toBe(false);
  });

  it("catálogo expõe as flags de operação", () => {
    expect(catalogSchema.parse({ items: [catalogItem], enabled: true, mode: "mock" })).toMatchObject(
      { enabled: true, mode: "mock" },
    );
    expect(catalogSchema.safeParse({ items: [], enabled: true, mode: "producao" }).success).toBe(
      false,
    );
  });

  it("connect/disconnect devolvem o resultado da operação, não a conexão", () => {
    expect(connectionOperationResultSchema.parse({ success: true, status: "CONNECTED" })).toEqual({
      success: true,
      status: "CONNECTED",
    });
  });

  it("log aceita os status reais do IntegrationRequestStatus", () => {
    for (const status of ["SUCCESS", "FAILURE", "TIMEOUT", "RATE_LIMITED", "CIRCUIT_OPEN"]) {
      expect(
        integrationLogSchema.safeParse({
          id: "l1",
          provider: "MOCK",
          operation: "TEST_CONNECTION",
          status,
          httpStatus: null,
          durationMs: 12,
          attempt: 1,
          errorCode: null,
          errorMessageSanitized: null,
          createdAt: "2026-07-01T00:00:00.000Z",
        }).success,
      ).toBe(true);
    }
  });

  it("status inexistente no backend é rejeitado no log", () => {
    expect(
      integrationLogSchema.safeParse({
        id: "l1",
        provider: "MOCK",
        operation: "X",
        status: "RETRYING",
        httpStatus: null,
        durationMs: null,
        attempt: 1,
        errorCode: null,
        errorMessageSanitized: null,
        createdAt: "x",
      }).success,
    ).toBe(false);
  });
});

describe("disponibilidade × status (conceitos separados)", () => {
  it("todo valor de availability tem rótulo", () => {
    for (const a of availabilitySchema.options) {
      expect(availabilityMeta[a].label).toBeTruthy();
    }
  });

  it("todo status de conexão tem rótulo", () => {
    for (const s of integrationStatusSchema.options) {
      expect(connectionStatusMeta[s].label).toBeTruthy();
    }
  });

  it("os dois vocabulários não se confundem", () => {
    // "Em breve" é do produto; "Pausada" é da conexão. Nenhum rótulo vaza de um
    // conjunto para o outro.
    const availabilityLabels = availabilitySchema.options.map((a) => availabilityMeta[a].label);
    const statusLabels = integrationStatusSchema.options.map((s) => connectionStatusMeta[s].label);
    expect(availabilityLabels).toContain("Em breve");
    expect(statusLabels).not.toContain("Em breve");
    expect(statusLabels).toContain("Pausada");
    expect(availabilityLabels).not.toContain("Pausada");
  });

  it("pausar mapeia para DISCONNECTED (o backend não tem PAUSED)", () => {
    expect(connectionStatusMeta.DISCONNECTED.label).toBe("Pausada");
    expect(integrationStatusSchema.options).not.toContain("PAUSED");
  });

  it("todas as categorias, modos de auth e status de log têm rótulo", () => {
    for (const c of catalogCategorySchema.options) expect(catalogCategoryMeta[c]).toBeTruthy();
    for (const m of catalogAuthModeSchema.options) expect(authModeMeta[m]).toBeTruthy();
    for (const s of integrationLogStatusSchema.options) expect(logStatusMeta[s].label).toBeTruthy();
  });

  it("toda capability tem rótulo genérico, sem citar fornecedor", () => {
    for (const c of capabilitySchema.options) {
      expect(capabilityLabel[c]).toBeTruthy();
      expect(capabilityLabel[c]).not.toMatch(/whatsapp|meta|google|evolution/i);
    }
  });
});

describe("formatação", () => {
  it("datas nulas viram travessão", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime("lixo")).toBe("—");
    expect(formatDateTime("2026-07-14T12:00:00.000Z")).not.toBe("—");
  });

  it("duração em ms e s", () => {
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration(250)).toBe("250 ms");
    expect(formatDuration(1500)).toBe("1.50 s");
  });
});

describe("erros normalizados do domínio", () => {
  const err = (code: string, statusCode = 400) =>
    new ApiError({ statusCode, code, message: "msg do backend" });

  it("mapeia os códigos reais", () => {
    expect(messageForIntegrationError(err("INTEGRATIONS_DISABLED", 503))).toMatch(/desabilitadas/i);
    expect(messageForIntegrationError(err("INTEGRATION_PROVIDER_DISABLED", 422))).toMatch(
      /desabilitada/i,
    );
    expect(messageForIntegrationError(err("INTEGRATION_PROVIDER_NOT_IMPLEMENTED", 501))).toMatch(
      /não foi implementada/i,
    );
    expect(messageForIntegrationError(err("INTEGRATION_NOT_FOUND", 404))).toMatch(/não encontrada/i);
    expect(messageForIntegrationError(err("INTEGRATION_CIRCUIT_OPEN", 503))).toMatch(/falhas/i);
    expect(messageForIntegrationError(err("INTEGRATION_ALREADY_EXISTS", 409))).toMatch(/já existe/i);
  });

  it("código desconhecido preserva a mensagem do backend (não inventa contrato)", () => {
    expect(messageForIntegrationError(err("ALGO_NOVO"))).toBe("msg do backend");
  });

  it("nunca vaza detalhe interno em erro não-API", () => {
    expect(messageForIntegrationError(new Error("Error: at Object.<anonymous> stack"))).toBe(
      "Não foi possível concluir a ação.",
    );
  });
});
