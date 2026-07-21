import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SegmentSelector } from "../segment-selector";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: push }),
}));

beforeEach(() => {
  push.mockReset();
  document.cookie = "fg_segment=; max-age=0; path=/";
  window.localStorage.clear();
});

describe("SegmentSelector", () => {
  it("mostra o gatilho neutro quando não há segmento", () => {
    render(<SegmentSelector active="default" activeLabel="Geral" />);
    expect(screen.getByRole("button", { name: /ver para o meu segmento/i })).toBeInTheDocument();
  });

  it("mostra o segmento atual quando personalizado", () => {
    render(<SegmentSelector active="academia" activeLabel="Academia" />);
    expect(screen.getByRole("button", { name: /personalizado: academia/i })).toBeInTheDocument();
  });

  it("abre o modal acessível ao clicar", async () => {
    const user = userEvent.setup();
    render(<SegmentSelector active="default" activeLabel="Geral" />);
    await user.click(screen.getByRole("button", { name: /ver para o meu segmento/i }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByText(/vamos personalizar sua experiência/i)).toBeInTheDocument();
    // todas as opções de nicho aparecem
    expect(within(dialog).getByRole("button", { name: /academia/i })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /imobiliária/i })).toBeInTheDocument();
  });

  it("Escape fecha o modal e devolve o foco ao gatilho", async () => {
    const user = userEvent.setup();
    render(<SegmentSelector active="default" activeLabel="Geral" />);
    const trigger = screen.getByRole("button", { name: /ver para o meu segmento/i });
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("selecionar um segmento persiste (cookie + localStorage) e navega com ?segment=", async () => {
    const user = userEvent.setup();
    render(<SegmentSelector active="default" activeLabel="Geral" />);
    await user.click(screen.getByRole("button", { name: /ver para o meu segmento/i }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: /academia/i }));

    expect(push).toHaveBeenCalledWith("/?segment=academia", { scroll: false });
    expect(document.cookie).toContain("fg_segment=academia");
    expect(window.localStorage.getItem("fg_segment")).toBe("academia");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("o foco entra no modal ao abrir (fica preso dentro)", async () => {
    const user = userEvent.setup();
    render(<SegmentSelector active="default" activeLabel="Geral" />);
    await user.click(screen.getByRole("button", { name: /ver para o meu segmento/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});
