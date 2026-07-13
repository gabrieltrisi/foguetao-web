import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

function Harness() {
  const { setMobileOpen } = useSidebar();
  return (
    <>
      <button onClick={() => setMobileOpen(true)}>abrir menu</button>
      <MobileDrawer />
    </>
  );
}

describe("MobileDrawer", () => {
  it("abre com a navegação e fecha pelo botão de fechar", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Harness />
      </SidebarProvider>,
    );

    // Fechado: os itens não estão no DOM.
    expect(screen.queryByRole("link", { name: /Contatos/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "abrir menu" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Contatos/ })).toHaveAttribute("href", "/contacts");

    await user.click(screen.getByRole("button", { name: "Fechar menu" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
