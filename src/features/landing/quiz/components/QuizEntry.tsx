"use client";

import { QuizTrigger } from "./quiz-trigger";

/**
 * Compat: o gatilho do quiz no hero. A partir da LP2 o overlay é compartilhado
 * pelo `QuizProvider` e aberto via `QuizTrigger`; este wrapper preserva o ponto
 * de uso do hero (mesmo visual).
 */
export function QuizEntry() {
  return <QuizTrigger variant="hero" />;
}
