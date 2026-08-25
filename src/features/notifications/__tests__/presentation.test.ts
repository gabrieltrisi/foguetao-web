import { describe, expect, it } from "vitest";
import { priorityMeta, typeMeta } from "../presentation";
import { NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "@/types/api/notifications";

describe("presentation", () => {
  it("mapeia prioridade → tom do Design System", () => {
    expect(priorityMeta("LOW").tone).toBe("neutral");
    expect(priorityMeta("NORMAL").tone).toBe("info");
    expect(priorityMeta("HIGH").tone).toBe("warning");
    expect(priorityMeta("URGENT").tone).toBe("danger");
    expect(priorityMeta("URGENT").label).toBe("Urgente");
  });

  it("cobre todas as prioridades e tipos sem lacuna", () => {
    for (const p of NOTIFICATION_PRIORITIES) {
      expect(priorityMeta(p).label.length).toBeGreaterThan(0);
    }
    for (const t of NOTIFICATION_TYPES) {
      expect(typeMeta(t).label.length).toBeGreaterThan(0);
      expect(typeMeta(t).icon.length).toBeGreaterThan(0);
    }
  });

  it("rotula tipos em pt-BR (incl. INBOX)", () => {
    expect(typeMeta("DEAL").label).toBe("Negócio");
    expect(typeMeta("MEDIA").label).toBe("Arquivos");
    expect(typeMeta("INBOX").label).toBe("Inbox");
  });

  it("é resiliente: tipo desconhecido do backend cai no fallback (não quebra)", () => {
    const meta = typeMeta("UM_TIPO_NOVO_QUALQUER");
    expect(meta.label.length).toBeGreaterThan(0);
    expect(meta.icon.length).toBeGreaterThan(0);
  });
});
