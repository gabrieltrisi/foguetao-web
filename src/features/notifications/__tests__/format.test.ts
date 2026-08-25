import { describe, expect, it } from "vitest";
import { formatNotificationTime, fullNotificationTimestamp } from "../format";

const NOW = new Date("2026-07-28T12:00:00Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatNotificationTime", () => {
  it("mostra 'agora' para menos de 45s", () => {
    expect(formatNotificationTime(ago(10 * SEC), NOW)).toBe("agora");
  });

  it("mostra minutos e horas", () => {
    expect(formatNotificationTime(ago(5 * MIN), NOW)).toBe("há 5 min");
    expect(formatNotificationTime(ago(3 * HOUR), NOW)).toBe("há 3 h");
  });

  it("mostra 'ontem' e dias", () => {
    expect(formatNotificationTime(ago(1 * DAY), NOW)).toBe("ontem");
    expect(formatNotificationTime(ago(3 * DAY), NOW)).toBe("há 3 dias");
  });

  it("cai para data absoluta a partir de 7 dias", () => {
    const out = formatNotificationTime(ago(10 * DAY), NOW);
    expect(out).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("é tolerante a nulo/inválido", () => {
    expect(formatNotificationTime(null, NOW)).toBe("");
    expect(formatNotificationTime("não-é-data", NOW)).toBe("");
    expect(fullNotificationTimestamp(null)).toBe("");
  });
});
