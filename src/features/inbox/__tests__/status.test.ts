import { describe, expect, it } from "vitest";
import { canTransition, statusActions } from "@/features/inbox/status";

describe("status — máquina de estados (F4)", () => {
  it("canTransition espelha o backend", () => {
    expect(canTransition("OPEN", "RESOLVED")).toBe(true);
    expect(canTransition("OPEN", "ARCHIVED")).toBe(true);
    expect(canTransition("RESOLVED", "OPEN")).toBe(true);
    expect(canTransition("ARCHIVED", "OPEN")).toBe(true);
    expect(canTransition("BLOCKED", "OPEN")).toBe(true);
    expect(canTransition("ARCHIVED", "RESOLVED")).toBe(false); // não permitido
    expect(canTransition("OPEN", "OPEN")).toBe(false); // mesmo estado
  });

  it("statusActions(OPEN): Resolver + Arquivar (sem Reabrir)", () => {
    const keys = statusActions("OPEN").map((a) => a.key);
    expect(keys).toEqual(["resolve", "archive"]);
  });

  it("statusActions(RESOLVED): Reabrir + Arquivar (sem Resolver de novo)", () => {
    const keys = statusActions("RESOLVED").map((a) => a.key);
    expect(keys).toEqual(["reopen", "archive"]);
  });

  it("statusActions(ARCHIVED): só Reabrir", () => {
    expect(statusActions("ARCHIVED").map((a) => a.key)).toEqual(["reopen"]);
  });

  it("Resolver/Arquivar pedem confirmação; Reabrir não", () => {
    const byKey = Object.fromEntries(
      [...statusActions("OPEN"), ...statusActions("RESOLVED")].map((a) => [a.key, a]),
    );
    expect(byKey.resolve.confirm).toBe(true);
    expect(byKey.archive.confirm).toBe(true);
    expect(byKey.reopen.confirm).toBe(false);
  });

  it("cada ação carrega a permissão distinta do backend", () => {
    const byKey = Object.fromEntries(
      [...statusActions("OPEN"), ...statusActions("RESOLVED")].map((a) => [a.key, a.permission]),
    );
    expect(byKey.resolve).toBe("messaging.conversations.resolve");
    expect(byKey.reopen).toBe("messaging.conversations.reopen");
    expect(byKey.archive).toBe("messaging.conversations.update");
  });
});
