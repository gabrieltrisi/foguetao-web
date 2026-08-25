import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../analytics/track", () => ({ track: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import { QuizProvider } from "./quiz-provider";
import { QuizTrigger } from "./quiz-trigger";
import { QuizEntry } from "./QuizEntry";

beforeEach(() => {
  window.localStorage.clear();
});

describe("QuizProvider + QuizTrigger", () => {
  it("QuizEntry renderiza o gatilho do hero", () => {
    render(
      <QuizProvider active="default">
        <QuizEntry />
      </QuizProvider>,
    );
    const trigger = screen.getByRole("button", { name: /descobrir meu plano em 60s/i });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("um gatilho abre o overlay compartilhado (lazy)", async () => {
    const user = userEvent.setup();
    render(
      <QuizProvider active="default">
        <QuizTrigger variant="strip" label="Fazer meu diagnóstico" />
      </QuizProvider>,
    );
    await user.click(screen.getByRole("button", { name: /fazer meu diagnóstico/i }));
    expect(await screen.findByRole("dialog", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(await screen.findByText(/qual é o segmento da sua empresa/i)).toBeInTheDocument();
  }, 15000);

  it("useQuiz fora do provider lança erro", () => {
    // Silencia o erro esperado do React ao renderizar sem provider.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<QuizTrigger />)).toThrow(/QuizProvider/);
    spy.mockRestore();
  });
});
