/** Eventos de telemetria do quiz (nomes estáveis — contrato com o adapter). */
export type QuizEventName =
  | "quiz_open"
  | "quiz_started"
  | "question_viewed"
  | "question_answered"
  | "quiz_abandoned"
  | "diagnosis_viewed"
  | "lead_created"
  | "quiz_finished";
