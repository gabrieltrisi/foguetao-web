import * as React from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

/** Rótulo mono (eyebrow) — linguagem de crescimento, sem tom militar. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-white/55",
        className,
      )}
    >
      <span className="bg-brand size-1.5 rounded-full" aria-hidden />
      {children}
    </span>
  );
}

/**
 * Cabeçalho de seção padronizado — ritmo tipográfico consistente em toda a
 * página. Eyebrow + título grande (Sora) + subtítulo opcional.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "mx-auto max-w-3xl items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      ) : null}
      <Reveal delay={0.05}>
        <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.025em] text-white">
          {title}
        </h2>
      </Reveal>
      {subtitle ? (
        <Reveal delay={0.1}>
          <p
            className={cn(
              "max-w-2xl text-[15px] leading-relaxed text-white/55 sm:text-base",
              align === "center" && "mx-auto",
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}

/** Container de seção com padding vertical e largura máxima consistentes. */
export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("relative mx-auto w-full max-w-[1200px] px-6 py-24 sm:px-8 sm:py-32", className)}>
      {children}
    </section>
  );
}
