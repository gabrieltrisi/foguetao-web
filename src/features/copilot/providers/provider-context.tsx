"use client";

import * as React from "react";
import type { CopilotProvider } from "@/features/copilot/types";
import { mockCopilotProvider } from "@/features/copilot/providers/mock-provider";

/**
 * Injeção do PROVEDOR do Copilot (F7). A UI acessa via `useCopilotProvider()` e NUNCA
 * conhece a implementação — trocar o MOCK por OpenAI/Anthropic = trocar o `provider`
 * aqui, sem tocar em componentes/hooks/ContextBuilder. Default = MOCK (funciona sem
 * wrapper explícito e nos testes).
 */
const CopilotCtx = React.createContext<CopilotProvider>(mockCopilotProvider);

export function CopilotProviderContext({
  provider = mockCopilotProvider,
  children,
}: {
  provider?: CopilotProvider;
  children: React.ReactNode;
}) {
  return <CopilotCtx.Provider value={provider}>{children}</CopilotCtx.Provider>;
}

export function useCopilotProvider(): CopilotProvider {
  return React.useContext(CopilotCtx);
}
