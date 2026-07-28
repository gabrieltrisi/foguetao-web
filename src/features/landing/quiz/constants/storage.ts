/**
 * Chaves e versão da persistência do progresso do quiz. Bump a versão sempre que
 * o formato de `QuizAnswers`/steps mudar — um progresso salvo com versão antiga é
 * descartado no load (evita restaurar estado incompatível).
 */
export const QUIZ_STORAGE_KEY = "fg_quiz_progress";
export const QUIZ_STORAGE_VERSION = 1;

/**
 * Versão do fluxo/conteúdo do quiz (para telemetria). Bump quando a estrutura de
 * perguntas mudar de forma relevante para análise dos eventos.
 */
export const QUIZ_VERSION = "lp3.1";
