import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";

function Consumer() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  return (
    <div>
      <span data-testid="collapsed">{String(collapsed)}</span>
      <span data-testid="mobile">{String(mobileOpen)}</span>
      <button onClick={toggleCollapsed}>toggle</button>
      <button onClick={() => setMobileOpen(true)}>open-mobile</button>
      <button onClick={() => setMobileOpen(false)}>close-mobile</button>
    </div>
  );
}

describe("useSidebar", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => window.localStorage.clear());

  it("inicia expandida e alterna o estado recolhido persistindo em localStorage", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Consumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId("collapsed")).toHaveTextContent("false");

    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("collapsed")).toHaveTextContent("true");
    expect(window.localStorage.getItem("foguetao:sidebar-collapsed")).toBe("true");

    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("collapsed")).toHaveTextContent("false");
    expect(window.localStorage.getItem("foguetao:sidebar-collapsed")).toBe("false");
  });

  it("controla o estado do drawer mobile", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Consumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId("mobile")).toHaveTextContent("false");
    await user.click(screen.getByRole("button", { name: "open-mobile" }));
    expect(screen.getByTestId("mobile")).toHaveTextContent("true");
    await user.click(screen.getByRole("button", { name: "close-mobile" }));
    expect(screen.getByTestId("mobile")).toHaveTextContent("false");
  });
});
