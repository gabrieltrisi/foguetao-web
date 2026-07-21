import { ArrowRight } from "lucide-react";
import { Eyebrow } from "./section";
import { LandingButton } from "./button";
import { ProductDashboard } from "./product-ui";

/**
 * Hero — o produto é o protagonista. Conteúdo ESTÁTICO (sem reveal on-scroll):
 * acima da dobra precisa pintar na hora — melhor LCP e primeira impressão
 * instantânea. Headline de crescimento, subhead concreta (só recursos do MVP)
 * e uma composição grande do dashboard.
 *
 * Fundo preparado para o vídeo cinematográfico de lançamento: `[data-hero-media]`
 * é o slot onde o <video> entra depois (com poster). Hoje, gradientes estáticos.
 */
export function LandingHero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center overflow-hidden pt-28 sm:pt-32">
      <div aria-hidden data-hero-media className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(224,7,15,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_120%,rgba(224,7,15,0.10),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#08080a]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center px-6 text-center sm:px-8">
        <Eyebrow>Plataforma comercial para times que crescem</Eyebrow>

        <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,7vw,5.25rem)] font-bold leading-[0.98] tracking-[-0.035em] text-white">
          Toda a sua operação comercial,
          <br />
          em <span className="text-brand">trajetória de crescimento.</span>
        </h1>

        <p className="mt-7 max-w-2xl text-[16px] leading-relaxed text-white/60 sm:text-[17px]">
          Contatos, pipeline, negócios, tarefas e campanhas reunidos em um painel único —
          com cada número atualizado em tempo real. Menos planilhas, mais decisões.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <LandingButton href="/register" size="lg">
            Começar agora <ArrowRight className="size-4" aria-hidden />
          </LandingButton>
          <LandingButton href="#produto" variant="ghost" size="lg">
            Ver o produto
          </LandingButton>
        </div>

        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
          14 dias grátis · sem cartão de crédito · suporte em português
        </p>
      </div>

      {/* Produto — protagonista, grande, acima da dobra */}
      <div className="relative z-10 mt-14 w-full max-w-[1080px] px-4 sm:mt-16 sm:px-8">
        <div className="relative">
          <div aria-hidden className="absolute -inset-x-8 -top-8 bottom-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(224,7,15,0.22),transparent_70%)] blur-2xl" />
          <ProductDashboard className="relative" />
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-b from-transparent to-[#08080a]" />
    </section>
  );
}
