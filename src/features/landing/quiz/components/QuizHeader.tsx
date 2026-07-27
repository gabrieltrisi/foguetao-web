"use client";

import { ArrowLeft, X } from "lucide-react";
import { QuizProgress } from "./QuizProgress";

/**
 * Cabeçalho do overlay — voltar (quando aplicável), rótulo da marca, fechar e a
 * barra de progresso (só durante as perguntas).
 */
export function QuizHeader({
  canGoBack,
  onBack,
  onClose,
  showProgress,
  progress,
  stepNumber,
  totalSteps,
}: {
  canGoBack: boolean;
  onBack: () => void;
  onClose: () => void;
  showProgress: boolean;
  progress: number;
  stepNumber: number;
  totalSteps: number;
}) {
  return (
    <div className="shrink-0 border-b border-white/[0.06] px-5 py-4 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        {canGoBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-9 items-center gap-1.5 rounded-lg pr-2 text-[13px] font-medium text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Voltar
          </button>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
            Diagnóstico Foguetão
          </span>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar diagnóstico"
          className="flex size-9 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {showProgress ? (
        <div className="mt-3">
          <QuizProgress progress={progress} stepNumber={stepNumber} totalSteps={totalSteps} />
        </div>
      ) : null}
    </div>
  );
}
