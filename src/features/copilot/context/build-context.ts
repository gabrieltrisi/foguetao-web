import type { CopilotContext, CopilotMessageLite } from "@/features/copilot/types";

/**
 * Entradas do ContextBuilder — shapes ESTRUTURAIS (desacoplado dos tipos exatos da API).
 * Tudo opcional: o Copilot funciona com contexto PARCIAL (respeita o que o usuário pode
 * ver — os hooks já filtram por permissão).
 */
export interface BuildContextInput {
  conversationId: string;
  now: Date;
  conversation?: {
    status: string;
    channel?: string | null;
    labels?: { name: string }[];
  } | null;
  assigneeName?: string | null;
  /** Mensagens já ORDENADAS (antigo→novo) — ex.: `flattenTimelinePages`. */
  messages?: { direction: string; text: string | null; createdAt: string; visibility?: string }[];
  contact?: {
    fullName: string;
    email: string | null;
    phone: string | null;
    whatsappPhone?: string | null;
    status?: string | null;
    source?: string | null;
  } | null;
  organization?: { name: string; industry?: string | null } | null;
  deals?: { title: string; value: string; currency: string; status: string; stageId: string }[];
  stageById?: Map<string, { name: string; probability: number | null }>;
  tasks?: { title: string; status: string; priority: string; dueAt: string | null }[];
  counts?: { notes?: number; activities?: number };
}

const DAY_MS = 86_400_000;
const MAX_MESSAGES = 12;

const isPublic = (v?: string) => (v ?? "PUBLIC") === "PUBLIC";

/** Monta o `CopilotContext` (puro/determinístico). Não faz fetch. */
export function buildCopilotContext(input: BuildContextInput): CopilotContext {
  const now = input.now.getTime();

  const publicMsgs = (input.messages ?? []).filter((m) => isPublic(m.visibility));
  const messages: CopilotMessageLite[] = publicMsgs.slice(-MAX_MESSAGES).map((m) => ({
    direction: m.direction,
    text: m.text,
    at: m.createdAt,
    visibility: m.visibility ?? "PUBLIC",
  }));

  const lastInbound = [...publicMsgs].reverse().find((m) => m.direction === "INBOUND") ?? null;
  const lastOutbound = [...publicMsgs].reverse().find((m) => m.direction === "OUTBOUND") ?? null;
  const lastMsg = publicMsgs[publicMsgs.length - 1] ?? null;
  const daysSinceLastInbound = lastInbound
    ? Math.floor((now - new Date(lastInbound.createdAt).getTime()) / DAY_MS)
    : null;

  const tasks = (input.tasks ?? []).map((t) => {
    const due = t.dueAt ? new Date(t.dueAt).getTime() : null;
    const overdue = due != null && due < now && t.status !== "COMPLETED";
    return { title: t.title, status: t.status, priority: t.priority, dueAt: t.dueAt, overdue };
  });
  const hasFutureActivity = tasks.some(
    (t) => t.status !== "COMPLETED" && t.dueAt != null && new Date(t.dueAt).getTime() >= now,
  );
  const hasOverdueTask = tasks.some((t) => t.overdue);

  const deals = (input.deals ?? []).map((d) => {
    const stage = input.stageById?.get(d.stageId);
    return {
      title: d.title,
      value: d.value,
      currency: d.currency,
      status: d.status,
      stageName: stage?.name ?? null,
      probability: stage?.probability ?? null,
    };
  });

  return {
    conversationId: input.conversationId,
    conversation: input.conversation
      ? {
          status: input.conversation.status,
          channel: input.conversation.channel ?? null,
          assigneeName: input.assigneeName ?? null,
          labels: (input.conversation.labels ?? []).map((l) => l.name),
        }
      : null,
    messages,
    contact: input.contact
      ? {
          name: input.contact.fullName,
          email: input.contact.email,
          phone: input.contact.phone ?? input.contact.whatsappPhone ?? null,
          status: input.contact.status ?? null,
          source: input.contact.source ?? null,
        }
      : null,
    organization: input.organization
      ? { name: input.organization.name, industry: input.organization.industry ?? null }
      : null,
    deals,
    tasks,
    counts: {
      notes: input.counts?.notes ?? 0,
      activities: input.counts?.activities ?? 0,
      deals: deals.length,
      tasks: tasks.length,
    },
    signals: {
      lastInboundAt: lastInbound?.createdAt ?? null,
      lastOutboundAt: lastOutbound?.createdAt ?? null,
      daysSinceLastInbound,
      awaitingReply: lastMsg?.direction === "INBOUND",
      hasFutureActivity,
      hasOverdueTask,
    },
  };
}
