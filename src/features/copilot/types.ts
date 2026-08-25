/**
 * Contratos do COPILOT OPERACIONAL (F7) — infraestrutura de frontend, AGNÓSTICA de
 * provedor de IA. A UI só conhece estas interfaces; o provedor (MOCK hoje; OpenAI/
 * Anthropic/… no futuro) é injetado por React context. NUNCA envia mensagens — só
 * sugere; o operador insere/edita/envia manualmente.
 */

/** Mensagem enxuta para o contexto (só o necessário — sem PII de provider). */
export interface CopilotMessageLite {
  direction: string; // INBOUND | OUTBOUND | SYSTEM
  text: string | null;
  at: string;
  visibility: string; // PUBLIC | INTERNAL
}

/**
 * CONTEXTO montado pelo `ContextBuilder` a partir do cache do React Query (sem fetch
 * novo). É a única entrada dos provedores.
 */
export interface CopilotContext {
  conversationId: string;
  conversation: {
    status: string;
    channel: string | null;
    assigneeName: string | null;
    labels: string[];
  } | null;
  /** Últimas mensagens PÚBLICAS, antigo→novo. */
  messages: CopilotMessageLite[];
  contact: {
    name: string;
    email: string | null;
    phone: string | null;
    status: string | null;
    source: string | null;
  } | null;
  organization: { name: string; industry: string | null } | null;
  deals: {
    title: string;
    value: string;
    currency: string;
    status: string;
    stageName: string | null;
    probability: number | null;
  }[];
  tasks: {
    title: string;
    status: string;
    priority: string;
    dueAt: string | null;
    overdue: boolean;
  }[];
  counts: { notes: number; activities: number; deals: number; tasks: number };
  /** Sinais derivados (para as regras do mock e futuros prompts). */
  signals: {
    lastInboundAt: string | null;
    lastOutboundAt: string | null;
    daysSinceLastInbound: number | null;
    awaitingReply: boolean;
    hasFutureActivity: boolean;
    hasOverdueTask: boolean;
  };
}

/* ---------- Resultados ---------- */

export interface CopilotSummary {
  text: string;
  provider: string;
}

export interface CopilotSuggestion {
  id: string;
  text: string;
}

export type CopilotIntentKind = "compra" | "suporte" | "financeiro" | "cancelamento" | "duvida";

export interface CopilotIntent {
  kind: CopilotIntentKind;
  label: string;
  description: string;
  /** Confiança SIMULADA (0..1). */
  confidence: number;
}

export interface CopilotNextAction {
  key: string;
  label: string;
  reason: string;
}

export type RiskSeverity = "low" | "medium" | "high";

export interface CopilotRisk {
  id: string;
  severity: RiskSeverity;
  label: string;
}

/**
 * Interface do PROVEDOR. Tudo assíncrono (a IA real tem latência). Trocar de provedor =
 * nova implementação desta interface — sem tocar na UI/ContextBuilder.
 */
export interface CopilotProvider {
  readonly id: string;
  summarize(ctx: CopilotContext): Promise<CopilotSummary>;
  suggestReplies(ctx: CopilotContext): Promise<CopilotSuggestion[]>;
  detectIntent(ctx: CopilotContext): Promise<CopilotIntent>;
  suggestNextAction(ctx: CopilotContext): Promise<CopilotNextAction>;
  detectRisks(ctx: CopilotContext): Promise<CopilotRisk[]>;
}
