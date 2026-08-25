import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const q = (data: unknown, over: Record<string, unknown> = {}) => ({
  data, isLoading: false, isError: false, refetch: vi.fn(), ...over,
});

const m = vi.hoisted(() => ({
  contact: undefined as unknown,
  org: undefined as unknown,
  deals: undefined as unknown,
  stages: undefined as unknown,
  tasks: undefined as unknown,
  notes: undefined as unknown,
  activities: undefined as unknown,
  createNote: vi.fn(),
  completeTask: vi.fn(),
  toast: vi.fn(),
  can: (_p: string): boolean => true,
}));

vi.mock("@/hooks/crm/use-contact-detail", () => ({
  useContact: () => m.contact,
  useCreateNote: () => ({ mutate: m.createNote, isPending: false }),
}));
vi.mock("@/hooks/crm/use-organizations", () => ({ useOrganization: () => m.org }));
vi.mock("@/hooks/crm/use-deals", () => ({ useDeals: () => m.deals }));
vi.mock("@/hooks/crm/use-pipelines", () => ({ usePipelineStages: () => m.stages }));
vi.mock("@/hooks/crm/use-tasks", () => ({
  useTasks: () => m.tasks,
  useCompleteTask: () => ({ mutate: m.completeTask, isPending: false }),
}));
vi.mock("@/hooks/crm/use-contact-lists", () => ({
  useContactNotes: () => m.notes,
  useContactActivities: () => m.activities,
}));
vi.mock("@/providers/session-provider", () => ({
  useSession: () => ({ user: { id: "u1" }, activeCompanyId: "co1", can: (p: string) => m.can(p) }),
}));
vi.mock("@/components/ui/toast", () => ({ useToast: () => ({ toast: m.toast }) }));

import { ContactCard } from "@/features/inbox/components/context/contact-card";
import { CompanyCard } from "@/features/inbox/components/context/company-card";
import { DealsCard } from "@/features/inbox/components/context/deals-card";
import { ActivitiesCard } from "@/features/inbox/components/context/activities-card";
import { NotesCard } from "@/features/inbox/components/context/notes-card";
import { TasksCard } from "@/features/inbox/components/context/tasks-card";
import { FilesCard } from "@/features/inbox/components/context/files-card";
import { InfoCard } from "@/features/inbox/components/context/info-card";

beforeEach(() => {
  m.contact = q({ contact: { fullName: "Ana Lima", jobTitle: "Compradora", phone: "+55 11 90000-0000", email: "ana@x.com", source: "WHATSAPP", status: "ACTIVE", lastActivityAt: "2026-07-27T10:00:00Z", organizationId: "org1", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-07-01T00:00:00Z" }, organization: { id: "org1", name: "Acme" }, assignee: { id: "u9", name: "Bia" }, tags: [{ id: "t1", name: "VIP", color: "#f00" }] });
  m.org = q({ id: "org1", name: "Acme", industry: "Varejo", size: "SMALL", website: "acme.com" });
  m.deals = q({ items: [{ id: "d1", title: "Plano Pro", value: "1500.00", currency: "BRL", status: "OPEN", priority: "HIGH", pipelineId: "p1", stageId: "s1" }] });
  m.stages = q([{ id: "s1", name: "Proposta", color: null, probability: 40 }]);
  m.tasks = q({ items: [{ id: "tk1", title: "Ligar para Ana", status: "PENDING", priority: "HIGH", dueAt: "2026-08-01T00:00:00Z", assignedToUserId: "u1" }] });
  m.notes = q({ items: [{ id: "n1", content: "Cliente pediu desconto", createdAt: "2026-07-20T00:00:00Z", authorUserId: "u1", pinned: false }] });
  m.activities = q({ items: [{ id: "a1", type: "STATUS_CHANGED", title: "Status alterado", occurredAt: "2026-07-25T00:00:00Z", userId: "u1" }] });
  m.can = () => true;
});
afterEach(() => vi.clearAllMocks());

describe("Cards do Painel Contextual (F6)", () => {
  it("Contato: nome/e-mail/origem; denied sem permissão", () => {
    const { rerender } = render(<ContactCard contactId="c1" channel="WHATSAPP" />);
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
    expect(screen.getByText("ana@x.com")).toBeInTheDocument();
    m.can = (p) => p !== "crm.contacts.read";
    rerender(<ContactCard contactId="c1" channel="WHATSAPP" />);
    expect(screen.getByText(/sem permissão/i)).toBeInTheDocument();
  });

  it("Empresa: nome/segmento; vazio quando sem organização", () => {
    render(<CompanyCard organizationId="org1" />);
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Varejo")).toBeInTheDocument();
    render(<CompanyCard organizationId={null} />);
    expect(screen.getByText(/sem empresa vinculada/i)).toBeInTheDocument();
  });

  it("Negócios: título + valor formatado + etapa", () => {
    render(<DealsCard contactId="c1" />);
    expect(screen.getByText("Plano Pro")).toBeInTheDocument();
    expect(screen.getByText(/1\.500,00|R\$/)).toBeInTheDocument();
    expect(screen.getByText(/Proposta/)).toBeInTheDocument();
  });

  it("Atividades: lista o feed", () => {
    render(<ActivitiesCard contactId="c1" />);
    expect(screen.getByText("Status alterado")).toBeInTheDocument();
  });

  it("Notas: lê nota e cria (texto puro) chamando a mutation", async () => {
    render(<NotesCard contactId="c1" />);
    expect(screen.getByText("Cliente pediu desconto")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Nova nota"), "nova obs");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    expect(m.createNote).toHaveBeenCalledWith({ content: "nova obs" }, expect.anything());
  });

  it("Notas: sem permissão de criar → sem campo de nota", () => {
    m.can = (p) => p !== "crm.notes.create";
    render(<NotesCard contactId="c1" />);
    expect(screen.queryByLabelText("Nova nota")).not.toBeInTheDocument();
    expect(screen.getByText("Cliente pediu desconto")).toBeInTheDocument();
  });

  it("Tarefas: lista + concluir chama a mutation (com permissão)", async () => {
    render(<TasksCard contactId="c1" />);
    expect(screen.getByText("Ligar para Ana")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Concluir tarefa/i }));
    expect(m.completeTask).toHaveBeenCalled();
  });

  it("Arquivos: estado vazio (lacuna de contrato documentada)", () => {
    render(<FilesCard />);
    expect(screen.getByText(/sem arquivos no crm/i)).toBeInTheDocument();
  });

  it("Informações: responsável + tag", () => {
    render(<InfoCard contactId="c1" />);
    expect(screen.getByText("Bia")).toBeInTheDocument(); // responsável (assignee)
    expect(screen.getByText("VIP")).toBeInTheDocument(); // tag
  });
});
