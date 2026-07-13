import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarSection } from "@/components/navigation/sidebar-section";
import { navSections } from "@/config/nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

const principal = navSections[0];
const crm = navSections[1];
const comunicacao = navSections.find((s) => s.title === "Comunicação")!;

describe("SidebarSection", () => {
  it("renderiza o título do grupo e todos os itens com os hrefs corretos", () => {
    render(<SidebarSection section={crm} collapsed={false} />);
    expect(screen.getByText("CRM")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Contatos/ })).toHaveAttribute("href", "/contacts");
    expect(screen.getByRole("link", { name: /Pipeline/ })).toHaveAttribute("href", "/pipeline");
    expect(screen.getByRole("link", { name: /Oportunidades/ })).toHaveAttribute("href", "/deals");
  });

  it("marca o item da rota atual como página ativa", () => {
    render(<SidebarSection section={principal} collapsed={false} />);
    const active = screen.getByRole("link", { name: /Visão geral/ });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(active.className).toContain("bg-brand-soft");
  });

  it("desabilita itens marcados como indisponíveis e exibe badge 'Em breve'", () => {
    render(<SidebarSection section={comunicacao} collapsed={false} />);
    expect(screen.getByText("Em breve")).toBeInTheDocument();
    // Item desabilitado não deve ser um link navegável.
    expect(screen.queryByRole("link", { name: /Grupos/ })).not.toBeInTheDocument();
  });
});
