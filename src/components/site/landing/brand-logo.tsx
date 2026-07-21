import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo da landing — MESMO asset oficial (`logo-mono.png`), mas servido pelo
 * otimizador do next/image no tamanho de exibição (≈120px). Isso troca o PNG
 * de 256KB por um webp de poucos KB — essencial para o LCP do hero. A cor
 * branca vem do filtro `brightness-0 invert` (não recolore o arquivo).
 */
export function LandingLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/logo-mono.png"
      alt="Foguetão"
      width={200}
      height={60}
      priority={priority}
      sizes="120px"
      className={cn("h-7 w-auto brightness-0 invert", className)}
    />
  );
}
