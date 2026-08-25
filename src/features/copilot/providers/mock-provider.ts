import type {
  CopilotContext,
  CopilotIntent,
  CopilotIntentKind,
  CopilotNextAction,
  CopilotProvider,
  CopilotRisk,
  CopilotSuggestion,
  CopilotSummary,
} from "@/features/copilot/types";

/**
 * Provedor MOCK (F7) — DETERMINÍSTICO, baseado em regras sobre o `CopilotContext`. Sem
 * IA, sem rede, sem aleatoriedade. Implementa a MESMA interface que um provedor real
 * (OpenAI/Anthropic/…) implementará depois → trocar não muda a UI. Latência SIMULADA
 * opcional (`delayMs`) para exercitar os estados de loading.
 */

const firstName = (name?: string | null) => (name ? name.split(/\s+/)[0] : null);
const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);

function lastInboundText(ctx: CopilotContext): string {
  const m = [...ctx.messages].reverse().find((x) => x.direction === "INBOUND");
  return (m?.text ?? "").toLowerCase();
}

const INTENT_RULES: {
  kind: CopilotIntentKind;
  label: string;
  description: string;
  keywords: string[];
  confidence: number;
}[] = [
  { kind: "cancelamento", label: "Cancelamento", description: "Cliente sinaliza cancelamento ou desistência.", keywords: ["cancel", "encerrar", "desistir", "não quero mais", "descontinuar"], confidence: 0.86 },
  { kind: "financeiro", label: "Financeiro", description: "Assunto financeiro (pagamento, cobrança ou nota).", keywords: ["boleto", "fatura", "pagamento", "cobrança", "nota fiscal", "reembolso", "financeiro", "pix"], confidence: 0.8 },
  { kind: "suporte", label: "Suporte", description: "Cliente relata um problema e precisa de ajuda.", keywords: ["erro", "problema", "não funciona", "bug", "suporte", "ajuda", "travou", "defeito", "reclamação"], confidence: 0.8 },
  { kind: "compra", label: "Compra", description: "Cliente demonstra interesse em comprar/contratar.", keywords: ["comprar", "preço", "plano", "premium", "proposta", "contratar", "valor", "orçamento", "assinar", "upgrade"], confidence: 0.82 },
];

function detectIntentSync(ctx: CopilotContext): CopilotIntent {
  const text = lastInboundText(ctx);
  if (text) {
    for (const rule of INTENT_RULES) {
      if (rule.keywords.some((k) => text.includes(k))) {
        return { kind: rule.kind, label: rule.label, description: rule.description, confidence: rule.confidence };
      }
    }
    return { kind: "duvida", label: "Dúvida", description: "Dúvida geral — intenção não clara.", confidence: 0.5 };
  }
  return { kind: "duvida", label: "Dúvida", description: "Sem mensagem recente do cliente.", confidence: 0.4 };
}

const SUGGESTIONS: Record<CopilotIntentKind, string[]> = {
  compra: [
    "Posso te enviar agora a proposta do plano premium?",
    "Quer que eu detalhe os valores e as condições?",
    "Consigo agendar uma call rápida para alinharmos os detalhes.",
  ],
  suporte: [
    "Sinto muito pelo transtorno. Pode me dar mais detalhes do que aconteceu?",
    "Vou verificar isso para você agora mesmo.",
    "Consegue me enviar um print ou o passo a passo do erro?",
  ],
  financeiro: [
    "Posso reenviar o boleto/fatura por aqui mesmo?",
    "Vou checar o status do pagamento e já te retorno.",
    "Quer que eu envie a segunda via com o novo vencimento?",
  ],
  cancelamento: [
    "Entendo. Antes de prosseguir, posso te ajudar a resolver o que motivou isso?",
    "Posso te apresentar uma condição especial para você continuar?",
    "Tudo bem. Consigo dar andamento — só preciso confirmar alguns dados.",
  ],
  duvida: [
    "Claro! Como posso te ajudar?",
    "Pode me contar um pouco mais para eu te orientar melhor?",
    "Estou à disposição — o que você precisa?",
  ],
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

function summarize(ctx: CopilotContext): CopilotSummary {
  const intent = detectIntentSync(ctx);
  const name = ctx.contact?.name ?? "O cliente";
  const parts: string[] = [`${name}: ${intent.description}`];

  const lastIn = [...ctx.messages].reverse().find((m) => m.direction === "INBOUND");
  if (lastIn?.text) parts.push(`Última mensagem: "${truncate(lastIn.text, 120)}".`);

  const deal = ctx.deals[0];
  if (deal) parts.push(`Negócio "${deal.title}"${deal.stageName ? ` na etapa "${deal.stageName}"` : ""}.`);

  const pending = ctx.tasks.find((t) => t.status !== "COMPLETED");
  if (pending) parts.push(`Tarefa pendente: ${pending.title}${pending.dueAt ? ` (prazo ${fmtDate(pending.dueAt)})` : ""}.`);

  const d = ctx.signals.daysSinceLastInbound;
  if (ctx.signals.awaitingReply) parts.push(`Aguardando resposta${d != null && d >= 1 ? ` há ${d} dia(s)` : ""}.`);

  return { text: parts.join(" "), provider: "mock" };
}

function suggestNextAction(ctx: CopilotContext): CopilotNextAction {
  const s = ctx.signals;
  const intent = detectIntentSync(ctx);
  if (s.hasOverdueTask) return { key: "resume-task", label: "Retomar tarefa vencida", reason: "Há uma tarefa vencida para este contato." };
  if (s.awaitingReply && (s.daysSinceLastInbound ?? 0) >= 1)
    return { key: "reply", label: "Responder o cliente", reason: "O cliente está aguardando uma resposta." };
  if (intent.kind === "compra" && ctx.deals.length === 0)
    return { key: "send-proposal", label: "Enviar proposta", reason: "Interesse de compra sem negócio aberto." };
  if (ctx.deals.some((d) => (d.stageName ?? "").toLowerCase().includes("proposta")) && !s.hasFutureActivity)
    return { key: "follow-up", label: "Fazer follow-up", reason: "Proposta enviada sem follow-up agendado." };
  if (!s.hasFutureActivity)
    return { key: "schedule", label: "Agendar próximo contato", reason: "Não há próxima atividade planejada." };
  return { key: "none", label: "Nenhuma ação urgente", reason: "O atendimento está em dia." };
}

function detectRisks(ctx: CopilotContext): CopilotRisk[] {
  const s = ctx.signals;
  const risks: CopilotRisk[] = [];
  if (s.awaitingReply && (s.daysSinceLastInbound ?? 0) >= 3)
    risks.push({ id: "awaiting", severity: "high", label: `Cliente aguardando resposta há ${s.daysSinceLastInbound} dia(s).` });
  if (s.hasOverdueTask) risks.push({ id: "overdue-task", severity: "medium", label: "Tarefa vencida." });
  if (ctx.deals.length > 0 && !s.hasFutureActivity)
    risks.push({ id: "stale-deal", severity: "medium", label: "Negócio parado, sem follow-up agendado." });
  if (!s.hasFutureActivity && ctx.tasks.length === 0)
    risks.push({ id: "no-activity", severity: "low", label: "Nenhuma atividade futura para este contato." });
  return risks;
}

function suggestReplies(ctx: CopilotContext): CopilotSuggestion[] {
  const intent = detectIntentSync(ctx);
  const name = firstName(ctx.contact?.name);
  return SUGGESTIONS[intent.kind].map((text, i) => ({
    id: `${intent.kind}-${i}`,
    text: name && i === 0 ? `Oi, ${name}! ${text}` : text,
  }));
}

/** Cria o provedor MOCK. `delayMs` simula latência (0 nos testes). */
export function createMockCopilotProvider(delayMs = 0): CopilotProvider {
  const settle = <T>(value: T): Promise<T> =>
    delayMs > 0 ? new Promise((r) => setTimeout(() => r(value), delayMs)) : Promise.resolve(value);
  return {
    id: "mock",
    summarize: (ctx) => settle(summarize(ctx)),
    suggestReplies: (ctx) => settle(suggestReplies(ctx)),
    detectIntent: (ctx) => settle(detectIntentSync(ctx)),
    suggestNextAction: (ctx) => settle(suggestNextAction(ctx)),
    detectRisks: (ctx) => settle(detectRisks(ctx)),
  };
}

/** Instância MOCK padrão (latência leve para exercitar loading na UI). */
export const mockCopilotProvider = createMockCopilotProvider(350);
