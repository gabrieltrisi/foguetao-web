"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Reveal — a ÚNICA primitiva de motion da landing. Fade + leve translate ao
 * entrar na viewport, uma vez só. Respeita prefers-reduced-motion (vira no-op).
 * Sem canvas, sem parallax, sem tilt: a animação valoriza o conteúdo, nunca
 * compete com ele.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
