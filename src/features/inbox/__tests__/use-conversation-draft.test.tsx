import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/types/api/error";
import { useConversationDraft } from "@/features/inbox/hooks/use-conversation-draft";

const api = vi.hoisted(() => ({
  getDraft: vi.fn(),
  putDraft: vi.fn(),
  deleteDraft: vi.fn(),
}));
vi.mock("@/lib/api/messaging/client", () => ({ messagingApi: api }));

const h = vi.hoisted(() => ({
  session: { activeCompanyId: "co1", can: () => true },
}));
vi.mock("@/providers/session-provider", () => ({ useSession: () => h.session }));

let client: QueryClient;
function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
const render = (id: string | undefined = "conv1") =>
  renderHook(() => useConversationDraft(id), { wrapper });

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  api.getDraft.mockReset().mockResolvedValue(null);
  api.putDraft.mockReset();
  api.deleteDraft.mockReset().mockResolvedValue(undefined);
});
afterEach(() => vi.useRealTimers());

describe("useConversationDraft (§17)", () => {
  it("hidrata do rascunho remoto", async () => {
    api.getDraft.mockResolvedValue({
      conversationId: "conv1",
      userId: "u",
      text: "oi remoto",
      version: 3,
      updatedAt: "t",
    });
    const { result } = render();
    await waitFor(() => expect(result.current.text).toBe("oi remoto"));
  });

  it("autosave debounced faz PUT com expectedVersion", async () => {
    api.getDraft.mockResolvedValue({
      conversationId: "conv1",
      userId: "u",
      text: "base",
      version: 2,
      updatedAt: "t",
    });
    api.putDraft.mockResolvedValue({ conversationId: "conv1", userId: "u", text: "novo", version: 3, updatedAt: "t2" });
    const { result } = render();
    await waitFor(() => expect(result.current.text).toBe("base")); // garante hidratação (version=2)
    vi.useFakeTimers();
    act(() => result.current.setText("novo"));
    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(api.putDraft).toHaveBeenCalledWith("conv1", { text: "novo", expectedVersion: 2 });
  });

  it("conflito 409 → estado 'conflict' e NÃO sobrescreve o texto local", async () => {
    api.getDraft.mockResolvedValue({ conversationId: "conv1", userId: "u", text: "", version: 1, updatedAt: "t" });
    api.putDraft.mockRejectedValue(
      new ApiError({ statusCode: 409, code: "CONVERSATION_DRAFT_CONFLICT", message: "x" }),
    );
    const { result } = render();
    await waitFor(() => expect(api.getDraft).toHaveBeenCalled());
    vi.useFakeTimers();
    act(() => result.current.setText("meu texto local"));
    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    vi.useRealTimers();
    await waitFor(() => expect(result.current.isConflict).toBe(true));
    expect(result.current.text).toBe("meu texto local"); // preservado
  });

  it("texto vazio remove o rascunho remoto (não salva vazio)", async () => {
    api.getDraft.mockResolvedValue({ conversationId: "conv1", userId: "u", text: "tinha", version: 5, updatedAt: "t" });
    const { result } = render();
    await waitFor(() => expect(result.current.text).toBe("tinha"));
    vi.useFakeTimers();
    act(() => result.current.setText(""));
    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(api.deleteDraft).toHaveBeenCalledWith("conv1");
    expect(api.putDraft).not.toHaveBeenCalled();
  });

  it("clear() apaga e reseta", async () => {
    const { result } = render();
    await waitFor(() => expect(api.getDraft).toHaveBeenCalled());
    await act(async () => {
      await result.current.clear();
    });
    expect(api.deleteDraft).toHaveBeenCalledWith("conv1");
    expect(result.current.text).toBe("");
  });
});
