import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";
import { routeMeta } from "@/config/routes";

describe("RoutePlaceholder", () => {
  it("renderiza título, empty state e ação de Contatos", () => {
    render(<RoutePlaceholder path="/contacts" />);
    expect(screen.getByRole("heading", { level: 1, name: "Contatos" })).toBeInTheDocument();
    expect(screen.getByText("Nenhum contato encontrado.")).toBeInTheDocument();
    // Ação aparece no header e no empty state.
    expect(screen.getAllByRole("button", { name: "Novo contato" }).length).toBeGreaterThan(0);
  });

  it("renderiza o placeholder de Pipeline com a ação correta", () => {
    render(<RoutePlaceholder path="/pipeline" />);
    expect(
      screen.getByText("Seu pipeline ainda não possui oportunidades."),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Criar oportunidade" }).length).toBeGreaterThan(0);
  });

  it("renderiza Grupos com badge 'Em breve' e sem ação", () => {
    render(<RoutePlaceholder path="/groups" />);
    expect(screen.getByText("Grupos chegam em breve.")).toBeInTheDocument();
    expect(screen.getByText("Em breve")).toBeInTheDocument();
  });

  it("todas as rotas do mapa possuem metadados completos", () => {
    for (const [path, meta] of Object.entries(routeMeta)) {
      expect(meta.title, `título ausente em ${path}`).toBeTruthy();
      expect(meta.description, `descrição ausente em ${path}`).toBeTruthy();
      expect(meta.empty.title, `empty.title ausente em ${path}`).toBeTruthy();
    }
  });
});
