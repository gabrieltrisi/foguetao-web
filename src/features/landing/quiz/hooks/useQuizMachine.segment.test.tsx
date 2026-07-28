import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const track = vi.fn();
vi.mock("../analytics/track", () => ({ track: (...args: unknown[]) => track(...args) }));

import { useQuizMachine } from "./useQuizMachine";
import { QUESTIONS } from "../constants/questions";
import { QUIZ_STORAGE_KEY } from "../constants/storage";

beforeEach(() => {
  track.mockClear();
  window.localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("useQuizMachine — segmento é a 1ª pergunta", () => {
  it("a primeira pergunta é o segmento", () => {
    expect(QUESTIONS[0].id).toBe("segmento");
    const { result } = renderHook(() => useQuizMachine());
    expect(result.current.currentQuestion.id).toBe("segmento");
    expect(result.current.stepIndex).toBe(0);
  });

  it("responder o segmento dispara quiz_segment_selected com o segmento canônico", () => {
    const { result } = renderHook(() => useQuizMachine());
    act(() => result.current.select("clinica"));
    expect(track).toHaveBeenCalledWith("quiz_segment_selected", {
      segment: "clinica",
      source: "quiz",
      quizVersion: "lp3.1",
    });
  });

  it("mapeia label → chave canônica (ecommerce → loja)", () => {
    const { result } = renderHook(() => useQuizMachine());
    act(() => result.current.select("ecommerce"));
    expect(track).toHaveBeenCalledWith(
      "quiz_segment_selected",
      expect.objectContaining({ segment: "loja" }),
    );
  });
});

describe("useQuizMachine — migração de progresso (LP3.1)", () => {
  it("progresso antigo SEM segmento retoma no passo 0 (não assume nicho)", () => {
    window.localStorage.setItem(
      QUIZ_STORAGE_KEY,
      JSON.stringify({ v: 1, step: 3, answers: { dor: "followup", equipe: "media" } }),
    );
    const { result } = renderHook(() => useQuizMachine());
    expect(result.current.stepIndex).toBe(0); // volta a pedir o segmento
    expect(result.current.currentQuestion.id).toBe("segmento");
    // respostas compatíveis preservadas
    expect(result.current.answers.dor).toBe("followup");
  });

  it("progresso válido COM segmento retoma no passo salvo", () => {
    window.localStorage.setItem(
      QUIZ_STORAGE_KEY,
      JSON.stringify({ v: 1, step: 2, answers: { segmento: "academia", dor: "followup" } }),
    );
    const { result } = renderHook(() => useQuizMachine());
    expect(result.current.stepIndex).toBe(2);
    expect(result.current.restored).toBe(true);
  });
});
