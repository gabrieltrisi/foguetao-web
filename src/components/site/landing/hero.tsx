import { ArrowRight } from "lucide-react";
import { Eyebrow } from "./section";
import { LandingButton } from "./button";
import { ProductDashboard } from "./product-ui";
import { SegmentSelector } from "./segment-selector";
import type { CrmDashboard, HeroContent, SegmentId } from "@/config/landing/segments";

/**
 * Hero — o produto é o protagonista. Conteúdo ESTÁTICO (sem reveal on-scroll):
 * acima da dobra precisa pintar na hora — melhor LCP e primeira impressão
 * instantânea. O conteúdo chega por props (por segmento); a UI é genérica.
 *
 * A landing continua entendível sem personalizar: o botão secundário
 * "Ver para o meu segmento" abre o seletor — a escolha é opcional.
 */
export function LandingHero({
  content,
  registerHref,
  active,
  activeLabel,
  dashboard,
}: {
  content: HeroContent;
  registerHref: string;
  active: SegmentId;
  activeLabel: string;
  dashboard: CrmDashboard;
}) {
  return (
    <section className="relative flex min-h-screen flex-col items-center overflow-hidden pt-28 sm:pt-32">
      <div aria-hidden data-hero-media className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(224,7,15,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_120%,rgba(224,7,15,0.10),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#08080a]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center px-6 text-center sm:px-8">
        <Eyebrow>{content.eyebrow}</Eyebrow>

        <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,7vw,5.25rem)] font-bold leading-[0.98] tracking-[-0.035em] text-white">
          {content.titleLead} <span className="text-brand">{content.titleHighlight}</span>
        </h1>

        <p className="mt-7 max-w-2xl text-[16px] leading-relaxed text-white/60 sm:text-[17px]">
          {content.subtitle}
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <LandingButton href={registerHref} size="lg">
            {content.primaryCta} <ArrowRight className="size-4" aria-hidden />
          </LandingButton>
          <SegmentSelector active={active} activeLabel={activeLabel} />
        </div>

        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
          {content.note}
        </p>
      </div>

      {/* Produto — protagonista, grande, acima da dobra. O indicador discreto de
          segmento ativo fica no gatilho do seletor acima ("Personalizado: …");
          o selo "Exemplo para …" aparece só no showcase, para não repetir. */}
      <div className="relative z-10 mt-14 w-full max-w-[1080px] px-4 sm:mt-16 sm:px-8">
        <div className="relative">
          <div aria-hidden className="absolute -inset-x-8 -top-8 bottom-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(224,7,15,0.22),transparent_70%)] blur-2xl" />
          <ProductDashboard data={dashboard} className="relative" />
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-b from-transparent to-[#08080a]" />
    </section>
  );
}
