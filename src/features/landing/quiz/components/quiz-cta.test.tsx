import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const track = vi.fn();
vi.mock("../analytics/track", () => ({ track: (...a: unknown[]) => track(...a) }));
vi.mock("@/features/landing/quiz/analytics/track", () => ({ track: (...a: unknown[]) => track(...a) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

import { QuizProvider } from "./quiz-provider";
import { QuizTrigger } from "./quiz-trigger";
import { QuizStickyCta } from "@/components/site/landing/quiz-sticky-cta";

beforeEach(() => {
  track.mockClear();
  window.localStorage.clear();
});

describe("QuizTrigger — atribuição de origem", () => {
  it("dispara quiz_open com o source ao clicar", async () => {
    const user = userEvent.setup();
    render(
      <QuizProvider active="default">
        <QuizTrigger variant="strip" label="Fazer diagnóstico" source="proof" />
      </QuizProvider>,
    );
    await user.click(screen.getByRole("button", { name: /fazer diagnóstico/i }));
    expect(track).toHaveBeenCalledWith("quiz_open", { source: "proof" });
  });
});

describe("QuizStickyCta", () => {
  it("fica escondido no topo e aparece ao rolar além do hero", async () => {
    render(
      <QuizProvider active="default">
        <QuizStickyCta />
      </QuizProvider>,
    );
    // topo: nada visível
    expect(screen.queryByRole("button", { name: /diagnóstico/i })).not.toBeInTheDocument();

    // simula rolagem além do hero e longe do rodapé
    Object.defineProperty(window, "scrollY", { value: 2000, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 6000, configurable: true });
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
      await new Promise((r) => setTimeout(r, 30));
    });

    expect(await screen.findByRole("button", { name: /diagnóstico/i })).toBeInTheDocument();
  });
});
