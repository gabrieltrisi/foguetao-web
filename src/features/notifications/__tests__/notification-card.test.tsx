import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ApiNotification } from "@/types/api/notifications";
import { NotificationCard } from "../components/notification-card";

const NOW = new Date("2026-07-28T12:00:00Z");

function notification(over: Partial<ApiNotification> = {}): ApiNotification {
  return {
    id: "n1",
    type: "DEAL",
    priority: "URGENT",
    title: "Negócio movido",
    message: "O negócio ACME foi para Proposta.",
    resourceType: "deal",
    resourceId: "d1",
    actionUrl: "/crm/deals/d1",
    metadata: null,
    read: false,
    readAt: null,
    archived: false,
    archivedAt: null,
    createdAt: new Date(NOW.getTime() - 5 * 60 * 1000).toISOString(),
    updatedAt: NOW.toISOString(),
    ...over,
  };
}

describe("NotificationCard", () => {
  it("mostra título, mensagem, prioridade e tempo relativo", () => {
    render(
      <NotificationCard
        notification={notification()}
        now={NOW}
        canManage
        onMarkRead={vi.fn()}
        onArchive={vi.fn()}
      />,
    );
    expect(screen.getByText("Negócio movido")).toBeInTheDocument();
    expect(screen.getByText(/ACME/)).toBeInTheDocument();
    expect(screen.getByText("Urgente")).toBeInTheDocument();
    expect(screen.getByText("há 5 min")).toBeInTheDocument();
  });

  it("dispara marcar lida e arquivar", () => {
    const onMarkRead = vi.fn();
    const onArchive = vi.fn();
    render(
      <NotificationCard
        notification={notification()}
        now={NOW}
        canManage
        onMarkRead={onMarkRead}
        onArchive={onArchive}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /marcar lida/i }));
    fireEvent.click(screen.getByRole("button", { name: /arquivar/i }));
    expect(onMarkRead).toHaveBeenCalledWith("n1");
    expect(onArchive).toHaveBeenCalledWith("n1");
  });

  it("abre o recurso quando há actionUrl", () => {
    const onOpen = vi.fn();
    render(
      <NotificationCard
        notification={notification()}
        now={NOW}
        canManage
        onMarkRead={vi.fn()}
        onArchive={vi.fn()}
        onOpen={onOpen}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /abrir/i }));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: "n1" }));
  });

  it("não mostra 'marcar lida' quando já lida", () => {
    render(
      <NotificationCard
        notification={notification({ read: true, readAt: NOW.toISOString() })}
        now={NOW}
        canManage
        onMarkRead={vi.fn()}
        onArchive={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /marcar lida/i })).not.toBeInTheDocument();
  });

  it("sem permissão de gestão, não mostra ações de mutação", () => {
    render(
      <NotificationCard
        notification={notification()}
        now={NOW}
        canManage={false}
        onMarkRead={vi.fn()}
        onArchive={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /marcar lida/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /arquivar/i })).not.toBeInTheDocument();
  });
});
