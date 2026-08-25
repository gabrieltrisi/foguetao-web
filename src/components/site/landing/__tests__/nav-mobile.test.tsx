import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavMobile } from "../nav-mobile";

describe("NavMobile", () => {
  it("abre o menu acessível com as seções e acessos", async () => {
    const user = userEvent.setup();
    render(<NavMobile registerHref="/register?segment=academia" />);

    await user.click(screen.getByRole("button", { name: /abrir menu/i }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByRole("link", { name: /produto/i })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /entrar/i })).toBeInTheDocument();
    const cta = within(dialog).getByRole("link", { name: /começar agora/i });
    expect(cta).toHaveAttribute("href", "/register?segment=academia");
  });

  it("Escape fecha o menu e devolve o foco ao gatilho", async () => {
    const user = userEvent.setup();
    render(<NavMobile />);
    const trigger = screen.getByRole("button", { name: /abrir menu/i });
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("fecha ao clicar em uma seção", async () => {
    const user = userEvent.setup();
    render(<NavMobile />);
    await user.click(screen.getByRole("button", { name: /abrir menu/i }));
    await user.click(within(screen.getByRole("dialog")).getByRole("link", { name: /perguntas/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
