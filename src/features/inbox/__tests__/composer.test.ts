import { describe, expect, it } from "vitest";
import {
  BLOCK_REASON,
  TEXT_LIMIT,
  canSubmit,
  modeBlock,
  noteBlock,
  replyBlock,
} from "@/features/inbox/composer";

const ok = { canSendPerm: true, canSend: true, connectionMessage: "", requiresTemplate: false };

describe("replyBlock (F3)", () => {
  it("livre quando permissão + conexão + sem template", () => {
    expect(replyBlock(ok)).toEqual({ blocked: false });
  });
  it("bloqueia sem permissão de envio", () => {
    expect(replyBlock({ ...ok, canSendPerm: false })).toEqual({
      blocked: true,
      reason: BLOCK_REASON.replyPermission,
    });
  });
  it("bloqueia com conexão indisponível (usa a mensagem da sendability)", () => {
    expect(replyBlock({ ...ok, canSend: false, connectionMessage: "Conexão caiu." })).toEqual({
      blocked: true,
      reason: "Conexão caiu.",
    });
  });
  it("bloqueia quando exige template (fora da janela de 24h)", () => {
    expect(replyBlock({ ...ok, requiresTemplate: true })).toEqual({
      blocked: true,
      reason: BLOCK_REASON.requiresTemplate,
    });
  });
});

describe("noteBlock (F3)", () => {
  it("livre com permissão de nota", () => {
    expect(noteBlock({ canNotePerm: true })).toEqual({ blocked: false });
  });
  it("bloqueia sem permissão de nota", () => {
    expect(noteBlock({ canNotePerm: false })).toEqual({
      blocked: true,
      reason: BLOCK_REASON.notePermission,
    });
  });
  it("nota NÃO é bloqueada por conexão/janela (é interna)", () => {
    // modeBlock em modo note ignora canSend/requiresTemplate.
    expect(
      modeBlock("note", { ...ok, canNotePerm: true, canSend: false, requiresTemplate: true }),
    ).toEqual({ blocked: false });
  });
});

describe("canSubmit (F3)", () => {
  const block = { blocked: false } as const;
  it("true com texto e modo livre", () => {
    expect(canSubmit({ mode: "reply", text: "oi", block, pending: false })).toBe(true);
  });
  it("false com texto vazio/whitespace", () => {
    expect(canSubmit({ mode: "reply", text: "   ", block, pending: false })).toBe(false);
  });
  it("false quando bloqueado", () => {
    expect(
      canSubmit({ mode: "reply", text: "oi", block: { blocked: true, reason: "x" }, pending: false }),
    ).toBe(false);
  });
  it("false acima do limite do modo", () => {
    expect(
      canSubmit({ mode: "note", text: "a".repeat(TEXT_LIMIT.note + 1), block, pending: false }),
    ).toBe(false);
  });
  it("limites: reply 8192, note 8000", () => {
    expect(TEXT_LIMIT.reply).toBe(8192);
    expect(TEXT_LIMIT.note).toBe(8000);
  });
});
