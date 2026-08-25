/**
 * API pública do feature Quiz Inteligente da landing.
 *
 * LP2: o overlay é compartilhado por um provider (`QuizProvider`) e aberto por
 * gatilhos (`QuizTrigger`) em vários pontos da página — hierarquia de CTA. Todo
 * o resto (overlay, telas, máquina, score) é interno e carregado sob demanda.
 */
export { QuizProvider, useQuiz } from "./components/quiz-provider";
export { QuizTrigger } from "./components/quiz-trigger";
export { QuizEntry } from "./components/QuizEntry";
