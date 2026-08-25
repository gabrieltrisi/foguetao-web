import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InboxComposer } from "@/components/messaging/inbox/inbox-composer";

function typeInto(value: string) {
  const textarea = screen.getByLabelText("Mensagem") as HTMLTextAreaElement;
  fireEvent.change(textarea, { target: { value } });
  return textarea;
}

describe("InboxComposer (Bloco 3 — envio)", () => {
  it("envia com Enter e LIMPA o texto só no sucesso (202)", async () => {
    const onSend = vi.fn().mockResolvedValue({});
    render(<InboxComposer canSend onSend={onSend} />);
    const textarea = typeInto("Olá mundo");
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("Olá mundo", undefined); // imediato = sem sendAt
    await waitFor(() => expect(textarea.value).toBe(""));
  });

  it("Shift+Enter NÃO envia (quebra de linha)", () => {
    const onSend = vi.fn().mockResolvedValue({});
    render(<InboxComposer canSend onSend={onSend} />);
    const textarea = typeInto("linha");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("PRESERVA o texto quando o envio falha", async () => {
    const onSend = vi.fn().mockRejectedValue(new Error("boom"));
    render(<InboxComposer canSend onSend={onSend} />);
    const textarea = typeInto("mensagem importante");
    fireEvent.click(screen.getByLabelText("Enviar"));
    await waitFor(() => expect(onSend).toHaveBeenCalled());
    expect(textarea.value).toBe("mensagem importante");
  });

  it("bloqueia envio acima de 8192 caracteres", () => {
    const onSend = vi.fn().mockResolvedValue({});
    render(<InboxComposer canSend onSend={onSend} />);
    typeInto("a".repeat(8193));
    expect(screen.getByLabelText("Enviar")).toBeDisabled();
  });

  it("não envia texto vazio / só espaços", () => {
    const onSend = vi.fn().mockResolvedValue({});
    render(<InboxComposer canSend onSend={onSend} />);
    typeInto("   ");
    expect(screen.getByLabelText("Enviar")).toBeDisabled();
  });

  it("quando canSend=false mostra a razão humana e não expõe campo de envio", () => {
    render(<InboxComposer canSend={false} disabledReason="A conta está desconectada no momento." />);
    expect(screen.getByText("A conta está desconectada no momento.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Enviar")).not.toBeInTheDocument();
  });

  it("shell desabilitado quando não há onSend (Bloco 2): campo inerte", () => {
    render(<InboxComposer canSend />);
    expect(screen.getByLabelText("Mensagem")).toBeDisabled();
    expect(screen.getByLabelText("Enviar")).toBeDisabled();
  });

  /* ---------- Sprint 7.2: agendamento ---------- */

  it("agendar: abre o seletor, mostra o fuso e envia com sendAt ISO absoluto", async () => {
    const onSend = vi.fn().mockResolvedValue({});
    render(<InboxComposer canSend onSend={onSend} />);
    typeInto("mensagem futura");

    fireEvent.click(screen.getByLabelText("Agendar mensagem"));
    expect(screen.getByText(/Fuso:/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Data e hora do envio"), {
      target: { value: "2099-01-01T15:30" },
    });
    expect(screen.getByText(/Esta mensagem será enviada em/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Agendar" }));
    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(1));
    const [text, sendAt] = onSend.mock.calls[0];
    expect(text).toBe("mensagem futura");
    expect(typeof sendAt).toBe("string");
    expect(new Date(sendAt as string).getUTCFullYear()).toBe(2099);
  });

  it("agendar com data vazia mantém 'Agendar' desabilitado (não envia)", () => {
    const onSend = vi.fn().mockResolvedValue({});
    render(<InboxComposer canSend onSend={onSend} />);
    typeInto("x");
    fireEvent.click(screen.getByLabelText("Agendar mensagem"));
    expect(screen.getByRole("button", { name: "Agendar" })).toBeDisabled();
    expect(onSend).not.toHaveBeenCalled();
  });
});
