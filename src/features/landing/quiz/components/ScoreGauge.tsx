"use client";

import * as React from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * Medidor circular do score (0–100). Anima o preenchimento do arco e o número
 * em contagem crescente; em reduced-motion mostra o valor final direto.
 */
export function ScoreGauge({
  score,
  color,
  label,
}: {
  score: number;
  color: string;
  label: string;
}) {
  const reduced = useReducedMotion();
  const target = Math.max(0, Math.min(100, score));
  const [animated, setAnimated] = React.useState(0);
  // Em reduced-motion mostramos o valor final direto (sem estado de animação).
  const value = reduced ? target : animated;

  React.useEffect(() => {
    if (reduced) return;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setAnimated(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, reduced]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex size-36 items-center justify-center">
      <svg viewBox="0 0 120 120" className="size-36 -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-bold tabular-nums text-white">{value}</span>
        <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-white/45">{label}</span>
      </div>
    </div>
  );
}
