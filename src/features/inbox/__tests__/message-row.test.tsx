import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MessageRow } from "@/features/inbox/components/timeline/message/message-row";
import { toTimelineMessage, type TimelineMessageVM } from "@/features/inbox/view-models";
import type { GroupMeta } from "@/features/inbox/timeline";
import type { ApiPublicMessageListItem } from "@/types/api/messaging";

vi.mock("@/providers/session-provider", () => ({
  useSession: () => ({ user: { id: "u1" }, activeCompanyId: "co1", can: () => true }),
}));
vi.mock("@/components/ui/toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/features/inbox/hooks/use-media", () => ({
  useMedia: () => ({ data: { mimeType: "image/png", sizeBytes: 2048, originalFilename: "foto.png", status: "AVAILABLE" }, isLoading: false, isError: false }),
}));

const GROUP: GroupMeta = { firstInGroup: true, lastInGroup: true, showSender: true, showTimestamp: true, position: "single" };
function vm(o: Partial<ApiPublicMessageListItem>): TimelineMessageVM {
  return toTimelineMessage({
    id: "m", direction: "INBOUND", type: "TEXT", text: "olá www.x.com", status: "SENT",
    createdAt: "2026-07-27T10:00:00Z", scheduledAt: null, sentAt: null, deliveredAt: null,
    readAt: null, failedAt: null, failure: null, visibility: "PUBLIC", ...o,
  } as ApiPublicMessageListItem);
}
function Wrap({ children }: { children: React.ReactNode }) {
  const [c] = React.useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return <QueryClientProvider client={c}>{children}</QueryClientProvider>;
}
const row = (m: TimelineMessageVM, group = GROUP) =>
  render(<MessageRow message={m} group={group} senderName="Ana" />, { wrapper: Wrap });

describe("MessageRow (F2B)", () => {
  it("inbound: mostra sender + link seguro", () => {
    row(vm({ direction: "INBOUND" }));
    expect(screen.getByText("Ana")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "www.x.com" });
    expect(link).toHaveAttribute("href", "https://www.x.com");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("outbound: mostra status (Lida)", () => {
    row(vm({ direction: "OUTBOUND", status: "READ", senderUserId: "u1" }));
    expect(screen.getByRole("img", { name: "Lida" })).toBeInTheDocument();
  });

  it("nota interna: rótulo inequívoco", () => {
    row(vm({ direction: "OUTBOUND", visibility: "INTERNAL", text: "segredo" }));
    expect(screen.getByText("Nota interna")).toBeInTheDocument();
    expect(screen.getByText("segredo")).toBeInTheDocument();
  });

  it("evento de sistema: não é bolha", () => {
    row(vm({ direction: "SYSTEM", text: "Conversa encerrada" }));
    expect(screen.getByText("Conversa encerrada")).toBeInTheDocument();
  });

  it("mídia imagem: renderiza <img> inline (Fase 2)", () => {
    row(vm({ type: "IMAGE", text: null, hasMedia: true, mediaId: "media-1" }));
    const img = screen.getByRole("img", { name: "foto.png" });
    expect(img).toHaveAttribute("src", "/api/messaging/media/media-1/content");
  });

  it("reply: mostra prévia de resposta", () => {
    row(vm({ replyToMessageId: "orig-1" }));
    expect(screen.getByTitle("Ir para a mensagem respondida")).toBeInTheDocument();
  });

  it("falha: indicador + mensagem amigável", () => {
    row(vm({ direction: "OUTBOUND", status: "FAILED", failure: { code: "X", retryable: false, message: "Número inválido" } }));
    expect(screen.getByText("Número inválido")).toBeInTheDocument();
  });

  it("falha outbound: botão 'Tentar novamente' chama onRetry (F2C)", async () => {
    const onRetry = vi.fn();
    const failed = vm({ id: "temp:c1", direction: "OUTBOUND", status: "FAILED", text: "olá", failure: { code: "LOCAL_SEND_FAILED", retryable: true, message: "Sem conexão" } });
    render(<MessageRow message={failed} group={GROUP} senderName="Você" onRetry={onRetry} />, { wrapper: Wrap });
    const btn = screen.getByRole("button", { name: "Tentar novamente" });
    await userEvent.click(btn);
    expect(onRetry).toHaveBeenCalledWith(failed);
  });

  it("falha inbound: não mostra retry (só outbound)", () => {
    row(vm({ direction: "INBOUND", status: "FAILED", failure: { code: "X", retryable: true, message: "x" } }));
    expect(screen.queryByRole("button", { name: "Tentar novamente" })).not.toBeInTheDocument();
  });

  it("sem conteúdo/tipo não suportado → fallback", () => {
    row(vm({ type: "UNKNOWN", text: null, hasMedia: false }));
    expect(screen.getByText("Tipo de mensagem não suportado")).toBeInTheDocument();
  });
});
