import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { applyRealtimeEvent } from "@/lib/messaging/realtime-cache";
import { useMessagingRealtime } from "@/hooks/messaging/use-messaging-realtime";

vi.mock("@/lib/messaging/realtime-cache", () => ({ applyRealtimeEvent: vi.fn() }));

const h = vi.hoisted(() => ({
  session: { status: "ready", activeCompanyId: "co1", can: () => true } as {
    status: string;
    activeCompanyId: string | null;
    can: (p: string) => boolean;
  },
}));
vi.mock("@/providers/session-provider", () => ({ useSession: () => h.session }));

/** EventSource fake controlável. */
class FakeEventSource {
  static created: FakeEventSource[] = [];
  onopen: ((e: Event) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  closed = false;
  readonly listeners = new Map<string, Set<EventListener>>();
  constructor() {
    FakeEventSource.created.push(this);
  }
  addEventListener(type: string, cb: EventListener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(cb);
  }
  removeEventListener(type: string, cb: EventListener) {
    this.listeners.get(type)?.delete(cb);
  }
  close() {
    this.closed = true;
  }
  emit(type: string, data: unknown) {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    this.listeners.get(type)?.forEach((cb) => cb({ data: payload } as MessageEvent));
  }
  open() {
    this.onopen?.(new Event("open"));
  }
  error() {
    this.onerror?.(new Event("error"));
  }
}

const factory = () => new FakeEventSource() as unknown as EventSource;
const last = () => FakeEventSource.created[FakeEventSource.created.length - 1];

const validEvent = (over: Record<string, unknown> = {}) => ({
  id: "e1",
  version: 1,
  type: "conversation.updated",
  companyId: "co1",
  occurredAt: "2026-07-22T00:00:00.000Z",
  data: { conversationId: "conv1", reason: "ASSIGNED", updatedAt: "t" },
  ...over,
});

let client: QueryClient;
function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
const render = () => renderHook(() => useMessagingRealtime(factory), { wrapper });

beforeEach(() => {
  FakeEventSource.created = [];
  client = new QueryClient();
  h.session = { status: "ready", activeCompanyId: "co1", can: () => true };
  vi.mocked(applyRealtimeEvent).mockClear();
});
afterEach(() => vi.useRealTimers());

describe("useMessagingRealtime — conexão (Fase 6.3C)", () => {
  it("NÃO conecta sem sessão pronta", () => {
    h.session = { status: "loading", activeCompanyId: "co1", can: () => true };
    render();
    expect(FakeEventSource.created).toHaveLength(0);
  });

  it("NÃO conecta sem empresa ativa", () => {
    h.session = { status: "ready", activeCompanyId: null, can: () => true };
    render();
    expect(FakeEventSource.created).toHaveLength(0);
  });

  it("NÃO conecta sem permissão messaging.conversations.read", () => {
    h.session = { status: "ready", activeCompanyId: "co1", can: () => false };
    render();
    expect(FakeEventSource.created).toHaveLength(0);
  });

  it("conecta UMA vez e registra os quatro listeners", () => {
    render();
    expect(FakeEventSource.created).toHaveLength(1);
    for (const name of [
      "message.created",
      "message.statusChanged",
      "conversation.updated",
      "conversation.read",
    ]) {
      expect(last().listeners.get(name)?.size).toBe(1);
    }
  });

  it("fecha ao logout (sessão deixa de estar pronta)", () => {
    const { rerender } = render();
    const es = last();
    h.session = { status: "expired", activeCompanyId: "co1", can: () => true };
    rerender();
    expect(es.closed).toBe(true);
  });

  it("troca de empresa: fecha a antiga e abre uma nova", () => {
    const { rerender } = render();
    const first = last();
    h.session = { status: "ready", activeCompanyId: "co2", can: () => true };
    rerender();
    expect(first.closed).toBe(true);
    expect(FakeEventSource.created).toHaveLength(2);
    expect(last()).not.toBe(first);
  });
});

describe("useMessagingRealtime — eventos", () => {
  it("evento válido chama applyRealtimeEvent", () => {
    render();
    last().emit("conversation.updated", validEvent());
    expect(applyRealtimeEvent).toHaveBeenCalledTimes(1);
  });

  it("tenant divergente é ignorado (não toca cache)", () => {
    render();
    last().emit("conversation.updated", validEvent({ companyId: "outra" }));
    expect(applyRealtimeEvent).not.toHaveBeenCalled();
  });

  it("JSON/envelope inválido é ignorado", () => {
    render();
    last().emit("conversation.updated", "not-json{");
    last().emit("conversation.updated", validEvent({ version: 9 }));
    expect(applyRealtimeEvent).not.toHaveBeenCalled();
  });

  it("evento após unmount é ignorado", () => {
    const { unmount } = render();
    const es = last();
    unmount();
    es.emit("conversation.updated", validEvent());
    expect(applyRealtimeEvent).not.toHaveBeenCalled();
  });
});

describe("useMessagingRealtime — reconnect/onopen", () => {
  it("onopen inicial NÃO invalida", () => {
    const spy = vi.fn();
    render();
    client.invalidateQueries = spy as never;
    last().open();
    expect(spy).not.toHaveBeenCalled();
  });

  it("onopen APÓS erro invalida SOMENTE messaging", () => {
    vi.useFakeTimers();
    render();
    const spy = vi.fn();
    client.invalidateQueries = spy as never;
    last().error(); // agenda reconnect
    vi.advanceTimersByTime(1000); // backoff[0]
    last().open(); // reconexão
    expect(spy).toHaveBeenCalledWith({ queryKey: ["messaging"] });
  });

  it("onerror não abre conexão nova imediatamente; backoff segue a sequência", () => {
    vi.useFakeTimers();
    render();
    expect(FakeEventSource.created).toHaveLength(1);
    last().error();
    expect(FakeEventSource.created).toHaveLength(1); // sem reconnect imediato
    vi.advanceTimersByTime(1000);
    expect(FakeEventSource.created).toHaveLength(2); // 1s
    last().error();
    vi.advanceTimersByTime(1999);
    expect(FakeEventSource.created).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeEventSource.created).toHaveLength(3); // 2s
  });

  it("cleanup cancela o timer de reconnect", () => {
    vi.useFakeTimers();
    const { unmount } = render();
    last().error();
    unmount();
    vi.advanceTimersByTime(60000);
    expect(FakeEventSource.created).toHaveLength(1); // nenhuma reconexão após unmount
  });
});

describe("useMessagingRealtime — estado, dedup e offline (C3.1D)", () => {
  it("expõe estado: connecting → connected → reconnecting", () => {
    const { result } = render();
    expect(result.current.status).toBe("connecting");
    act(() => last().open());
    expect(result.current.status).toBe("connected");
    expect(result.current.pollingActive).toBe(false);
    act(() => last().error());
    expect(result.current.status).toBe("reconnecting");
    expect(result.current.pollingActive).toBe(true);
    expect(result.current.reconnectAttempts).toBe(1);
  });

  it("deduplica por eventId (at-least-once) — mesmo id aplica uma vez", () => {
    render();
    const src = last();
    src.emit("conversation.updated", validEvent({ id: "dup" }));
    src.emit("conversation.updated", validEvent({ id: "dup" }));
    expect(applyRealtimeEvent).toHaveBeenCalledTimes(1);
    // id diferente volta a aplicar
    src.emit("conversation.updated", validEvent({ id: "outro" }));
    expect(applyRealtimeEvent).toHaveBeenCalledTimes(2);
  });

  it("offline: fecha o stream e vai para status offline; online religa", () => {
    const onLine = vi.spyOn(navigator, "onLine", "get");
    onLine.mockReturnValue(true);
    const { result } = render();
    const first = last();
    act(() => {
      onLine.mockReturnValue(false);
      window.dispatchEvent(new Event("offline"));
    });
    expect(first.closed).toBe(true);
    expect(result.current.status).toBe("offline");
    act(() => {
      onLine.mockReturnValue(true);
      window.dispatchEvent(new Event("online"));
    });
    expect(FakeEventSource.created.length).toBeGreaterThan(1); // reabriu
    onLine.mockRestore();
  });
});
