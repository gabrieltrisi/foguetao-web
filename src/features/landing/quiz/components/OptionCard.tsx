"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizOption } from "../types";

/**
 * Opção selecionável de uma pergunta. Alvo de toque ≥ 64px, realce da marca
 * quando escolhida (útil ao voltar). Um clique responde e avança (a máquina
 * cuida da transição).
 */
export function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: QuizOption;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      aria-pressed={selected}
      className={cn(
        "group flex min-h-16 w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        selected
          ? "border-brand/60 bg-brand/[0.08]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]",
      )}
    >
      {option.emoji ? (
        <span className="text-2xl leading-none" aria-hidden>
          {option.emoji}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-white">{option.label}</span>
        {option.hint ? (
          <span className="mt-0.5 block text-[13px] leading-snug text-white/45">{option.hint}</span>
        ) : null}
      </span>
      <ChevronRight
        className={cn(
          "size-4 shrink-0 transition-colors",
          selected ? "text-brand" : "text-white/20 group-hover:text-white/45",
        )}
        aria-hidden
      />
    </button>
  );
}
