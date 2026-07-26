import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApiError } from "@/types/api/error";
import type { ApiPublicMessageListItem } from "@/types/api/messaging";
import { ConversationTimeline } from "@/features/inbox/components/timeline/conversation-timeline";

const hook = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock("@/features/inbox/hooks/use-conversation-messages", () => ({
  useConversationMessages: () => hook.value,
}));

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
const render$ = () => render(<ConversationTimeline conversationId="c1" unreadForUser={0} />);

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
    hook.value = {
      ...base, isLoading: false,
      data: {
        pages: [
          {
            items: [
              m({ id: "b", direction: "OUTBOUND", text: "resposta", createdAt: "2026-07-27T10:01:00Z" }),
              m({ id: "a", text: "pergunta", createdAt: "2026-07-27T10:00:00Z" }),
              m({ id: "n", direction: "OUTBOUND", visibility: "INTERNAL", text: "nota secreta", createdAt: "2026-07-27T10:02:00Z" }),
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
    render(<ConversationTimeline conversationId="c1" unreadForUser={1} />);
    expect(screen.getByText("Não lidas")).toBeInTheDocument();
  });
});
