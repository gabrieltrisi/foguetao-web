import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Marca oficial do Foguetão.
 * Usa exclusivamente os assets oficiais em `public/brand/` (não redesenhar,
 * não recolorir, não alterar proporções). Dimensões `width`/`height` são as
 * intrínsecas de cada arquivo; o tamanho de exibição vem das classes.
 */

type LogoVariant = "horizontal" | "sidebar" | "sidebar-balanced" | "mono";

const LOGO_ASSETS: Record<LogoVariant, { src: string; width: number; height: number }> = {
  // F vermelho + wordmark preto (fundo claro)
  horizontal: { src: "/brand/logo-horizontal.svg", width: 4000, height: 1200 },
  // Versão para a sidebar (transparente)
  sidebar: { src: "/brand/logo-sidebar.png", width: 2400, height: 600 },
  // Mesmo logo colorido, re-emoldurado com o mesmo "respiro" do mono (conteúdo
  // a ~67,7% da altura) para casar de tamanho com o logo branco no modo escuro.
  "sidebar-balanced": { src: "/brand/logo-sidebar-balanced.png", width: 1141, height: 359 },
  // Versão monocromática (aplicada em branco sobre fundos vermelhos/escuros)
  mono: { src: "/brand/logo-mono.png", width: 4000, height: 1200 },
};

export function Logo({
  variant = "horizontal",
  white = false,
  className,
}: {
  variant?: LogoVariant;
  /** Renderiza o monocromático em branco (uso sobre vermelho/escuro). */
  white?: boolean;
  className?: string;
}) {
  const asset = LOGO_ASSETS[variant];
  return (
    <Image
      src={asset.src}
      alt="Foguetão"
      width={asset.width}
      height={asset.height}
      priority
      unoptimized
      className={cn("h-7 w-auto", white && "brightness-0 invert", className)}
    />
  );
}

export function LogoSymbol({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/symbol.png"
      alt="Foguetão"
      width={3000}
      height={3000}
      priority
      unoptimized
      className={cn("size-7", className)}
    />
  );
}
