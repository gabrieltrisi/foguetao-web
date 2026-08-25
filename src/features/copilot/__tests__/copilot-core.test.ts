import { describe, expect, it } from "vitest";
import { buildCopilotContext, type BuildContextInput } from "@/features/copilot/context/build-context";
import { createMockCopilotProvider } from "@/features/copilot/providers/mock-provider";
import type { CopilotContext } from "@/features/copilot/types";

const NOW = new Date("2026-07-28T12:00:00Z");
const provider = createMockCopilotProvider(0); // sem latência nos testes

function ctxWith(over: Partial<BuildContextInput> = {}): CopilotContext {
  return buildCopilotContext({
    conversationId: "c1",
    now: NOW,
    conversation: { status: "OPEN", channel: "WHATSAPP", labels: [{ name: "VIP" }] },
    assigneeName: "Bia",
    messages: [
      { direction: "OUTBOUND", text: "Olá!", createdAt: "2026-07-20T10:00:00Z", visibility: "PUBLIC" },
      { direction: "INBOUND", text: "Quero contratar o plano premium", createdAt: "2026-07-25T09:00:00Z", visibility: "PUBLIC" },
      { direction: "OUTBOUND", text: "nota interna", createdAt: "2026-07-25T09:30:00Z", visibility: "INTERNAL" },
    ],
    contact: { fullName: "Ana Lima", email: "ana@x.com", phone: "+55 11 9", status: "ACTIVE", source: "WHATSAPP" },
    organization: { name: "Acme", industry: "Varejo" },
    deals: [{ title: "Plano Pro", value: "1500.00", currency: "BRL", status: "OPEN", stageId: "s1" }],
    stageById: new Map([["s1", { name: "Proposta enviada", probability: 40 }]]),
    tasks: [{ title: "Retornar ligação", status: "PENDING", priority: "HIGH", dueAt: "2026-07-30T10:00:00Z" }],
    counts: { notes: 2, activities: 5 },
    ...over,
  });
}

describe("buildCopilotContext (F7)", () => {
  it("filtra mensagens públicas (nota interna fora) e mapeia sinais", () => {
    const c = ctxWith();
    expect(c.messages).toHaveLength(2); // a INTERNAL foi filtrada
    expect(c.signals.awaitingReply).toBe(true); // última pública é INBOUND
    expect(c.signals.daysSinceLastInbound).toBe(3); // 25→28
    expect(c.signals.lastInboundAt).toBe("2026-07-25T09:00:00Z");
  });

  it("resolve etapa/probabilidade do negócio pelo stageById", () => {
    const c = ctxWith();
    expect(c.deals[0]).toMatchObject({ stageName: "Proposta enviada", probability: 40 });
    expect(c.counts.deals).toBe(1);
  });

  it("tarefa vencida e atividade futura", () => {
    const overdue = ctxWith({ tasks: [{ title: "X", status: "PENDING", priority: "LOW", dueAt: "2026-07-01T00:00:00Z" }] });
    expect(overdue.signals.hasOverdueTask).toBe(true);
    expect(overdue.signals.hasFutureActivity).toBe(false);
    const future = ctxWith(); // due 07-30 (futuro)
    expect(future.signals.hasFutureActivity).toBe(true);
  });

  it("contexto PARCIAL (sem contato/deal) não quebra", () => {
    const c = buildCopilotContext({ conversationId: "c1", now: NOW });
    expect(c.contact).toBeNull();
    expect(c.deals).toEqual([]);
    expect(c.messages).toEqual([]);
  });
});

describe("MockCopilotProvider (F7) — determinístico", () => {
  it("detecta intenção pela última mensagem do cliente", async () => {
    expect((await provider.detectIntent(ctxWith())).kind).toBe("compra");
    const cancel = ctxWith({ messages: [{ direction: "INBOUND", text: "quero cancelar minha assinatura", createdAt: "2026-07-27T00:00:00Z" }] });
    expect((await provider.detectIntent(cancel)).kind).toBe("cancelamento");
    const sup = ctxWith({ messages: [{ direction: "INBOUND", text: "está dando erro no sistema", createdAt: "2026-07-27T00:00:00Z" }] });
    expect((await provider.detectIntent(sup)).kind).toBe("suporte");
    const fin = ctxWith({ messages: [{ direction: "INBOUND", text: "não recebi o boleto", createdAt: "2026-07-27T00:00:00Z" }] });
    expect((await provider.detectIntent(fin)).kind).toBe("financeiro");
    const none = ctxWith({ messages: [{ direction: "INBOUND", text: "bom dia", createdAt: "2026-07-27T00:00:00Z" }] });
    expect((await provider.detectIntent(none)).kind).toBe("duvida");
  });

  it("resumo determinístico inclui nome, negócio e tarefa", async () => {
    const s = await provider.summarize(ctxWith());
    expect(s.provider).toBe("mock");
    expect(s.text).toContain("Ana Lima");
    expect(s.text).toContain("Proposta enviada");
    expect(s.text).toContain("Retornar ligação");
    // determinístico: mesma entrada → mesma saída
    expect((await provider.summarize(ctxWith())).text).toBe(s.text);
  });

  it("sugestões conforme a intenção (personaliza com o nome)", async () => {
    const sug = await provider.suggestReplies(ctxWith());
    expect(sug.length).toBeGreaterThanOrEqual(2);
    expect(sug[0].text).toContain("Ana"); // 1ª personalizada
    expect(sug.some((x) => x.text.toLowerCase().includes("proposta"))).toBe(true); // intenção compra
  });

  it("próxima ação: cliente aguardando → responder", async () => {
    const a = await provider.suggestNextAction(ctxWith());
    expect(a.key).toBe("reply");
  });

  it("riscos: aguardando há 3 dias → risco alto", async () => {
    const r = await provider.detectRisks(ctxWith());
    expect(r.some((x) => x.id === "awaiting" && x.severity === "high")).toBe(true);
  });
});
