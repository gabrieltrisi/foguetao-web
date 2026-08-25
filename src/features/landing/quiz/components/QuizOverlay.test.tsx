import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../analytics/track", () => ({ track: vi.fn() }));

import { QuizOverlay } from "./QuizOverlay";

// reduced-motion = true → animações instantâneas e análise curta (fluxo determinístico).
beforeEach(() => {
  window.localStorage.clear();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function answer(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
  const dialog = screen.getByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name }));
}

describe("QuizOverlay", () => {
  it("abre no primeiro passo com dialog acessível e progresso", () => {
    render(<QuizOverlay active="default" onClose={() => {}} onSegmentResolved={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText(/qual é o segmento da sua empresa/i)).toBeInTheDocument();
    expect(screen.getByText(/pergunta 1 de 6/i)).toBeInTheDocument();
  });

  it("Escape fecha o overlay", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<QuizOverlay active="default" onClose={onClose} onSegmentResolved={() => {}} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("percorre o fluxo até o resultado, captura o lead e conclui", async () => {
    const onSegmentResolved = vi.fn();
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchSpy);
    const user = userEvent.setup();

    render(<QuizOverlay active="default" onClose={() => {}} onSegmentResolved={onSegmentResolved} />);

    await answer(user, /academia/i);
    expect(await screen.findByText(/maior dificuldade/i)).toBeInTheDocument();
    await answer(user, /follow-up/i);
    expect(await screen.findByText(/quantas pessoas vendem/i)).toBeInTheDocument();
    await answer(user, /4 a 10/i);
    expect(await screen.findByText(/quantos leads chegam/i)).toBeInTheDocument();
    await answer(user, /20 a 100/i);
    expect(await screen.findByText(/como vocês controlam/i)).toBeInTheDocument();
    await answer(user, /planilha/i);
    expect(await screen.findByText(/principal objetivo/i)).toBeInTheDocument();
    await answer(user, /ter organização/i);

    // Análise → resultado (rótulo exato distingue do texto da headline)
    expect(await screen.findByText(/analisando sua operação/i)).toBeInTheDocument();
    expect(
      await screen.findByText("Maturidade comercial", { exact: true }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(onSegmentResolved).toHaveBeenCalledWith("academia");

    // Resultado → captura
    await user.click(screen.getByRole("button", { name: /quero organizar minha operação/i }));
    expect(await screen.findByText(/plano de ação está pronto/i)).toBeInTheDocument();

    // Preenche e envia
    await user.type(screen.getByLabelText(/nome/i), "Marina Alves");
    await user.type(screen.getByLabelText(/e-mail/i), "marina@studiovitta.com");
    await user.type(screen.getByLabelText(/whatsapp/i), "(11) 99999-0000");
    await user.type(screen.getByLabelText(/empresa/i), "Studio Vitta");
    await user.click(screen.getByRole("button", { name: /ver meu diagnóstico completo/i }));

    expect(await screen.findByText(/tudo pronto/i, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledWith("/api/landing/quiz-lead", expect.objectContaining({ method: "POST" }));
  }, 20000);
});
