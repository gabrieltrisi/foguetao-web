import { describe, expect, it } from "vitest";
import { SeenEventCache, shouldPoll } from "@/lib/messaging/realtime-connection";

describe("SeenEventCache (dedup por eventId)", () => {
  it("add retorna true na 1ª vez e false em duplicatas", () => {
    const c = new SeenEventCache(10);
    expect(c.add("e1")).toBe(true);
    expect(c.add("e1")).toBe(false);
    expect(c.add("e2")).toBe(true);
    expect(c.has("e1")).toBe(true);
    expect(c.size).toBe(2);
  });

  it("é FIFO limitado — descarta o mais antigo ao exceder max (sem crescer infinito)", () => {
    const c = new SeenEventCache(3);
    c.add("a");
    c.add("b");
    c.add("c");
    c.add("d"); // evita 'a'
    expect(c.size).toBe(3);
    expect(c.has("a")).toBe(false);
    expect(c.has("d")).toBe(true);
    // 'a' voltou a ser "novo" (foi despejado) — aceitável para janela limitada.
    expect(c.add("a")).toBe(true);
  });
});

describe("shouldPoll (gating do fallback)", () => {
  it("polla só quando o stream NÃO está saudável", () => {
    expect(shouldPoll("connecting")).toBe(true);
    expect(shouldPoll("reconnecting")).toBe(true);
    expect(shouldPoll("error")).toBe(true);
    expect(shouldPoll("connected")).toBe(false);
    expect(shouldPoll("offline")).toBe(false);
    expect(shouldPoll("idle")).toBe(false);
  });
});
