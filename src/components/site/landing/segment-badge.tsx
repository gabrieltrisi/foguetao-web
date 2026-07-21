import { Sparkles } from "lucide-react";

/**
 * Selo "Exemplo para Academias" — deixa explícito que a screenshot usa dados do
 * nicho (mesmo produto, dados ilustrativos). Só aparece quando há segmento.
 */
export function SegmentBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/80">
      <Sparkles className="size-3 text-brand" aria-hidden />
      {label}
    </span>
  );
}
