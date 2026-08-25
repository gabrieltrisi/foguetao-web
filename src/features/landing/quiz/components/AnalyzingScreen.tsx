"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  "Lendo suas respostas",
  "Cruzando com padrões de operações comerciais",
  "Montando seu diagnóstico personalizado",
];

/**
 * Tela de análise (2–3s) antes do resultado — "Estamos analisando sua operação".
 * Anel pulsante da marca + passos que acendem em sequência. Em reduced-motion,
 * tudo aparece estático (a máquina também encurta o tempo).
 */
export function AnalyzingScreen() {
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState(reduced ? STEPS.length - 1 : 0);

  React.useEffect(() => {
    if (reduced) return;
    const timers = STEPS.map((_, i) =>
      window.setTimeout(() => setActive(i), 500 + i * 650),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduced]);

  return (
    <div className="flex flex-col items-center py-10 text-center sm:py-14">
      <div className="relative flex size-24 items-center justify-center">
        {!reduced ? (
          <>
            <motion.span
              className="absolute inset-0 rounded-full border border-brand/30"
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </>
        ) : (
          <span className="absolute inset-0 rounded-full border-2 border-brand/40" />
        )}
        <span className="text-3xl" aria-hidden>
          🚀
        </span>
      </div>

      <h2 className="mt-7 font-display text-[clamp(1.4rem,4.5vw,1.9rem)] font-bold text-white" aria-live="polite">
        Estamos analisando sua operação…
      </h2>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-white/50">
        Cruzando suas respostas para montar um diagnóstico sob medida.
      </p>

      <ul className="mt-7 flex w-full max-w-xs flex-col gap-2.5 text-left">
        {STEPS.map((step, i) => {
          const done = i <= active;
          return (
            <li key={step} className="flex items-center gap-2.5 text-[13.5px]">
              <span
                className={
                  done
                    ? "flex size-4 shrink-0 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white"
                    : "size-4 shrink-0 rounded-full border border-white/15"
                }
                aria-hidden
              >
                {done ? "✓" : ""}
              </span>
              <span className={done ? "text-white/80" : "text-white/35"}>{step}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
