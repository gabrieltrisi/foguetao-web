"use client";

import * as React from "react";
import { useConversation } from "@/hooks/messaging/use-conversations";
import { useConversationMessages } from "@/features/inbox/hooks/use-conversation-messages";
import { flattenTimelinePages } from "@/features/inbox/timeline";
import { useInboxAssignableMembers } from "@/features/inbox/hooks/use-inbox-members";
import { useContact } from "@/hooks/crm/use-contact-detail";
import { useOrganization } from "@/hooks/crm/use-organizations";
import { useDeals } from "@/hooks/crm/use-deals";
import { usePipelineStages } from "@/hooks/crm/use-pipelines";
import { useTasks } from "@/hooks/crm/use-tasks";
import { buildCopilotContext } from "@/features/copilot/context/build-context";
import type { CopilotContext } from "@/features/copilot/types";

/**
 * Monta o `CopilotContext` a partir do CACHE do React Query (F7). Reusa EXATAMENTE os
 * mesmos hooks/keys do painel/thread → o RQ deduplica: **zero fetch novo**. `now` é
 * estável por mount (o pai remonta por conversa). Memoizado. Só deve ser montado quando
 * há contato (a seção Copilot vive no ramo "com contato" do painel).
 */
export function useCopilotContext(conversationId: string, contactId: string) {
  const conv = useConversation(conversationId);
  const messagesQ = useConversationMessages(conversationId, { limit: 30 });
  const contactQ = useContact(contactId);
  const orgId = contactQ.data?.contact.organizationId ?? "";
  const orgQ = useOrganization(orgId);
  const dealsQ = useDeals({ contactId });
  const primaryPipeline = dealsQ.data?.items[0]?.pipelineId ?? "";
  const stagesQ = usePipelineStages(primaryPipeline);
  const tasksQ = useTasks({ contactId });
  const { nameById } = useInboxAssignableMembers();
  // Estável por mount (o pai remonta por conversa) e legível no render.
  const [now] = React.useState(() => new Date());

  const ordered = React.useMemo(
    () => flattenTimelinePages(messagesQ.data?.pages),
    [messagesQ.data?.pages],
  );

  const context: CopilotContext = React.useMemo(() => {
    const c = conv.data;
    const stageById = new Map(
      (stagesQ.data ?? []).map((s) => [s.id, { name: s.name, probability: s.probability }]),
    );
    return buildCopilotContext({
      conversationId,
      now,
      conversation: c ? { status: c.status, channel: c.channel ?? null, labels: c.labels ?? [] } : null,
      assigneeName: c?.assignedToUserId ? (nameById.get(c.assignedToUserId) ?? null) : null,
      messages: ordered.map((m) => ({ direction: m.direction, text: m.text, createdAt: m.createdAt, visibility: m.visibility })),
      contact: contactQ.data?.contact ?? null,
      organization: orgQ.data ? { name: orgQ.data.name, industry: orgQ.data.industry } : null,
      deals: dealsQ.data?.items.map((d) => ({ title: d.title, value: d.value, currency: d.currency, status: d.status, stageId: d.stageId })),
      stageById,
      tasks: tasksQ.data?.items.map((t) => ({ title: t.title, status: t.status, priority: t.priority, dueAt: t.dueAt })),
      counts: contactQ.data?.counters
        ? { notes: contactQ.data.counters.notes, activities: contactQ.data.counters.activities }
        : undefined,
    });
  }, [conversationId, now, conv.data, ordered, contactQ.data, orgQ.data, dealsQ.data, stagesQ.data, tasksQ.data, nameById]);

  return { context, ready: !conv.isLoading };
}

/**
 * Assinatura LEVE do contexto — muda só quando algo relevante muda. Usada como parte da
 * query key das seções auto (intenção/próxima ação/riscos) para recomputar sob demanda
 * sem refetch a cada render.
 */
export function contextSignature(ctx: CopilotContext): string {
  return [
    ctx.signals.lastInboundAt ?? "-",
    ctx.signals.awaitingReply ? "await" : "-",
    ctx.signals.hasOverdueTask ? "over" : "-",
    ctx.signals.hasFutureActivity ? "fut" : "-",
    ctx.deals.length,
    ctx.tasks.length,
    ctx.messages.length,
  ].join("|");
}
