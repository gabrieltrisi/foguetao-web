import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversationListItem } from "@/features/inbox/components/list/conversation-list-item";
import type { ConversationListItemVM } from "@/features/inbox/view-models";

const NOW = new Date("2026-07-27T12:00:00");

function vm(over: Partial<ConversationListItemVM> = {}): ConversationListItemVM {
  return {
    id: "c1",
    title: "Ana",
    channel: "WHATSAPP",
    accountLabel: "Loja",
    preview: "ola tudo bem",
    previewDirection: "INBOUND",
    previewType: "TEXT",
    lastActivityAt: "2026-07-27T10:00:00",
    unread: 0,
    status: "OPEN",
    assignedToUserId: null,
    ownerId: null,
    labels: [],
    canSend: true,
    version: 0,
    ...over,
  };
}

describe("ConversationListItem", () => {
  it("mostra nome, canal, preview e status", () => {
    render(<ConversationListItem item={vm()} name="Ana" active={false} onSelect={() => {}} now={NOW} />);
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("ola tudo bem")).toBeInTheDocument();
    expect(screen.getAllByText("WhatsApp").length).toBeGreaterThan(0);
  });

  it("badge de não-lidas (99+) e aria-label", () => {
    render(<ConversationListItem item={vm({ unread: 120 })} name="Ana" active={false} onSelect={() => {}} now={NOW} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /120 não lidas/ })).toBeInTheDocument();
  });

  it("selecionado → aria-current", () => {
    render(<ConversationListItem item={vm()} name="Ana" active onSelect={() => {}} now={NOW} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-current", "true");
  });

  it("rascunho substitui a prévia", () => {
    render(<ConversationListItem item={vm()} name="Ana" active={false} hasDraft onSelect={() => {}} now={NOW} />);
    expect(screen.getByText("Rascunho")).toBeInTheDocument();
    expect(screen.queryByText("ola tudo bem")).not.toBeInTheDocument();
  });

  it("preview vazio por tipo (mídia) e até 2 labels + N", () => {
    render(
      <ConversationListItem
        item={vm({
          preview: null,
          previewType: "IMAGE",
          labels: [
            { id: "1", name: "Urgente", color: "#f00" },
            { id: "2", name: "VIP", color: "#0a0" },
            { id: "3", name: "Extra", color: "#00f" },
          ],
        })}
        name="Ana"
        active={false}
        onSelect={() => {}}
        now={NOW}
      />,
    );
    expect(screen.getByText("Imagem")).toBeInTheDocument();
    expect(screen.getByText("Urgente")).toBeInTheDocument();
    expect(screen.getByText("VIP")).toBeInTheDocument();
    expect(screen.queryByText("Extra")).not.toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("clique dispara onSelect com o id", async () => {
    const onSelect = vi.fn();
    render(<ConversationListItem item={vm()} name="Ana" active={false} onSelect={onSelect} now={NOW} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith("c1");
  });
});
