"use client";

import * as React from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Microanimações "ao vivo" do mock do produto — ilhas client pequenas usadas
 * dentro do mock (que continua server). Princípios:
 *  - anima só ao entrar na viewport (`useInView`, once);
 *  - o DOM já contém o VALOR FINAL (SSR/no-JS/leitor de tela leem o real);
 *  - `prefers-reduced-motion` desliga tudo;
 *  - largura fixa (`tabular-nums`) e crescimento por width contido → zero CLS.
 */

function formatThousands(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Número com contagem crescente ao entrar em vista. */
export function LiveNumber({
  target,
  prefix = "",
  suffix = "",
  thousands = false,
  className,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  thousands?: boolean;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.4 });
  // Inicia no valor final → SSR/no-JS/reduced e o leitor de tela veem o real.
  const [display, setDisplay] = React.useState(target);

  React.useEffect(() => {
    if (reduced || !inView) return;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [reduced, inView, target]);

  const body = thousands ? formatThousands(display) : String(Math.round(display));
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {body}
      {suffix}
    </span>
  );
}

/** Barra que cresce de 0 → `pct%` ao entrar em vista (width contido, sem reflow). */
export function LiveBar({
  pct,
  className,
  children,
}: {
  pct: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.4 });
  // Começa no valor final (SSR/no-JS/reduced renderizam a barra cheia).
  const [width, setWidth] = React.useState(pct);

  React.useEffect(() => {
    if (reduced || !inView) return;
    const controls = animate(0, pct, {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setWidth(v),
    });
    return () => controls.stop();
  }, [reduced, inView, pct]);

  return (
    <span ref={ref} className={className} style={{ width: `${width}%` }}>
      {children}
    </span>
  );
}

/** Ponto "ao vivo" pulsando discretamente (CSS; reduced-motion neutraliza global). */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex", className)}>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand/60 [animation-duration:2.5s]" aria-hidden />
      <span className="relative inline-flex size-full rounded-full bg-brand/80" aria-hidden />
    </span>
  );
}
