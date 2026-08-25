/**
 * Persistência do progresso do quiz (localStorage, best-effort e versionada).
 * Permite retomar o diagnóstico se o usuário fechar o overlay e reabrir.
 * Progresso com versão diferente é descartado (formato incompatível).
 */
import type { QuizAnswers } from "../types";
import { QUIZ_STORAGE_KEY, QUIZ_STORAGE_VERSION } from "../constants/storage";

interface SavedProgress {
  v: number;
  step: number;
  answers: QuizAnswers;
}

export function saveProgress(step: number, answers: QuizAnswers): void {
  try {
    const payload: SavedProgress = { v: QUIZ_STORAGE_VERSION, step, answers };
    window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // navegação privada / storage indisponível — segue sem persistir
  }
}

export function loadProgress(): { step: number; answers: QuizAnswers } | null {
  try {
    const raw = window.localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedProgress> | null;
    if (
      !parsed ||
      parsed.v !== QUIZ_STORAGE_VERSION ||
      typeof parsed.step !== "number" ||
      typeof parsed.answers !== "object" ||
      parsed.answers === null
    ) {
      return null;
    }
    return { step: parsed.step, answers: parsed.answers };
  } catch {
    return null;
  }
}

export function clearProgress(): void {
  try {
    window.localStorage.removeItem(QUIZ_STORAGE_KEY);
  } catch {
    // ignore
  }
}
