import { describe, expect, it } from "vitest";
import { campaignStatusMetaOf, formatDateTime, EXCLUSION_LABELS } from "@/lib/campaigns/display";

describe("campaignStatusMetaOf", () => {
  it("mapeia todos os status para rótulo + tom", () => {
    for (const s of [
      "DRAFT",
      "SCHEDULED",
      "PREPARING",
      "SENDING",
      "PAUSED",
      "COMPLETED",
      "COMPLETED_WITH_ERRORS",
      "CANCELED",
    ] as const) {
      const m = campaignStatusMetaOf(s);
      expect(m.label.length).toBeGreaterThan(0);
      expect(["neutral", "info", "success", "warning", "danger"]).toContain(m.tone);
    }
  });

  it("status desconhecido → fallback neutro", () => {
    expect(campaignStatusMetaOf("XPTO").tone).toBe("neutral");
  });
});

describe("formatDateTime", () => {
  it("null → travessão; ISO válido → formatado no fuso", () => {
    expect(formatDateTime(null)).toBe("—");
    const out = formatDateTime("2026-08-10T11:00:00.000Z", "America/Sao_Paulo");
    expect(out).toMatch(/10\/08\/2026/);
    expect(out).toMatch(/08:00/); // -03:00
  });
});

describe("EXCLUSION_LABELS", () => {
  it("cobre os motivos de exclusão", () => {
    for (const r of ["NO_PHONE", "INVALID_PHONE", "OPT_OUT", "SUPPRESSED", "DUPLICATE", "SELF"]) {
      expect(EXCLUSION_LABELS[r]).toBeTruthy();
    }
  });
});
