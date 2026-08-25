import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InboxConversationList } from "@/components/messaging/inbox/inbox-conversation-list";
import type { ApiConversation } from "@/types/api/messaging";

const h = vi.hoisted(() => ({
  can: ((): boolean => true) as (p: string) => boolean,
  list: {} as Record<string, unknown>,
  contacts: { data: { items: [] as { id: string; fullName: string }[] } },
  calls: [] as Record<string, unknown>[],
}));

vi.mock("@/providers/session-provider", () => ({
  useSession: () => ({ can: h.can, activeCompanyId: "co1" }),
}));
vi.mock("@/hooks/messaging/use-conversations", () => ({
  useConversationsInfinite: (filters: Record<string, unknown>) => {
    h.calls.push(filters);
    return h.list;
  },
}));
vi.mock("@/hooks/crm/use-contacts", () => ({ useContacts: () => h.contacts }));

/** Últimos filtros enviados ao backend via useConversationsInfinite. */
const lastFilters = () => h.calls[h.calls.length - 1];

function conv(over: Partial<ApiConversation> = {}): ApiConversation {
  return {
    id: "c1",
    companyId: "co1",
    messagingAccountId: "a1",
    type: "DIRECT",
    status: "OPEN",
    title: "Cliente X",
    assignedToUserId: null,
    contactId: null,
    unreadCount: 0,
    lastMessageAt: "2026-07-16T12:00:00.000Z",
    lastInboundAt: null,
    lastOutboundAt: null,
    createdAt: "2026-07-16T10:00:00.000Z",
    updatedAt: "2026-07-16T12:00:00.000Z",
    canSend: true,
    sendabilityReason: null,
    ...over,
  };
}

function listOf(items: ApiConversation[], over: Record<string, unknown> = {}) {
  return {
    isLoading: false,
    isError: false,
    data: { pages: [{ items }] },
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
    ...over,
  };
}

beforeEach(() => {
  h.can = () => true;
  h.contacts = { data: { items: [] } };
  h.list = listOf([conv()]);
  h.calls.length = 0;
});

describe("InboxConversationList (Bloco 2)", () => {
  it("destaca não lidas com badge de contagem", () => {
    h.list = listOf([conv({ id: "u", title: "Ana", unreadCount: 3 })]);
    render(<InboxConversationList onSelect={vi.fn()} />);
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("mostra indicador humano quando o envio está indisponível — sem CONNECTION_*", () => {
    h.list = listOf([
      conv({
        title: "Bruno",
        canSend: false,
        sendabilityReason: { code: "CONNECTION_REVOKED", retryable: false, connectionStatus: "REVOKED" },
      }),
    ]);
    render(<InboxConversationList onSelect={vi.fn()} />);
    expect(screen.getByText("Sessão revogada")).toBeInTheDocument();
    expect(screen.queryByText(/CONNECTION_/)).not.toBeInTheDocument();
  });

  it("estado vazio localizado", () => {
    h.list = listOf([]);
    render(<InboxConversationList onSelect={vi.fn()} />);
    expect(screen.getByText("Nenhuma conversa encontrada.")).toBeInTheDocument();
  });

  it("erro localizado (a lista segue utilizável, sem quebrar a tela)", () => {
    h.list = listOf([], { isError: true, data: undefined });
    render(<InboxConversationList onSelect={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar as conversas.");
  });

  it("bloqueia sem a permissão messaging.conversations.read", () => {
    h.can = () => false;
    render(<InboxConversationList onSelect={vi.fn()} />);
    expect(screen.getByText("Você não tem permissão para ver conversas.")).toBeInTheDocument();
  });
});

describe("InboxConversationList — filtro 'Não lidas' (unreadOnly)", () => {
  it("estado inicial é 'Todas': sem unreadOnly e sem status", () => {
    render(<InboxConversationList onSelect={vi.fn()} />);
    expect(lastFilters().unreadOnly).toBeUndefined();
    expect(lastFilters().status).toBeUndefined();
    expect(screen.getByRole("tab", { name: "Todas" })).toHaveAttribute("aria-selected", "true");
  });

  it("escolher 'Não lidas' envia unreadOnly=true (sem virar status)", () => {
    render(<InboxConversationList onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole("tab", { name: "Não lidas" }));
    expect(lastFilters().unreadOnly).toBe(true);
    expect(lastFilters().status).toBeUndefined();
    expect(screen.getByRole("tab", { name: "Não lidas" })).toHaveAttribute("aria-selected", "true");
  });

  it("volta ao estado inicial: 'Não lidas' → 'Todas' remove unreadOnly", () => {
    render(<InboxConversationList onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole("tab", { name: "Não lidas" }));
    expect(lastFilters().unreadOnly).toBe(true);
    fireEvent.click(screen.getByRole("tab", { name: "Todas" }));
    expect(lastFilters().unreadOnly).toBeUndefined();
    expect(lastFilters().status).toBeUndefined();
  });

  it("nunca envia unreadOnly=false ao trocar para um status (evita coerção do backend)", () => {
    render(<InboxConversationList onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole("tab", { name: "Abertas" }));
    expect(lastFilters().status).toBe("OPEN");
    expect(lastFilters().unreadOnly).toBeUndefined(); // omitido, não `false`
  });

  it("integra com a busca: mantém search e unreadOnly juntos", async () => {
    render(<InboxConversationList onSelect={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Buscar conversas…"), { target: { value: "ana" } });
    await waitFor(() => expect(lastFilters().search).toBe("ana"));
    fireEvent.click(screen.getByRole("tab", { name: "Não lidas" }));
    expect(lastFilters()).toMatchObject({ search: "ana", unreadOnly: true });
  });
});
