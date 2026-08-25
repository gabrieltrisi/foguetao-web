"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useCopilotProvider } from "@/features/copilot/providers/provider-context";
import { contextSignature } from "@/features/copilot/hooks/use-copilot-context";
import type { CopilotContext } from "@/features/copilot/types";

/**
 * Hooks do Copilot (F7). Passam pelo PROVEDOR injetado (a UI não o conhece). As seções
 * AUTO (intenção/próxima ação/riscos) são `useQuery` com key = conversa + assinatura do
 * contexto → recomputam só quando algo relevante muda, sem refetch a cada render.
 * Resumo e sugestões são `useMutation` (sob demanda por botão).
 */
function autoKey(provId: string, kind: string, ctx: CopilotContext) {
  return ["copilot", provId, kind, ctx.conversationId, contextSignature(ctx)] as const;
}

export function useCopilotIntent(context: CopilotContext, enabled = true) {
  const provider = useCopilotProvider();
  return useQuery({
    queryKey: autoKey(provider.id, "intent", context),
    queryFn: () => provider.detectIntent(context),
    enabled,
    staleTime: 60_000,
  });
}

export function useCopilotNextAction(context: CopilotContext, enabled = true) {
  const provider = useCopilotProvider();
  return useQuery({
    queryKey: autoKey(provider.id, "next-action", context),
    queryFn: () => provider.suggestNextAction(context),
    enabled,
    staleTime: 60_000,
  });
}

export function useCopilotRisks(context: CopilotContext, enabled = true) {
  const provider = useCopilotProvider();
  return useQuery({
    queryKey: autoKey(provider.id, "risks", context),
    queryFn: () => provider.detectRisks(context),
    enabled,
    staleTime: 60_000,
  });
}

export function useCopilotSummary(context: CopilotContext) {
  const provider = useCopilotProvider();
  return useMutation({ mutationFn: () => provider.summarize(context) });
}

export function useCopilotSuggestions(context: CopilotContext) {
  const provider = useCopilotProvider();
  return useMutation({ mutationFn: () => provider.suggestReplies(context) });
}
