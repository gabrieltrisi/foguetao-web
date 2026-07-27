import { Quote } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";
import { DemoBadge } from "./demo-badge";
import type { SegmentProof } from "@/config/landing/segments";

/**
 * Prova social por segmento — stats + 1 depoimento, com selo "Demonstração"
 * enquanto os dados forem ilustrativos. Estrutura desacoplada em
 * `SegmentContent.proof`: trocar por casos reais é só editar o config.
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
            <div className="h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center">
              <p className="font-display text-2xl font-bold text-brand">{s.value}</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Depoimento */}
      <Reveal className="mt-6" delay={0.1}>
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
    </Section>
  );
}
