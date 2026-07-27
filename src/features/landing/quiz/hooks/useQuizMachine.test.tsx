import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const track = vi.fn();
vi.mock("../analytics/track", () => ({ track: (...args: unknown[]) => track(...args) }));

import { useQuizMachine } from "./useQuizMachine";

// Respostas na ordem das 6 perguntas (ids válidos por pergunta).
const ANSWERS = ["academia", "followup", "media", "medio", "planilha", "organizacao"];

function answerAll(result: { current: ReturnType<typeof useQuizMachine> }) {
  for (const value of ANSWERS) {
    act(() => result.current.select(value));
  }
}

beforeEach(() => {
  track.mockClear();
  window.localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useQuizMachine", () => {
  it("inicia na primeira pergunta e dispara quiz_started", () => {
    const { result } = renderHook(() => useQuizMachine());
    expect(result.current.phase).toBe("question");
    expect(result.current.stepIndex).toBe(0);
    expect(track).toHaveBeenCalledWith("quiz_started");
  });

  it("avança pelas perguntas e entra em análise após a última", () => {
    const { result } = renderHook(() => useQuizMachine());
    answerAll(result);
    expect(result.current.phase).toBe("analyzing");
    expect(track).toHaveBeenCalledWith("question_answered", expect.objectContaining({ question: "segmento" }));
  });

  it("gera o diagnóstico após o tempo de análise", () => {
    const { result } = renderHook(() => useQuizMachine());
    answerAll(result);
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(result.current.phase).toBe("result");
    expect(result.current.diagnosis?.segmentId).toBe("academia");
    expect(track).toHaveBeenCalledWith("diagnosis_viewed", expect.objectContaining({ segment: "academia" }));
  });

  it("permite voltar entre perguntas", () => {
    const { result } = renderHook(() => useQuizMachine());
    expect(result.current.canGoBack).toBe(false);
    act(() => result.current.select("academia"));
    expect(result.current.stepIndex).toBe(1);
    expect(result.current.canGoBack).toBe(true);
    act(() => {
      result.current.goBack();
    });
    expect(result.current.stepIndex).toBe(0);
  });

  it("reflete o progresso ao longo das perguntas", () => {
    const { result } = renderHook(() => useQuizMachine());
    expect(result.current.progress).toBeCloseTo(1 / 6);
    act(() => result.current.select("academia"));
    expect(result.current.progress).toBeCloseTo(2 / 6);
  });

  it("dispara quiz_abandoned ao fechar antes de concluir", () => {
    const { result } = renderHook(() => useQuizMachine());
    act(() => result.current.select("academia"));
    act(() => result.current.markAbandonedIfIncomplete());
    expect(track).toHaveBeenCalledWith("quiz_abandoned", expect.objectContaining({ index: 1 }));
  });

  it("submete o lead e conclui com sucesso (lead_created + quiz_finished)", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    const { result } = renderHook(() => useQuizMachine());
    answerAll(result);
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    act(() => result.current.startLead());
    expect(result.current.phase).toBe("lead");

    await act(async () => {
      await result.current.submitLead({
        name: "Marina Alves",
        email: "marina@studiovitta.com",
        whatsapp: "(11) 99999-0000",
        company: "Studio Vitta",
      });
    });

    expect(result.current.phase).toBe("success");
    expect(result.current.leadStatus).toBe("done");
    expect(fetchSpy).toHaveBeenCalledWith("/api/landing/quiz-lead", expect.objectContaining({ method: "POST" }));
    expect(track).toHaveBeenCalledWith("lead_created", expect.anything());
    expect(track).toHaveBeenCalledWith("quiz_finished", expect.anything());

    vi.unstubAllGlobals();
  });

  it("marca erro quando a submissão do lead falha (não trava)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const { result } = renderHook(() => useQuizMachine());
    answerAll(result);
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    act(() => result.current.startLead());
    await act(async () => {
      await result.current.submitLead({
        name: "Marina Alves",
        email: "marina@studiovitta.com",
        whatsapp: "(11) 99999-0000",
        company: "Studio Vitta",
      });
    });

    expect(result.current.leadStatus).toBe("error");
    expect(result.current.leadError).toBeTruthy();
    expect(result.current.phase).toBe("lead");

    vi.unstubAllGlobals();
  });
});
