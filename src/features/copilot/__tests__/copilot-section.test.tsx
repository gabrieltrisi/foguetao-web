import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CopilotProviderContext } from "@/features/copilot/providers/provider-context";
import { createMockCopilotProvider } from "@/features/copilot/providers/mock-provider";
import { buildCopilotContext } from "@/features/copilot/context/build-context";

// Contexto FIXO (evita mockar todos os hooks de CRM). Intenção "compra" + risco.
const FIXED = buildCopilotContext({
  conversationId: "c1",
  now: new Date("2026-07-28T12:00:00Z"),
  conversation: { status: "OPEN", channel: "WHATSAPP", labels: [] },
  contact: { fullName: "Ana Lima", email: null, phone: null, status: "ACTIVE", source: "WHATSAPP" },
  messages: [{ direction: "INBOUND", text: "quero contratar o plano premium", createdAt: "2026-07-25T09:00:00Z", visibility: "PUBLIC" }],
  deals: [{ title: "Plano Pro", value: "1500.00", currency: "BRL", status: "OPEN", stageId: "s1" }],
  stageById: new Map([["s1", { name: "Proposta enviada", probability: 40 }]]),
});

vi.mock("@/features/copilot/hooks/use-copilot-context", () => ({
  useCopilotContext: () => ({ context: FIXED, ready: true }),
  contextSignature: () => "sig",
}));

import { CopilotSection } from "@/features/copilot/components/copilot-section";

function renderSection() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CopilotProviderContext provider={createMockCopilotProvider(0)}>
        <CopilotSection conversationId="c1" contactId="ct1" />
      </CopilotProviderContext>
    </QueryClientProvider>,
  );
}

describe("CopilotSection (F7)", () => {
  it("mostra o selo IA (mock) e as seções auto (intenção/ação/riscos)", async () => {
    renderSection();
    expect(screen.getByText("IA (mock)")).toBeInTheDocument();
    expect(await screen.findByText("Compra")).toBeInTheDocument(); // intenção detectada
    expect(await screen.findByText("Responder o cliente")).toBeInTheDocument(); // próxima ação
    expect(await screen.findByText(/aguardando resposta/i)).toBeInTheDocument(); // risco
  });

  it("resumo é sob demanda (botão) — determinístico", async () => {
    renderSection();
    expect(screen.getByText(/clique em .gerar resumo./i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /gerar resumo/i }));
    expect(await screen.findByText(/Ana Lima/)).toBeInTheDocument();
    expect(screen.getByText(/Proposta enviada/)).toBeInTheDocument();
  });
});
