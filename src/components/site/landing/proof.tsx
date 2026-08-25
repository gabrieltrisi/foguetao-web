import { Quote } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";
import { DemoBadge } from "./demo-badge";
import { QuizTrigger } from "@/features/landing/quiz";
import type { SegmentProof } from "@/config/landing/segments";

/**
 * Prova social por segmento — stats + mini-case (antes/depois) + depoimento +
 * "logos" de demonstração + CTA, com selo "Demonstração" enquanto os dados forem
 * ilustrativos. Estrutura desacoplada em `SegmentContent.proof`: trocar por casos
 * reais é só editar o config (os campos `videoUrl`/`beforeAfterImage` já existem
 * no tipo, prontos para ativos reais — sem render por ora).
 */
export function LandingProof({ proof }: { proof: SegmentProof }) {
  const initials = proof.testimonial.author
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Section id="prova">
      <SectionHeader
        eyebrow="Resultados"
        title={<>O que muda quando a operação fica organizada.</>}
        subtitle="Menos oportunidade perdida, mais clareza do que vai fechar — o efeito de trabalhar num funil só."
        align="center"
      />

      {proof.demo ? (
        <Reveal className="mt-6 flex justify-center">
          <DemoBadge />
        </Reveal>
      ) : null}

      {/* Stats */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {proof.stats.map((s, i) => (
          <Reveal key={s.value + s.label} delay={i * 0.06}>
            <div className="h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center transition duration-200 hover:-translate-y-0.5 hover:border-white/15">
              <p className="font-display text-2xl font-bold text-brand">{s.value}</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Mini-case antes/depois */}
      {proof.case ? (
        <Reveal className="mt-4" delay={0.05}>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.05] sm:grid-cols-2">
            <div className="bg-[#0a0a0c] p-6">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/40">Antes</p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/60">{proof.case.before}</p>
            </div>
            <div className="bg-brand/[0.06] p-6">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand">Depois</p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/75">{proof.case.after}</p>
            </div>
          </div>
        </Reveal>
      ) : null}

      {/* Depoimento */}
      <Reveal className="mt-4" delay={0.1}>
        <figure className="mx-auto max-w-3xl rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.03] to-transparent p-7 sm:p-9">
          <Quote className="size-7 text-brand/50" aria-hidden />
          <blockquote className="mt-4 text-[17px] leading-relaxed text-white/80 sm:text-[19px]">
            “{proof.testimonial.quote}”
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[13px] font-semibold text-brand"
              aria-hidden
            >
              {initials}
            </span>
            <span className="text-[13.5px]">
              <span className="block font-semibold text-white">{proof.testimonial.author}</span>
              <span className="block text-white/50">
                {proof.testimonial.role} · {proof.testimonial.company}
              </span>
            </span>
          </figcaption>
        </figure>
      </Reveal>

      {/* "Logos" de demonstração (categorias, não marcas reais) */}
      {proof.logos && proof.logos.length ? (
        <Reveal className="mt-8" delay={0.12}>
          <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/35">
            Feito para operações como
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {proof.logos.map((l) => (
              <span
                key={l}
                className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[12.5px] font-medium text-white/45"
              >
                {l}
              </span>
            ))}
          </div>
        </Reveal>
      ) : null}

      {/* CTA da prova → quiz */}
      {proof.cta ? (
        <Reveal className="mt-8 flex justify-center" delay={0.14}>
          <QuizTrigger variant="strip" label={proof.cta.label} source="proof" />
        </Reveal>
      ) : null}
    </Section>
  );
}
