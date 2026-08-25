"use client";

import * as React from "react";
import type { Diagnosis, MaturityLevel } from "../types";

export interface MaturityVisual {
  /** Cor do arco/realce do score (hex — a landing usa valores literais). */
  color: string;
  /** Classe utilitária de cor de texto correspondente. */
  textClass: string;
  /** Frase curta que qualifica o momento da operação. */
  caption: string;
}

const MATURITY_VISUAL: Record<MaturityLevel, MaturityVisual> = {
  "muito-baixa": {
    color: "#dc2626",
    textClass: "text-[#f87171]",
    caption: "Sua operação depende de esforço manual — há muito a ganhar com organização.",
  },
  baixa: {
    color: "#d97706",
    textClass: "text-[#fbbf24]",
    caption: "Você já vende, mas perde oportunidades no caminho por falta de processo.",
  },
  media: {
    color: "#e0070f",
    textClass: "text-brand",
    caption: "Boa base — com um funil claro e follow-up, o próximo salto vem rápido.",
  },
  alta: {
    color: "#16a34a",
    textClass: "text-[#4ade80]",
    caption: "Operação madura — refinar automação e indicadores destrava a escala.",
  },
  excelente: {
    color: "#16a34a",
    textClass: "text-[#4ade80]",
    caption: "Operação de alto nível — o Foguetão mantém tudo num painel só, sem perder o ritmo.",
  },
};

/**
 * Deriva os dados prontos de apresentação do resultado a partir do diagnóstico
 * (memoizado). Mantém a UI declarativa — sem lógica de cor/rótulo espalhada.
 */
export function useDiagnosisViewModel(diagnosis: Diagnosis) {
  return React.useMemo(() => {
    const visual = MATURITY_VISUAL[diagnosis.maturity.level];
    return {
      visual,
      potentialLabel: `+${diagnosis.potential}%`,
      potentialCaption: "de eficiência comercial ao organizar sua operação",
      scoreCaption: visual.caption,
    };
  }, [diagnosis]);
}
