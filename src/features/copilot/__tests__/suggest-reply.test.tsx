import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CopilotProviderContext } from "@/features/copilot/providers/provider-context";
import { buildCopilotContext } from "@/features/copilot/context/build-context";
import type { CopilotProvider } from "@/features/copilot/types";

const FIXED = buildCopilotContext({ conversationId: "c1", now: new Date("2026-07-28T12:00:00Z") });

vi.mock("@/features/copilot/hooks/use-copilot-context", () => ({
  useCopilotContext: () => ({ context: FIXED, ready: true }),
  contextSignature: () => "sig",
}));
vi.mock("@/hooks/messaging/use-conversations", () => ({
  useConversation: () => ({ data: { contactId: "ct1" } }),
}));

import { SuggestReplyButton } from "@/features/copilot/components/suggest-reply";

// Provider CUSTOM (spy) — prova que a UI usa o provider INJETADO, sem mudar a UI.
function spyProvider(): { provider: CopilotProvider; suggest: ReturnType<typeof vi.fn> } {
  const suggest = vi.fn().mockResolvedValue([
    { id: "x1", text: "Resposta sugerida A" },
    { id: "x2", text: "Resposta sugerida B" },
  ]);
  const provider: CopilotProvider = {
    id: "spy",
    summarize: vi.fn(),
    suggestReplies: suggest,
    detectIntent: vi.fn(),
    suggestNextAction: vi.fn(),
    detectRisks: vi.fn(),
  };
  return { provider, suggest };
}

function renderBtn(onInsert = vi.fn(), provider?: CopilotProvider) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={qc}>
      <CopilotProviderContext provider={provider}>
        <SuggestReplyButton conversationId="c1" onInsert={onInsert} />
      </CopilotProviderContext>
    </QueryClientProvider>,
  );
  return { onInsert };
}

describe("SuggestReplyButton (F7)", () => {
  it("abre, usa o provider INJETADO e insere a sugestão (nunca envia)", async () => {
    const { provider, suggest } = spyProvider();
    const { onInsert } = renderBtn(vi.fn(), provider);
    await userEvent.click(screen.getByRole("button", { name: /sugerir resposta com ia/i }));
    // provider injetado foi consultado (troca de provider não muda a UI)
    expect(suggest).toHaveBeenCalledTimes(1);
    const opt = await screen.findByText("Resposta sugerida A");
    await userEvent.click(opt);
    // insere no composer — NUNCA envia
    expect(onInsert).toHaveBeenCalledWith("Resposta sugerida A");
  });

  it("provider MOCK padrão também funciona (sem provider explícito)", async () => {
    renderBtn();
    await userEvent.click(screen.getByRole("button", { name: /sugerir resposta com ia/i }));
    expect(await screen.findByText(/como posso te ajudar/i)).toBeInTheDocument();
  });
});
