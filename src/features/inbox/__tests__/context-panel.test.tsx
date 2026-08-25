import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const h = vi.hoisted(() => ({ conv: undefined as unknown }));

vi.mock("@/hooks/messaging/use-conversations", () => ({ useConversation: () => h.conv }));
vi.mock("@/hooks/crm/use-contact-detail", () => ({
  useContact: () => ({ data: { contact: { organizationId: "org1" } } }),
}));
// Stubs dos cards para isolar a LÓGICA do painel (componentes que renderizam o nome).
vi.mock("@/features/copilot/components/copilot-section", () => ({ CopilotSection: () => "CopilotSection" }));
vi.mock("@/features/inbox/components/context/contact-card", () => ({ ContactCard: () => "ContactCard" }));
vi.mock("@/features/inbox/components/context/company-card", () => ({ CompanyCard: () => "CompanyCard" }));
vi.mock("@/features/inbox/components/context/deals-card", () => ({ DealsCard: () => "DealsCard" }));
vi.mock("@/features/inbox/components/context/activities-card", () => ({ ActivitiesCard: () => "ActivitiesCard" }));
vi.mock("@/features/inbox/components/context/notes-card", () => ({ NotesCard: () => "NotesCard" }));
vi.mock("@/features/inbox/components/context/tasks-card", () => ({ TasksCard: () => "TasksCard" }));
vi.mock("@/features/inbox/components/context/files-card", () => ({ FilesCard: () => "FilesCard" }));
vi.mock("@/features/inbox/components/context/info-card", () => ({ InfoCard: () => "InfoCard" }));

import { ContextPanel } from "@/features/inbox/components/context/context-panel";

afterEach(() => vi.clearAllMocks());

describe("ContextPanel (F6)", () => {
  it("sem contato vinculado → estado vazio (contactId null)", () => {
    h.conv = { data: { contactId: null, channel: "WHATSAPP" }, isLoading: false };
    render(<ContextPanel conversationId="c1" />);
    expect(screen.getByText(/nenhum contato vinculado/i)).toBeInTheDocument();
    expect(screen.queryByText("ContactCard")).not.toBeInTheDocument();
  });

  it("com contato → compõe todas as seções", () => {
    h.conv = { data: { contactId: "ct1", channel: "WHATSAPP" }, isLoading: false };
    const { container } = render(<ContextPanel conversationId="c1" />);
    for (const s of ["CopilotSection", "ContactCard", "CompanyCard", "DealsCard", "ActivitiesCard", "NotesCard", "TasksCard", "FilesCard", "InfoCard"]) {
      expect(container.textContent).toContain(s);
    }
  });

  it("carregando a conversa → placeholder (não quebra)", () => {
    h.conv = { data: undefined, isLoading: true };
    render(<ContextPanel conversationId="c1" />);
    expect(screen.getByText(/carregando contexto/i)).toBeInTheDocument();
  });
});
