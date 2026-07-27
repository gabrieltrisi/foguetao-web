"use client";

import * as React from "react";
import { track } from "../analytics/track";
import type { QuestionId } from "../types";

/**
 * Envolve o dispatcher `track` em callbacks estáveis e semânticos, para a
 * máquina do quiz disparar eventos sem se acoplar ao adapter de telemetria.
 */
export function useQuizAnalytics() {
  return React.useMemo(
    () => ({
      started: () => track("quiz_started"),
      questionViewed: (id: QuestionId, index: number) =>
        track("question_viewed", { question: id, index }),
      questionAnswered: (id: QuestionId, value: string, index: number) =>
        track("question_answered", { question: id, value, index }),
      abandoned: (id: QuestionId | null, index: number) =>
        track("quiz_abandoned", { question: id, index }),
      diagnosisViewed: (segment: string, score: number) =>
        track("diagnosis_viewed", { segment, score }),
      leadCreated: (segment: string, score: number) =>
        track("lead_created", { segment, score }),
      finished: (segment: string, score: number) =>
        track("quiz_finished", { segment, score }),
    }),
    [],
  );
}

export type QuizAnalytics = ReturnType<typeof useQuizAnalytics>;
