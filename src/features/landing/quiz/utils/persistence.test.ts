import { describe, it, expect, beforeEach } from "vitest";
import { saveProgress, loadProgress, clearProgress } from "./persistence";
import { QUIZ_STORAGE_KEY } from "../constants/storage";
import type { QuizAnswers } from "../types";

const answers: QuizAnswers = { segmento: "academia", dor: "followup" };

beforeEach(() => {
  window.localStorage.clear();
});

describe("persistence", () => {
  it("salva e restaura o progresso", () => {
    saveProgress(2, answers);
    expect(loadProgress()).toEqual({ step: 2, answers });
  });

  it("clearProgress remove o progresso salvo", () => {
    saveProgress(1, answers);
    clearProgress();
    expect(loadProgress()).toBeNull();
  });

  it("retorna null quando não há progresso", () => {
    expect(loadProgress()).toBeNull();
  });

  it("descarta progresso com versão incompatível", () => {
    window.localStorage.setItem(
      QUIZ_STORAGE_KEY,
      JSON.stringify({ v: 999, step: 3, answers }),
    );
    expect(loadProgress()).toBeNull();
  });

  it("é resiliente a JSON corrompido", () => {
    window.localStorage.setItem(QUIZ_STORAGE_KEY, "{não é json");
    expect(loadProgress()).toBeNull();
  });
});
