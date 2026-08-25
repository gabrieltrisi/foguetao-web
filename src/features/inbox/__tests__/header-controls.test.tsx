import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const h = vi.hoisted(() => ({
  can: vi.fn((_p: string) => true),
  toast: vi.fn(),
  resolve: vi.fn(),
  reopen: vi.fn(),
  archive: vi.fn(),
  close: vi.fn(),
  assign: vi.fn(),
  addLabel: vi.fn(),
  removeLabel: vi.fn(),
  labels: [] as { id: string; name: string; color: string }[],
  members: [] as { value: string; label: string }[],
}));

vi.mock("@/providers/session-provider", () => ({
  useSession: () => ({ user: { id: "me" }, activeCompanyId: "co1", can: (p: string) => h.can(p) }),
}));
vi.mock("@/components/ui/toast", () => ({ useToast: () => ({ toast: h.toast }) }));
vi.mock("@/features/inbox/hooks/use-inbox-mutations", () => ({
  useChangeConversationStatus: () => ({
    resolve: { mutate: h.resolve }, reopen: { mutate: h.reopen },
    archive: { mutate: h.archive }, close: { mutate: h.close },
  }),
  useAssignConversation: () => ({ mutate: h.assign }),
  useCreateContactFromConversation: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/features/inbox/hooks/use-inbox-labels", () => ({
  useInboxLabels: () => ({ data: h.labels, isLoading: false }),
  useConversationLabelMutation: () => ({ add: { mutate: h.addLabel }, remove: { mutate: h.removeLabel } }),
}));
vi.mock("@/features/inbox/hooks/use-inbox-members", () => ({
  useInboxAssignableMembers: () => ({ options: h.members, nameById: new Map(h.members.map((m) => [m.value, m.label])), canReadMembers: true }),
}));

import { StatusControl } from "@/features/inbox/components/header/status-control";
import { LabelControl } from "@/features/inbox/components/header/label-control";
import { AssignmentControl } from "@/features/inbox/components/header/assignment-control";

afterEach(() => {
  vi.clearAllMocks();
  h.can.mockReturnValue(true);
});

describe("StatusControl (F4)", () => {
  it("mostra o status atual", () => {
    render(<StatusControl conversationId="c1" status="OPEN" />);
    expect(screen.getByText("Aberta")).toBeInTheDocument();
  });

  it("Reabrir (sem confirmação) chama reopen", async () => {
    render(<StatusControl conversationId="c1" status="RESOLVED" />);
    await userEvent.click(screen.getByRole("button", { name: /alterar/i }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Reabrir" }));
    expect(h.reopen).toHaveBeenCalledWith("c1", expect.anything());
  });

  it("permissão: ação desabilitada sem a permissão (não escondida)", async () => {
    h.can.mockImplementation((p: string) => p !== "messaging.conversations.update"); // sem archive
    render(<StatusControl conversationId="c1" status="OPEN" />);
    await userEvent.click(screen.getByRole("button", { name: /alterar/i }));
    const archive = await screen.findByRole("menuitem", { name: "Arquivar" });
    expect(archive).toHaveAttribute("aria-disabled", "true");
  });
});

describe("LabelControl (F4)", () => {
  const labels = [{ id: "l1", name: "VIP", color: "#f00" }, { id: "l2", name: "Urgente", color: "#00f" }];
  it("mostra múltiplos chips", () => {
    render(<LabelControl conversationId="c1" labels={labels} />);
    expect(screen.getByText("VIP")).toBeInTheDocument();
    expect(screen.getByText("Urgente")).toBeInTheDocument();
  });
  it("remover chip chama remove", async () => {
    render(<LabelControl conversationId="c1" labels={labels} />);
    await userEvent.click(screen.getByRole("button", { name: "Remover etiqueta VIP" }));
    expect(h.removeLabel).toHaveBeenCalledWith({ conversationId: "c1", labelId: "l1" }, expect.anything());
  });
  it("sem permissão de etiquetar: chips em leitura (sem remover, sem adicionar)", () => {
    h.can.mockImplementation((p: string) => p !== "messaging.conversations.label");
    render(<LabelControl conversationId="c1" labels={labels} />);
    expect(screen.getByText("VIP")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remover etiqueta/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Adicionar etiqueta" })).not.toBeInTheDocument();
  });
});

describe("AssignmentControl (F4)", () => {
  it("sem permissão de atribuir: leitura apenas (sem botão)", () => {
    h.can.mockImplementation((p: string) => p !== "messaging.conversations.assign");
    render(<AssignmentControl conversationId="c1" assignedToUserId={null} version={1} />);
    expect(screen.getByText("Não atribuída")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
  it("com permissão: expõe o gatilho para alterar responsável", () => {
    render(<AssignmentControl conversationId="c1" assignedToUserId={null} version={1} />);
    expect(screen.getByRole("button", { name: /Responsável/i })).toBeInTheDocument();
  });
});

import { ConversationHeader } from "@/features/inbox/components/header/conversation-header";

describe("ConversationHeader — gatilho do contexto (F6)", () => {
  const conv = { id: "c1", status: "OPEN", labels: [], assignedToUserId: null, version: 1 } as never;
  it("botão de contexto chama onOpenContext (drawer < xl)", async () => {
    const onOpenContext = vi.fn();
    render(<ConversationHeader conversation={conv} name="Ana" onOpenContext={onOpenContext} />);
    await userEvent.click(screen.getByRole("button", { name: /ver contexto do contato/i }));
    expect(onOpenContext).toHaveBeenCalled();
  });
  it("sem onOpenContext → sem botão de contexto", () => {
    render(<ConversationHeader conversation={conv} name="Ana" />);
    expect(screen.queryByRole("button", { name: /ver contexto do contato/i })).not.toBeInTheDocument();
  });
});
