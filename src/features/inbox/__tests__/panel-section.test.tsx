import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PanelSection, Field } from "@/features/inbox/components/context/panel-section";

describe("PanelSection (F6) — estados isolados", () => {
  it("loading → skeleton (não mostra filhos)", () => {
    render(
      <PanelSection title="Contato" isLoading>
        <p>conteúdo</p>
      </PanelSection>,
    );
    expect(screen.queryByText("conteúdo")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Contato")).toBeInTheDocument();
  });

  it("erro → alerta + retry individual", async () => {
    const onRetry = vi.fn();
    render(<PanelSection title="Negócios" isError onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("vazio → rótulo de vazio", () => {
    render(<PanelSection title="Tarefas" isEmpty emptyLabel="Sem tarefas." />);
    expect(screen.getByText("Sem tarefas.")).toBeInTheDocument();
  });

  it("sem permissão → mensagem (informação não bloqueia o painel)", () => {
    render(
      <PanelSection title="Notas" denied>
        <p>segredo</p>
      </PanelSection>,
    );
    expect(screen.getByText(/sem permissão/i)).toBeInTheDocument();
    expect(screen.queryByText("segredo")).not.toBeInTheDocument();
  });

  it("ok → renderiza filhos", () => {
    render(
      <PanelSection title="Contato">
        <p>conteúdo</p>
      </PanelSection>,
    );
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("Field oculta valores vazios", () => {
    const { container } = render(
      <>
        <Field label="A" value="x" />
        <Field label="B" value={null} />
        <Field label="C" value="" />
      </>,
    );
    expect(container.textContent).toContain("A");
    expect(container.textContent).not.toContain("B");
  });
});
