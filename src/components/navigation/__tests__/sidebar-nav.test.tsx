import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SquareKanban, UsersRound } from "lucide-react";
import { SidebarSection } from "@/components/navigation/sidebar-section";
import { navSections, type NavSection } from "@/config/nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

const principal = navSections[0];
const crm = navSections[1];

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
    const section: NavSection = {
      title: "Comunicação",
      items: [
        { label: "Grupos", href: "/groups", icon: UsersRound, badge: "Em breve", disabled: true },
      ],
    };
    render(<SidebarSection section={section} collapsed={false} />);
    expect(screen.getByText("Em breve")).toBeInTheDocument();
    // Item desabilitado não deve ser um link navegável.
    expect(screen.queryByRole("link", { name: /Grupos/ })).not.toBeInTheDocument();
  });

  it("oculta itens marcados como hidden (Sprint MVP 1) e some com seções vazias", () => {
    const section: NavSection = {
      title: "Marketing",
      items: [
        { label: "Pipeline", href: "/pipeline", icon: SquareKanban },
        { label: "Meta Ads", href: "/meta-ads", icon: SquareKanban, hidden: true },
      ],
    };
    const { rerender } = render(<SidebarSection section={section} collapsed={false} />);
    expect(screen.getByRole("link", { name: /Pipeline/ })).toBeInTheDocument();
    expect(screen.queryByText("Meta Ads")).not.toBeInTheDocument();

    // Seção só com itens ocultos não renderiza (nem o título).
    const emptySection: NavSection = {
      title: "Análise",
      items: [{ label: "Relatórios", href: "/reports", icon: SquareKanban, hidden: true }],
    };
    rerender(<SidebarSection section={emptySection} collapsed={false} />);
    expect(screen.queryByText("Análise")).not.toBeInTheDocument();
  });
});
