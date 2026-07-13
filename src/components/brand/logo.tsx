import { cn } from "@/lib/utils";

/**
 * Marca do Foguetão.
 *
 * ⚠️ PLACEHOLDER — não é a logomarca oficial. Substitua os arquivos em
 * `public/brand/*` e, se desejar, este componente pelos assets definitivos.
 * Mantém o wordmark "Foguetão" (Sora) + símbolo geométrico na cor da marca.
 */

type LogoTone = "default" | "white";

export function LogoSymbol({
  className,
  tone = "default",
  title = "Foguetão",
}: {
  className?: string;
  tone?: LogoTone;
  title?: string;
}) {
  const badge = tone === "white" ? "#ffffff" : "var(--color-brand)";
  const arrow = tone === "white" ? "var(--color-brand)" : "#ffffff";
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" fill={badge} />
      {/* Seta ascendente — símbolo de lançamento / performance */}
      <path d="M16 6 L24 16 H19 V26 H13 V16 H8 Z" fill={arrow} />
    </svg>
  );
}

export function Logo({
  className,
  tone = "default",
  showWordmark = true,
  symbolClassName,
}: {
  className?: string;
  tone?: LogoTone;
  showWordmark?: boolean;
  symbolClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoSymbol tone={tone} className={cn("h-7 w-7", symbolClassName)} />
      {showWordmark ? (
        <span
          className={cn(
            "font-display text-h2 font-bold tracking-tight",
            tone === "white" ? "text-white" : "text-ink",
          )}
        >
          Foguetão
        </span>
      ) : null}
    </span>
  );
}
