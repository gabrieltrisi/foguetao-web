import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const h = vi.hoisted(() => ({
  sendMutate: vi.fn(),
  noteMutateAsync: vi.fn().mockResolvedValue({}),
  clear: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/hooks/messaging/use-inbox", () => ({
  useSendInboxMessage: () => ({ mutate: h.sendMutate, mutateAsync: vi.fn() }),
}));
vi.mock("@/features/inbox/hooks/use-send-note", () => ({
  useSendInternalNote: () => ({ mutate: vi.fn(), mutateAsync: h.noteMutateAsync }),
}));
vi.mock("@/features/inbox/hooks/use-inbox-mutations", () => ({
  useSendConversationImage: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/features/inbox/hooks/use-conversation-draft", () => ({
  useConversationDraft: () => {
    const [text, setText] = React.useState("");
    return { text, setText, saveState: "idle", isConflict: false, resolveConflict: vi.fn(), clear: h.clear, isLoading: false };
  },
}));
vi.mock("@/providers/session-provider", () => ({
  useSession: () => ({ user: { id: "u1" }, activeCompanyId: "co1", can: () => true }),
}));
vi.mock("@/components/ui/toast", () => ({ useToast: () => ({ toast: h.toast }) }));
vi.mock("@/features/copilot/components/suggest-reply", () => ({
  SuggestReplyButton: ({ onInsert }: { onInsert: (t: string) => void }) => (
    <button type="button" aria-label="Sugerir resposta com IA" onClick={() => onInsert("sugestão IA")}>
      IA
    </button>
  ),
}));

import { Composer } from "@/features/inbox/components/composer/composer";

const baseProps = {
  conversationId: "c1",
  canSendPerm: true,
  canNotePerm: true,
  sendabilityCanSend: true,
  sendabilityMessage: "",
  sendabilityDetail: null,
  replyTarget: null,
  onClearReply: vi.fn(),
};
const render$ = (over: Partial<React.ComponentProps<typeof Composer>> = {}) =>
  render(<Composer {...baseProps} {...over} />);

beforeEach(() => {
  if (!globalThis.crypto?.randomUUID) {
    // @ts-expect-error stub para jsdom
    globalThis.crypto = { ...globalThis.crypto, randomUUID: () => "uuid-test" };
  }
  vi.stubGlobal("URL", { ...URL, createObjectURL: () => "blob:x", revokeObjectURL: () => {} });
});
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("Composer (F3)", () => {
  it("modo RESPONDER: envia público e limpa o rascunho — NUNCA chama o endpoint de nota", async () => {
    render$();
    const box = screen.getByLabelText("Mensagem");
    await userEvent.type(box, "olá cliente");
    await userEvent.type(box, "{Enter}");
    expect(h.sendMutate).toHaveBeenCalledTimes(1);
    expect(h.sendMutate.mock.calls[0][0]).toMatchObject({ text: "olá cliente" });
    expect(h.clear).toHaveBeenCalled(); // rascunho limpo no envio
    expect(h.noteMutateAsync).not.toHaveBeenCalled(); // anti-vazamento
  });

  it("modo NOTA: roteia para o endpoint de nota — NUNCA para o envio público (anti-vazamento)", async () => {
    render$();
    await userEvent.click(screen.getByRole("tab", { name: /nota interna/i }));
    const box = screen.getByLabelText("Nota interna");
    await userEvent.type(box, "cliente é VIP");
    await userEvent.type(box, "{Enter}");
    expect(h.noteMutateAsync).toHaveBeenCalledTimes(1);
    expect(h.noteMutateAsync.mock.calls[0][0]).toMatchObject({ text: "cliente é VIP" });
    expect(h.sendMutate).not.toHaveBeenCalled(); // NUNCA envia nota como pública
    expect(h.clear).not.toHaveBeenCalled(); // nota não mexe no rascunho público
  });

  it("bloqueia RESPONDER sem permissão de envio (input desabilitado + motivo)", () => {
    render$({ canSendPerm: false });
    expect(screen.getByText(/não tem permissão para enviar/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Mensagem")).toBeDisabled();
  });

  it("bloqueia RESPONDER fora da janela de 24h (requiresTemplate)", () => {
    render$({
      sendabilityDetail: {
        canSend: true, reasonCode: null, retryable: false, connectionStatus: "CONNECTED",
        channel: "WHATSAPP", allowedMessageTypes: ["TEMPLATE"], requiresTemplate: true,
        replyWindow: { hasWindow: true, windowSeconds: 86400, expiresAt: null, withinWindow: false },
        supportedMimeTypes: [],
      },
    });
    expect(screen.getByText(/janela de 24h/i)).toBeInTheDocument();
  });

  it("NOTA continua disponível mesmo com envio público bloqueado (nota é interna)", async () => {
    render$({ canSendPerm: false, sendabilityCanSend: false, sendabilityMessage: "Conexão indisponível" });
    await userEvent.click(screen.getByRole("tab", { name: /nota interna/i }));
    const box = screen.getByLabelText("Nota interna");
    expect(box).not.toBeDisabled();
    await userEvent.type(box, "anotação{Enter}");
    expect(h.noteMutateAsync).toHaveBeenCalledTimes(1);
  });

  it("reply target: mostra a prévia e cancela", async () => {
    const onClearReply = vi.fn();
    render$({ replyTarget: { id: "m1", preview: "pergunta do cliente" }, onClearReply });
    expect(screen.getByText(/Respondendo a:/)).toBeInTheDocument();
    expect(screen.getByText("pergunta do cliente")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /cancelar resposta/i }));
    expect(onClearReply).toHaveBeenCalled();
  });
});

const pngFile = (name = "foto.png") => new File([new Uint8Array(10)], name, { type: "image/png" });

describe("Composer — anexos (F5)", () => {
  it("anexar imagem mostra o preview e habilita o envio de imagem", async () => {
    render$();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    await userEvent.upload(input, pngFile("foto.png"));
    expect(screen.getByText("foto.png")).toBeInTheDocument();
    // imagem É enviável: sem aviso de "só imagens" e botão "Enviar imagem" habilitado
    expect(screen.queryByText(/só é possível enviar imagens/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar imagem" })).not.toBeDisabled();
  });

  it("remover o anexo limpa a bandeja e reabilita o texto", async () => {
    render$();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, pngFile("foto.png"));
    await userEvent.click(screen.getByRole("button", { name: "Remover foto.png" }));
    expect(screen.queryByText("foto.png")).not.toBeInTheDocument();
    expect(screen.queryByText(/não podem ser enviados/i)).not.toBeInTheDocument();
  });

  it("modo NOTA não expõe anexar (anexos só no público)", async () => {
    render$();
    await userEvent.click(screen.getByRole("tab", { name: /nota interna/i }));
    expect(screen.queryByRole("button", { name: "Anexar arquivo" })).not.toBeInTheDocument();
  });

  it("bloqueio de envio (sem permissão) também esconde anexar", () => {
    render$({ canSendPerm: false });
    expect(screen.queryByRole("button", { name: "Anexar arquivo" })).not.toBeInTheDocument();
  });
});

describe("Composer — Copilot (F7)", () => {
  it("inserir sugestão APPENDA ao rascunho (não substitui) e NUNCA envia", async () => {
    render$();
    const box = screen.getByLabelText("Mensagem") as HTMLTextAreaElement;
    await userEvent.type(box, "oi");
    await userEvent.click(screen.getByRole("button", { name: /sugerir resposta com ia/i }));
    expect(box.value).toContain("oi"); // preservou o texto do operador
    expect(box.value).toContain("sugestão IA"); // inseriu a sugestão
    expect(h.sendMutate).not.toHaveBeenCalled(); // nunca envia automaticamente
  });
});
