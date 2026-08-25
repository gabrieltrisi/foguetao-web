import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Selo "Demonstração" — deixa explícito que a prova social usa dados
 * ilustrativos (nunca fingimos clientes reais). Neutro de propósito (sem a cor
 * da marca), para não competir com provas reais quando existirem.
 */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white/60",
        className,
      )}
    >
      <FlaskConical className="size-3 text-white/50" aria-hidden />
      Demonstração
    </span>
  );
}
