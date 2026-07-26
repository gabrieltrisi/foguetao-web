import { describe, expect, it } from "vitest";
import {
  accountLabel,
  etaDisplay,
  formatDuration,
  formatPercent,
  formatRate,
  recipientStatusMetaOf,
  timelineEventLabel,
} from "@/lib/campaigns/display";

describe("accountLabel", () => {
  it("nunca mostra UUID: usa displayName/name + número", () => {
    expect(accountLabel({ displayName: "Loja", phoneNumber: "+55 71 90000-0000" })).toBe(
      "Loja · +55 71 90000-0000",
    );
    expect(accountLabel({ name: "Conta 1", phoneNumber: null })).toBe("Conta 1");
    expect(accountLabel({ phoneNumber: "+55 71 1" })).toBe("Conta de WhatsApp · +55 71 1");
    expect(accountLabel(null)).toBe("—");
  });
});

describe("recipientStatusMetaOf", () => {
  it("mapeia todos os status de destinatário", () => {
    for (const s of [
      "PENDING",
      "EXCLUDED",
      "QUEUED",
      "SENDING",
      "SENT",
      "DELIVERED",
      "READ",
      "FAILED",
      "CANCELED",
    ] as const) {
      const m = recipientStatusMetaOf(s);
      expect(m.label.length).toBeGreaterThan(0);
      expect(["neutral", "info", "success", "warning", "danger"]).toContain(m.tone);
    }
  });
  it("desconhecido → fallback neutro", () => {
    expect(recipientStatusMetaOf("XPTO").tone).toBe("neutral");
  });
});

describe("formatadores de métricas", () => {
  it("formatPercent arredonda e sufixa %", () => {
    expect(formatPercent(44.6)).toBe("45%");
    expect(formatPercent(100)).toBe("100%");
    expect(formatPercent(NaN)).toBe("—");
  });
  it("formatRate: fração 0–1 → %, clampado, sem NaN", () => {
    expect(formatRate(0.8)).toBe("80%");
    expect(formatRate(0)).toBe("0%");
    expect(formatRate(1.5)).toBe("100%");
    expect(formatRate(NaN)).toBe("—");
  });
  it("formatDuration: s/min/h e nulos", () => {
    expect(formatDuration(45)).toBe("45 s");
    expect(formatDuration(120)).toBe("2 min");
    expect(formatDuration(3660)).toBe("1 h 1 min");
    expect(formatDuration(7200)).toBe("2 h");
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration(-5)).toBe("—");
  });
});

describe("etaDisplay", () => {
  const base = { startedAt: null, completedAt: null, remainingSeconds: null };
  it("cancelada/pausada não mostram contagem", () => {
    expect(etaDisplay("CANCELED", base).value).toBe("Cancelada");
    expect(etaDisplay("PAUSED", base).value).toBe("Pausada");
  });
  it("concluída → duração total", () => {
    const out = etaDisplay("COMPLETED", {
      startedAt: "2026-08-01T10:00:00.000Z",
      completedAt: "2026-08-01T10:02:00.000Z",
      remainingSeconds: null,
    });
    expect(out.label).toBe("Duração total");
    expect(out.value).toBe("2 min");
  });
  it("em envio com restante → conclusão estimada; sem dados → Calculando…", () => {
    const withEta = etaDisplay("SENDING", { ...base, remainingSeconds: 90 });
    expect(withEta.label).toBe("Conclusão estimada");
    expect(withEta.value).toBe("1 min"); // formatDuration(90)
    expect(etaDisplay("SENDING", base).value).toBe("Calculando…");
  });
});

describe("timelineEventLabel", () => {
  it("traduz eventos conhecidos e cai para o cru no desconhecido", () => {
    expect(timelineEventLabel("MESSAGE_CAMPAIGN_STARTED")).toBe("Execução iniciada");
    expect(timelineEventLabel("MESSAGE_CAMPAIGN_COMPLETED")).toBe("Processamento concluído");
    expect(timelineEventLabel("WHATEVER")).toBe("WHATEVER");
  });
});
