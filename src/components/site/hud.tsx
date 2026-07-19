import { cn } from "@/lib/utils";

/**
 * Kit de HUD compartilhado — mesma linguagem em landing e login.
 *
 * `HudCorners`: quatro cantos em L + dois ticks vermelhos. `fixed` (viewport)
 * na landing; padrão absoluto para emoldurar um container (login). Classes
 * estáticas (Tailwind não gera nomes construídos por template).
 */
export function HudCorners({ fixed = false }: { fixed?: boolean }) {
  if (fixed) {
    const b = "pointer-events-none fixed z-[55] hidden size-8 border-white/20 sm:block";
    return (
      <>
        <span className={`${b} top-4 left-4 border-t border-l`} />
        <span className={`${b} top-4 right-4 border-t border-r`} />
        <span className={`${b} bottom-4 left-4 border-b border-l`} />
        <span className={`${b} right-4 bottom-4 border-r border-b`} />
        <span className="bg-brand pointer-events-none fixed top-4 left-4 z-[56] hidden size-1 sm:block" />
        <span className="bg-brand pointer-events-none fixed right-4 bottom-4 z-[56] hidden size-1 sm:block" />
      </>
    );
  }
  const b = "pointer-events-none absolute z-20 hidden size-8 border-white/20 sm:block";
  return (
    <>
      <span className={`${b} top-5 left-5 border-t border-l`} />
      <span className={`${b} top-5 right-5 border-t border-r`} />
      <span className={`${b} bottom-5 left-5 border-b border-l`} />
      <span className={`${b} right-5 bottom-5 border-r border-b`} />
      <span className="bg-brand pointer-events-none absolute top-5 left-5 z-20 hidden size-1 sm:block" />
      <span className="bg-brand pointer-events-none absolute right-5 bottom-5 z-20 hidden size-1 sm:block" />
    </>
  );
}

/** Grade técnica com máscara — recebe a máscara por prop para variar por tela. */
export function HudGrid({ mask, className }: { mask: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 opacity-[0.35]", className)}
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: mask,
      }}
    />
  );
}
