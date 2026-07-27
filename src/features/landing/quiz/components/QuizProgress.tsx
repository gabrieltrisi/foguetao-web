"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Barra de progresso do quiz + contador "Pergunta X de Y". A largura anima
 * suavemente (respeitando reduced-motion).
 */
export function QuizProgress({
  progress,
  stepNumber,
  totalSteps,
  showCounter = true,
}: {
  progress: number; // 0..1
  stepNumber: number;
  totalSteps: number;
  showCounter?: boolean;
}) {
  const reduced = useReducedMotion();
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);

  return (
    <div className="w-full">
      {showCounter ? (
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            Pergunta {stepNumber} de {totalSteps}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-white/35">{pct}%</span>
        </div>
      ) : null}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Progresso do diagnóstico"
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
