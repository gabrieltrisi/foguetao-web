import { Reveal } from "./reveal";
import { Eyebrow } from "./section";
import { QuizTrigger } from "@/features/landing/quiz";

/**
 * CTA contextual de alta intenção — aparece após o Comparativo, quando o
 * visitante já entendeu o valor. Leva ao quiz (diagnóstico), o maior conversor.
 */
export function QuizCtaStrip() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 sm:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-b from-brand/[0.08] to-transparent px-6 py-12 text-center sm:px-10 sm:py-14">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-8 h-40 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(224,7,15,0.18),transparent_70%)] blur-2xl" />
          <div className="relative">
            <Eyebrow>Em 60 segundos</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-[clamp(1.6rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.02em] text-white">
              Descubra o plano ideal para o seu segmento.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/55">
              Responda 6 perguntas rápidas e receba um diagnóstico com score comercial, gargalos e próximos passos — feito para a sua operação.
            </p>
            <div className="mt-8 flex justify-center">
              <QuizTrigger variant="strip" label="Fazer meu diagnóstico grátis" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
