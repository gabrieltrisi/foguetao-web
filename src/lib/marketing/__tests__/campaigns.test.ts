import { describe, it, expect } from "vitest";
import {
  CAMPAIGN_CHANNELS,
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_STATUSES,
  availableActions,
  campaignActionLabel,
  canRunAction,
  channelLabel,
  formatBudget,
  formatDate,
  formatPeriod,
  isArchived,
  messageForCampaignError,
  objectiveLabel,
  statusMeta,
  toDateInput,
  toIsoOrNull,
} from "@/lib/marketing/campaigns";
import { ApiError } from "@/types/api/error";
import type { ApiErrorCode } from "@/types/api/error";

describe("enums espelham o contrato", () => {
  it("status, canais e objetivos são os do backend", () => {
    expect(CAMPAIGN_STATUSES).toEqual([
      "DRAFT",
      "SCHEDULED",
      "ACTIVE",
      "PAUSED",
      "COMPLETED",
      "CANCELED",
      "ARCHIVED",
    ]);
    expect(CAMPAIGN_CHANNELS).toHaveLength(11);
    expect(CAMPAIGN_OBJECTIVES).toHaveLength(8);
  });

  it("rótulos desconhecidos caem no próprio valor (nunca quebram a tela)", () => {
    expect(statusMeta("FUTURO").label).toBe("FUTURO");
    expect(channelLabel("FUTURO")).toBe("FUTURO");
    expect(objectiveLabel("FUTURO")).toBe("FUTURO");
  });
});

describe("máquina de estados (espelho do backend)", () => {
  it("DRAFT ativa, agenda, cancela e arquiva — mas não conclui nem restaura", () => {
    expect(canRunAction("DRAFT", "activate")).toBe(true);
    expect(canRunAction("DRAFT", "cancel")).toBe(true);
    expect(canRunAction("DRAFT", "archive")).toBe(true);
    expect(canRunAction("DRAFT", "complete")).toBe(false);
    expect(canRunAction("DRAFT", "restore")).toBe(false);
    expect(canRunAction("DRAFT", "pause")).toBe(false);
  });

  it("ACTIVE pausa, conclui e cancela — não arquiva direto", () => {
    expect(availableActions("ACTIVE")).toEqual(["pause", "complete", "cancel"]);
  });

  it("PAUSED volta a ativar", () => {
    expect(canRunAction("PAUSED", "activate")).toBe(true);
  });

  it("COMPLETED e CANCELED só arquivam", () => {
    expect(availableActions("COMPLETED")).toEqual(["archive"]);
    expect(availableActions("CANCELED")).toEqual(["archive"]);
  });

  it("ARCHIVED só restaura — e restaurar sempre volta para DRAFT", () => {
    expect(availableActions("ARCHIVED")).toEqual(["restore"]);
    expect(canRunAction("ARCHIVED", "activate")).toBe(false);
    expect(canRunAction("ARCHIVED", "pause")).toBe(false);
    expect(isArchived({ status: "ARCHIVED" })).toBe(true);
    expect(isArchived({ status: "DRAFT" })).toBe(false);
  });

  it("status desconhecido não oferece ação nenhuma", () => {
    expect(availableActions("FUTURO")).toEqual([]);
  });

  it("toda ação tem rótulo", () => {
    expect(Object.keys(campaignActionLabel)).toEqual([
      "activate",
      "pause",
      "complete",
      "cancel",
      "archive",
      "restore",
    ]);
  });
});

describe("formatação de orçamento (string decimal, nunca float)", () => {
  it("formata na moeda real do registro", () => {
    expect(formatBudget("1500.00", "BRL")).toContain("1.500,00");
    expect(formatBudget("0", "BRL")).toContain("0,00");
  });

  it("orçamento ausente vira travessão — não zero", () => {
    expect(formatBudget(null, "BRL")).toBe("—");
  });

  it("moeda desconhecida não quebra a tela", () => {
    expect(formatBudget("10.00", "XXY")).toContain("10");
  });

  it("valor não numérico é exibido cru, sem NaN", () => {
    expect(formatBudget("abc", "BRL")).toBe("BRL abc");
  });
});

describe("datas", () => {
  it("formata e trata nulo", () => {
    expect(formatDate("2026-08-01T12:00:00.000Z")).toMatch(/01\/08\/2026/);
    expect(formatDate(null)).toBe("—");
    expect(formatDate("nao-e-data")).toBe("—");
  });

  it("período cobre os quatro casos", () => {
    expect(formatPeriod(null, null)).toBe("—");
    expect(formatPeriod("2026-08-01T00:00:00.000Z", "2026-08-31T00:00:00.000Z")).toContain("–");
    expect(formatPeriod("2026-08-01T00:00:00.000Z", null)).toContain("A partir de");
    expect(formatPeriod(null, "2026-08-31T00:00:00.000Z")).toContain("Até");
  });

  it("input de data vira ISO com offset e volta", () => {
    const iso = toIsoOrNull("2026-08-01");
    expect(iso).toMatch(/Z$/);
    expect(toDateInput(iso)).toBe("2026-08-01");
    expect(toIsoOrNull("")).toBeNull();
    expect(toIsoOrNull("   ")).toBeNull();
    expect(toDateInput(null)).toBe("");
  });
});

describe("mensagens dos ErrorCodes reais de campanha", () => {
  function apiError(code: string, message = "msg") {
    return new ApiError({ statusCode: 409, code: code as ApiErrorCode, message });
  }

  it("mapeia os 6 códigos do domínio", () => {
    expect(messageForCampaignError(apiError("CAMPAIGN_NOT_FOUND"))).toContain("não encontrada");
    expect(messageForCampaignError(apiError("CAMPAIGN_ARCHIVED"))).toContain("arquivada");
    expect(messageForCampaignError(apiError("CAMPAIGN_DATES_INVALID"))).toContain("término");
    expect(messageForCampaignError(apiError("CAMPAIGN_PIPELINE_INVALID"))).toContain("Pipeline");
    expect(messageForCampaignError(apiError("CAMPAIGN_OWNER_INVALID", ""))).toContain(
      "Responsável",
    );
    expect(
      messageForCampaignError(apiError("CAMPAIGN_STATUS_TRANSITION_INVALID", "Transição X→Y")),
    ).toBe("Transição X→Y");
  });

  it("erro desconhecido não vaza detalhe técnico", () => {
    expect(messageForCampaignError(new Error("boom"))).toBe("Não foi possível concluir a ação.");
  });
});
