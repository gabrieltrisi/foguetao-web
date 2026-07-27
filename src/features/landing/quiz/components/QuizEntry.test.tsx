import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../analytics/track", () => ({ track: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import { QuizEntry } from "./QuizEntry";

beforeEach(() => {
  window.localStorage.clear();
});

describe("QuizEntry", () => {
  it("renderiza o gatilho do diagnóstico no hero", () => {
    render(<QuizEntry active="default" />);
    const trigger = screen.getByRole("button", { name: /descobrir meu plano em 60s/i });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("abre o overlay (carregado sob demanda) ao clicar", async () => {
    const user = userEvent.setup();
    render(<QuizEntry active="default" />);
    await user.click(screen.getByRole("button", { name: /descobrir meu plano em 60s/i }));
    // O overlay é carregado sob demanda (next/dynamic) — dá folga p/ o chunk resolver.
    expect(await screen.findByRole("dialog", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(await screen.findByText(/qual é o seu segmento/i)).toBeInTheDocument();
  }, 15000);
});
