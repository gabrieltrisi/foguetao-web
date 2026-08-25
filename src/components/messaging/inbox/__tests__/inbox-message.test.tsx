import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InboxMessage } from "@/components/messaging/inbox/inbox-message";
import type { ApiPublicMessage } from "@/types/api/messaging";

function msg(over: Partial<ApiPublicMessage> = {}): ApiPublicMessage {
  return {
    id: "m1",
    direction: "OUTBOUND",
    type: "TEXT",
    text: "Olá",
    status: "SENT",
    createdAt: "2026-07-16T12:00:00.000Z",
    scheduledAt: null,
    sentAt: "2026-07-16T12:00:00.000Z",
    deliveredAt: null,
    readAt: null,
    failedAt: null,
    failure: null,
    ...over,
  };
}

describe("InboxMessage (Bloco 2)", () => {
  it("posiciona inbound à esquerda e outbound à direita", () => {
    const { rerender, container } = render(<InboxMessage message={msg({ direction: "OUTBOUND" })} />);
    expect(container.querySelector('[data-direction="OUTBOUND"]')?.className).toContain("justify-end");
    rerender(<InboxMessage message={msg({ direction: "INBOUND" })} />);
    expect(container.querySelector('[data-direction="INBOUND"]')?.className).toContain("justify-start");
  });

  it("renderiza texto puro preservando quebras de linha (sem HTML)", () => {
    const { container } = render(<InboxMessage message={msg({ text: "linha 1\nlinha 2" })} />);
    const p = container.querySelector("p.whitespace-pre-wrap");
    expect(p?.textContent).toBe("linha 1\nlinha 2");
    // Não injeta HTML: uma tag em texto vira texto literal, não elemento.
    render(<InboxMessage message={msg({ id: "m2", text: "<b>x</b>" })} />);
    expect(screen.getByText("<b>x</b>")).toBeInTheDocument();
  });

  it.each([
    ["QUEUED", "Na fila"],
    ["SENDING", "Enviando"],
    ["SENT", "Enviada"],
    ["DELIVERED", "Entregue"],
    ["READ", "Lida"],
    ["FAILED", "Falhou"],
  ] as const)("mostra o status público %s como '%s' nas outbound", (status, label) => {
    render(<InboxMessage message={msg({ status })} />);
    expect(screen.getByLabelText(label)).toBeInTheDocument();
  });

  it("NÃO mostra status em mensagens inbound", () => {
    render(<InboxMessage message={msg({ direction: "INBOUND", status: "DELIVERED" })} />);
    expect(screen.queryByLabelText("Entregue")).not.toBeInTheDocument();
  });

  it("FAILED exibe a mensagem sanitizada do failure quando existe", () => {
    render(
      <InboxMessage
        message={msg({
          status: "FAILED",
          failure: { code: "CONNECTION_REVOKED", retryable: false, message: "Conexão indisponível." },
        })}
      />,
    );
    expect(screen.getByText("Conexão indisponível.")).toBeInTheDocument();
    // Nunca vaza o code técnico.
    expect(screen.queryByText(/CONNECTION_/)).not.toBeInTheDocument();
  });

  it("FAILED sem message usa texto genérico (não expõe code)", () => {
    render(
      <InboxMessage
        message={msg({ status: "FAILED", failure: { code: "CONNECTION_FAILED", retryable: true, message: null } })}
      />,
    );
    expect(screen.getByText("Não foi possível enviar esta mensagem.")).toBeInTheDocument();
    expect(screen.queryByText(/CONNECTION_/)).not.toBeInTheDocument();
  });

  it("mídia usa o placeholder vindo do backend (text) e cai em rótulo neutro se nulo", () => {
    render(<InboxMessage message={msg({ id: "img", type: "IMAGE", text: "[Imagem] foto.jpg" })} />);
    expect(screen.getByText("[Imagem] foto.jpg")).toBeInTheDocument();
    render(<InboxMessage message={msg({ id: "doc", type: "DOCUMENT", text: null })} />);
    expect(screen.getByText("Documento")).toBeInTheDocument();
  });

  it("centraliza mensagens SYSTEM", () => {
    const { container } = render(<InboxMessage message={msg({ direction: "SYSTEM", text: "Conversa iniciada" })} />);
    expect(screen.getByText("Conversa iniciada")).toBeInTheDocument();
    expect(container.querySelector(".justify-center")).toBeInTheDocument();
  });

  it("mensagem agendada (QUEUED + scheduledAt) mostra badge 'Agendada' e botão Cancelar", async () => {
    const onCancel = vi.fn();
    render(
      <InboxMessage
        message={msg({ id: "sched", status: "QUEUED", scheduledAt: "2099-01-01T15:30:00.000Z", sentAt: null })}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByText(/Agendada/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Cancelar/i }));
    expect(onCancel).toHaveBeenCalledWith("sched");
  });

  it("sem onCancel (sem permissão) não mostra o botão Cancelar na agendada", () => {
    render(
      <InboxMessage
        message={msg({ status: "QUEUED", scheduledAt: "2099-01-01T15:30:00.000Z", sentAt: null })}
      />,
    );
    expect(screen.getByText(/Agendada/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Cancelar/i })).not.toBeInTheDocument();
  });

  it("mensagem CANCELED mostra 'Cancelada' e não mostra badge de agendamento", () => {
    render(<InboxMessage message={msg({ status: "CANCELED", scheduledAt: "2099-01-01T15:30:00.000Z" })} />);
    expect(screen.getByText("Cancelada")).toBeInTheDocument();
    expect(screen.queryByText(/Agendada/)).not.toBeInTheDocument();
  });

  it("ignora qualquer campo de provider anexado (sanitização)", () => {
    const leaky = { ...msg(), externalMessageId: "ext-123", clientMessageId: "cli-9" } as unknown as ApiPublicMessage;
    render(<InboxMessage message={leaky} />);
    expect(screen.queryByText(/ext-123/)).not.toBeInTheDocument();
    expect(screen.queryByText(/cli-9/)).not.toBeInTheDocument();
  });
});
