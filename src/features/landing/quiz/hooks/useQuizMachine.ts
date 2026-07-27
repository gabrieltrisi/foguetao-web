"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { QUESTIONS, QUESTION_COUNT } from "../constants/questions";
import { buildDiagnosis } from "../utils/diagnosis";
import { completeAnswersSchema } from "../utils/validation";
import { captureTracking } from "../utils/utm";
import { clearProgress, loadProgress, saveProgress } from "../utils/persistence";
import { useQuizAnalytics } from "./useQuizAnalytics";
import type { LeadFormValues } from "../utils/validation";
import type { CompleteAnswers, Diagnosis, QuizAnswers, QuizLeadPayload } from "../types";

export type QuizPhase = "question" | "analyzing" | "result" | "lead" | "success";
export type LeadStatus = "idle" | "submitting" | "error" | "done";

const ANALYZING_MS = 2400;
const ANALYZING_MS_REDUCED = 600;
const LEAD_ENDPOINT = "/api/landing/quiz-lead";

/**
 * Máquina de estados do quiz — orquestra fases, respostas, diagnóstico,
 * persistência e submissão do lead. Concentra a lógica de fluxo; os componentes
 * só apresentam. Determinística e testável (via renderHook).
 */
export function useQuizMachine() {
  const analytics = useQuizAnalytics();
  const reduced = useReducedMotion();

  // Restauração do progresso salvo — via inicializador lazy (client-only), sem
  // setState em efeito. `QuizOverlay` é ssr:false, então roda no navegador.
  const [initial] = React.useState(() => {
    const saved = loadProgress();
    return {
      answers: (saved?.answers ?? {}) as QuizAnswers,
      step:
        saved && typeof saved.step === "number"
          ? Math.min(Math.max(saved.step, 0), QUESTION_COUNT - 1)
          : 0,
    };
  });

  // Retomada: havia progresso salvo (passo > 0 ou alguma resposta).
  const restored = initial.step > 0 || Object.keys(initial.answers).length > 0;

  const [phase, setPhase] = React.useState<QuizPhase>("question");
  const [stepIndex, setStepIndex] = React.useState(initial.step);
  const [answers, setAnswers] = React.useState<QuizAnswers>(initial.answers);
  const [diagnosis, setDiagnosis] = React.useState<Diagnosis | null>(null);
  const [leadStatus, setLeadStatus] = React.useState<LeadStatus>("idle");
  const [leadError, setLeadError] = React.useState<string | null>(null);

  // Telemetria de início (uma vez) — chamada a sistema externo, sem setState.
  const startedRef = React.useRef(false);
  React.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    analytics.started();
  }, [analytics]);

  const currentQuestion = QUESTIONS[stepIndex];

  // question_viewed a cada pergunta exibida.
  React.useEffect(() => {
    if (phase === "question" && currentQuestion) {
      analytics.questionViewed(currentQuestion.id, stepIndex);
    }
  }, [phase, stepIndex, currentQuestion, analytics]);

  // Analisando → gera o diagnóstico após um tempo (encurtado em reduced-motion).
  // A completude é garantida por `select` antes de entrar em "analyzing".
  React.useEffect(() => {
    if (phase !== "analyzing") return;
    const parsed = completeAnswersSchema.safeParse(answers);
    if (!parsed.success) return;
    const complete = parsed.data as CompleteAnswers;
    const timer = window.setTimeout(
      () => {
        const result = buildDiagnosis(complete);
        setDiagnosis(result);
        setPhase("result");
        clearProgress();
        analytics.diagnosisViewed(result.segmentId, result.score);
      },
      reduced ? ANALYZING_MS_REDUCED : ANALYZING_MS,
    );
    return () => window.clearTimeout(timer);
  }, [phase, answers, reduced, analytics]);

  const select = React.useCallback(
    (value: string) => {
      const q = QUESTIONS[stepIndex];
      const nextAnswers: QuizAnswers = { ...answers, [q.id]: value };
      setAnswers(nextAnswers);
      analytics.questionAnswered(q.id, value, stepIndex);

      const isLast = stepIndex >= QUESTION_COUNT - 1;
      if (isLast) {
        saveProgress(stepIndex, nextAnswers);
        // Só entra em análise com as 6 respostas — evita diagnóstico incompleto.
        if (completeAnswersSchema.safeParse(nextAnswers).success) {
          setPhase("analyzing");
        }
      } else {
        const next = stepIndex + 1;
        saveProgress(next, nextAnswers);
        setStepIndex(next);
      }
    },
    [stepIndex, answers, analytics],
  );

  const canGoBack = (phase === "question" && stepIndex > 0) || phase === "lead";

  const goBack = React.useCallback(() => {
    if (phase === "lead") {
      setPhase("result");
      return true;
    }
    if (phase === "question" && stepIndex > 0) {
      setStepIndex((i) => i - 1);
      return true;
    }
    return false;
  }, [phase, stepIndex]);

  const startLead = React.useCallback(() => setPhase("lead"), []);

  const submitLead = React.useCallback(
    async (values: LeadFormValues) => {
      if (!diagnosis) return;
      const parsed = completeAnswersSchema.safeParse(answers);
      if (!parsed.success) return;

      setLeadStatus("submitting");
      setLeadError(null);

      const payload: QuizLeadPayload = {
        lead: values,
        answers: parsed.data as CompleteAnswers,
        diagnosis: {
          segment: diagnosis.segmentId,
          segmentLabel: diagnosis.segmentLabel,
          score: diagnosis.score,
          maturity: diagnosis.maturity.level,
          plan: diagnosis.plan.name,
        },
        tracking: captureTracking(),
      };

      try {
        const res = await fetch(LEAD_ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setLeadStatus("done");
        setPhase("success");
        analytics.leadCreated(diagnosis.segmentId, diagnosis.score);
        analytics.finished(diagnosis.segmentId, diagnosis.score);
      } catch {
        setLeadStatus("error");
        setLeadError("Não foi possível enviar agora. Tente novamente.");
      }
    },
    [diagnosis, answers, analytics],
  );

  /** Dispara `quiz_abandoned` se o overlay fechar antes de concluir. */
  const markAbandonedIfIncomplete = React.useCallback(() => {
    if (phase === "success") return;
    analytics.abandoned(currentQuestion?.id ?? null, stepIndex);
  }, [phase, currentQuestion, stepIndex, analytics]);

  // Progresso da barra: fração da jornada de perguntas; 100% a partir do análise.
  const progress =
    phase === "question" ? (stepIndex + 1) / QUESTION_COUNT : 1;

  return {
    phase,
    stepIndex,
    stepNumber: stepIndex + 1,
    totalSteps: QUESTION_COUNT,
    currentQuestion,
    answers,
    diagnosis,
    progress,
    canGoBack,
    restored,
    leadStatus,
    leadError,
    select,
    goBack,
    startLead,
    submitLead,
    markAbandonedIfIncomplete,
  };
}

export type QuizMachine = ReturnType<typeof useQuizMachine>;
