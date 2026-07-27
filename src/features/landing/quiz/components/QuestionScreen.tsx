"use client";

import { motion, useReducedMotion } from "framer-motion";
import { OptionCard } from "./OptionCard";
import type { QuizQuestion } from "../types";

/**
 * Uma pergunta por tela. Título + subtítulo + grade de opções. Entrada suave por
 * opção (respeita reduced-motion). Semântica de grupo para leitores de tela.
 */
export function QuestionScreen({
  question,
  selected,
  onSelect,
}: {
  question: QuizQuestion;
  selected: string | undefined;
  onSelect: (id: string) => void;
}) {
  const reduced = useReducedMotion();

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand">{question.eyebrow}</p>
      <h2 className="mt-2 font-display text-[clamp(1.5rem,5vw,2.1rem)] font-bold leading-tight tracking-[-0.02em] text-white">
        {question.title}
      </h2>
      {question.subtitle ? (
        <p className="mt-2 text-[14px] leading-relaxed text-white/50">{question.subtitle}</p>
      ) : null}

      <div role="group" aria-label={question.title} className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {question.options.map((opt, i) => (
          <motion.div
            key={opt.id}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { delay: i * 0.03, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <OptionCard option={opt} selected={selected === opt.id} onSelect={onSelect} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
