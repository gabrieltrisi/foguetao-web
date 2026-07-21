import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * CTA da landing — sóbrio e premium, sem magnetismo/glow. Apenas transições de
 * cor/brilho no hover. Primário (vermelho da marca) e ghost (contorno claro).
 */
export function LandingButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  size?: "md" | "lg";
  className?: string;
}) {
  const variants = {
    primary:
      "bg-brand text-white shadow-[0_10px_30px_-10px_rgba(224,7,15,0.6)] hover:bg-brand-dark",
    ghost: "border border-white/15 bg-white/[0.02] text-white hover:border-white/30 hover:bg-white/[0.05]",
  };
  const sizes = { md: "h-11 px-5 text-[14px]", lg: "h-13 px-7 text-[15px]" };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}
