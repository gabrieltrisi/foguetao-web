"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuiz } from "./quiz-provider";
import { track } from "../analytics/track";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]";

const VARIANTS = {
  /** Gatilho secundário do hero (ghost) — mesmo visual do antigo QuizEntry. */
  hero:
    "h-13 px-6 text-[15px] border border-white/15 bg-white/[0.02] text-white hover:border-white/30 hover:bg-white/[0.05]",
  /** CTA final (ghost, tamanho grande). */
  cta:
    "h-13 px-7 text-[15px] border border-white/15 bg-white/[0.02] text-white hover:border-white/30 hover:bg-white/[0.05]",
  /** Strip contextual (sólido da marca) — destaque, alta intenção. */
  strip:
    "h-13 px-7 text-[15px] bg-brand text-white shadow-[0_10px_30px_-10px_rgba(224,7,15,0.6)] hover:bg-brand-dark",
} as const;

/**
 * Gatilho reutilizável do quiz — abre o overlay compartilhado via `useQuiz`.
 * Usado no hero, na strip contextual e no CTA final (hierarquia de CTA da LP2).
 */
export function QuizTrigger({
  variant = "hero",
  label = "Descobrir meu plano em 60s",
  source,
  className,
}: {
  variant?: keyof typeof VARIANTS;
  label?: string;
  /** Origem do funil para telemetria (default: o próprio variant). */
  source?: string;
  className?: string;
}) {
  const { open } = useQuiz();
  function handleClick() {
    track("quiz_open", { source: source ?? variant });
    open();
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-haspopup="dialog"
      className={cn(BASE, VARIANTS[variant], className)}
    >
      <Sparkles className={cn("size-4", variant === "strip" ? "text-white" : "text-brand")} aria-hidden />
      {label}
    </button>
  );
}
