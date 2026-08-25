import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/types/api/error";
import type { ApiPublicMessageListItem } from "@/types/api/messaging";
import { ConversationTimeline } from "@/features/inbox/components/timeline/conversation-timeline";

const hook = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock("@/features/inbox/hooks/use-conversation-messages", () => ({
  useConversationMessages: () => hook.value,
}));
vi.mock("@/providers/session-provider", () => ({
  useSession: () => ({ user: { id: "u1" }, activeCompanyId: "co1", can: () => true }),
}));
vi.mock("@/components/ui/toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

function m(over: Partial<ApiPublicMessageListItem>): ApiPublicMessageListItem {
  return {
    id: "m", direction: "INBOUND", type: "TEXT", text: "oi", status: "SENT",
    createdAt: "2026-07-27T10:00:00.000Z", scheduledAt: null, sentAt: null,
    deliveredAt: null, readAt: null, failedAt: null, failure: null, visibility: "PUBLIC",
    ...over,
  } as ApiPublicMessageListItem;
}
const base = {
  hasNextPage: false, isFetchingNextPage: false, fetchNextPage: vi.fn(), refetch: vi.fn(),
  isError: false, error: null,
};
function Wrap({ children }: { children: React.ReactNode }) {
  const [c] = React.useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return <QueryClientProvider client={c}>{children}</QueryClientProvider>;
}
const render$ = () =>
  render(<ConversationTimeline conversationId="c1" unreadForUser={0} />, { wrapper: Wrap });

describe("ConversationTimeline (F2A)", () => {
  it("loading → skeleton", () => {
    hook.value = { ...base, isLoading: true, data: undefined };
    render$();
    expect(document.querySelector("[aria-hidden]")).toBeTruthy();
  });

  it("vazio → estado vazio", () => {
    hook.value = { ...base, isLoading: false, data: { pages: [{ items: [], nextCursor: null, hasMore: false }] } };
    render$();
    expect(screen.getByText(/não há mensagens/i)).toBeInTheDocument();
  });

  it("erro inicial → mensagem + retry", () => {
    const refetch = vi.fn();
    hook.value = {
      ...base, isLoading: false, isError: true,
      error: new ApiError({ statusCode: 500, code: "INTERNAL_ERROR", message: "x" }),
      data: { pages: [] }, refetch,
    };
    render$();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    screen.getByRole("button", { name: /tentar novamente/i }).click();
    expect(refetch).toHaveBeenCalled();
  });

  it("renderiza mensagens, separador de dia e distingue nota interna", () => {
    // Datas relativas a AGORA (robusto à virada de dia — o separador de "Hoje" usa a
    // data local corrente; datas fixas viravam "Ontem" à meia-noite).
    const base0 = Date.now();
    const iso = (offsetMs: number) => new Date(base0 + offsetMs).toISOString();
    hook.value = {
      ...base, isLoading: false,
      data: {
        pages: [
          {
            items: [
              m({ id: "b", direction: "OUTBOUND", text: "resposta", createdAt: iso(1000) }),
              m({ id: "a", text: "pergunta", createdAt: iso(0) }),
              m({ id: "n", direction: "OUTBOUND", visibility: "INTERNAL", text: "nota secreta", createdAt: iso(2000) }),
            ],
            nextCursor: null, hasMore: false,
          },
        ],
      },
    };
    render$();
    expect(screen.getByText("pergunta")).toBeInTheDocument();
    expect(screen.getByText("resposta")).toBeInTheDocument();
    expect(screen.getByText("nota secreta")).toBeInTheDocument();
    expect(screen.getByText("Nota interna")).toBeInTheDocument(); // distinção
    expect(screen.getByText("Hoje")).toBeInTheDocument(); // separador de dia
    expect(screen.getByRole("log", { name: /histórico/i })).toBeInTheDocument();
  });

  it("com não-lidas → separador de não-lidas", () => {
    hook.value = {
      ...base, isLoading: false,
      data: { pages: [{ items: [m({ id: "a", direction: "INBOUND" })], nextCursor: null, hasMore: false }] },
    };
    render(<ConversationTimeline conversationId="c1" unreadForUser={1} />, { wrapper: Wrap });
    expect(screen.getByText("Não lidas")).toBeInTheDocument();
  });
});
