import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";
import { LandingButton } from "./button";
import { QuizTrigger } from "@/features/landing/quiz";
import type { FinalCtaContent } from "@/config/landing/segments";

/**
 * CTA final — impacto, pouco texto. Fundo preparado para o vídeo do foguete
 * (mesmo slot `[data-hero-media]` do hero); hoje, gradientes estáticos.
 */
export function LandingCta({
  content,
  registerHref,
}: {
  content: FinalCtaContent;
  registerHref: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden data-hero-media className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_120%,rgba(224,7,15,0.28),transparent_60%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#08080a] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[900px] px-6 py-32 text-center sm:py-44">
        <Reveal>
          <h2 className="font-display text-[clamp(2rem,7vw,5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-white">
            {content.titleLead} <span className="text-brand">{content.titleHighlight}</span>
            {content.titleTail}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-white/60 sm:text-[17px]">
            {content.subtitle}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <LandingButton href={registerHref} size="lg">
              {content.primaryCta} <ArrowRight className="size-4" aria-hidden />
            </LandingButton>
            <QuizTrigger variant="cta" />
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
            14 dias grátis · sem cartão de crédito · suporte em português
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <p className="mt-3 text-[13px] text-white/45">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Entrar
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
