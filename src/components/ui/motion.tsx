"use client";

import * as React from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";

/**
 * Animações sutis (150–250ms) com Framer Motion.
 * Todas respeitam `prefers-reduced-motion` (via useReducedMotion).
 */

/** Transição padrão da interface. */
export const softTransition: Transition = { duration: 0.2, ease: [0.22, 1, 0.36, 1] };
export const fastTransition: Transition = { duration: 0.15, ease: [0.22, 1, 0.36, 1] };

/** Entrada discreta (fade + leve deslocamento). Usado em cards e seções. */
export function FadeIn({
  children,
  delay = 0,
  y = 8,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...softTransition, delay: reduce ? 0 : delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Container para escalonar a entrada dos filhos (stagger discreto). */
export function StaggerGroup({
  children,
  className,
  step = 0.04,
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : step } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Filho do StaggerGroup. */
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: softTransition },
      }}
    >
      {children}
    </motion.div>
  );
}
