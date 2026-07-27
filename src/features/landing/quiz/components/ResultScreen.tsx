"use client";

import type { ReactNode } from "react";
import { ArrowRight, AlertTriangle, Target, CheckCircle2, ListChecks } from "lucide-react";
import { FEATURE_ICONS } from "./feature-icon";
import { useDiagnosisViewModel } from "../view-models/useDiagnosisViewModel";
import { ScoreGauge } from "./ScoreGauge";
import type { Diagnosis } from "../types";

/**
 * Tela de resultado — o diagnóstico premium: score + maturidade, gargalos,
 * potencial, recursos recomendados, plano e próximos passos. CTA leva à captação.
 */
export function ResultScreen({
  diagnosis,
  onContinue,
}: {
  diagnosis: Diagnosis;
  onContinue: () => void;
}) {
  const vm = useDiagnosisViewModel(diagnosis);

  return (
    <div className="pb-2">
      {/* Score + maturidade + potencial */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
        <ScoreGauge score={diagnosis.score} color={vm.visual.color} label="de 100" />
        <div className="text-center sm:text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
            Maturidade comercial
          </p>
          <p className={`mt-1 font-display text-2xl font-bold ${vm.visual.textClass}`}>
            {diagnosis.maturity.label}
          </p>
          <p className="mt-2 max-w-xs text-[13.5px] leading-relaxed text-white/55">{vm.scoreCaption}</p>
          <div className="mt-3 inline-flex items-baseline gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <span className="font-display text-lg font-bold text-brand">{vm.potentialLabel}</span>
            <span className="text-[12px] text-white/50">{vm.potentialCaption}</span>
          </div>
        </div>
      </div>

      {/* Headline personalizada */}
      <p className="mt-7 border-l-2 border-brand/50 pl-4 text-[15px] leading-relaxed text-white/75">
        {diagnosis.headline}
      </p>

      {/* Gargalos */}
      <Section icon={<AlertTriangle className="size-4 text-brand" aria-hidden />} title="Principais gargalos">
        <ul className="flex flex-col gap-3">
          {diagnosis.gaps.map((g) => (
            <li key={g.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="text-[14px] font-semibold text-white">{g.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-white/50">{g.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Prioridades */}
      <Section icon={<Target className="size-4 text-brand" aria-hidden />} title="Suas prioridades agora">
        <ul className="flex flex-col gap-2.5">
          {diagnosis.priorities.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-white/70">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </Section>

      {/* Recursos recomendados do Foguetão */}
      <Section icon={<CheckCircle2 className="size-4 text-brand" aria-hidden />} title="O que o Foguetão resolve para você">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {diagnosis.features.map((f) => {
            const Icon = FEATURE_ICONS[f.icon];
            return (
              <div key={f.title} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <p className="mt-3 text-[14px] font-semibold text-white">{f.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-white/50">{f.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Plano recomendado */}
      <div className="mt-6 rounded-2xl border border-brand/25 bg-brand/[0.06] p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">Plano recomendado</p>
        <p className="mt-1.5 font-display text-xl font-bold text-white">{diagnosis.plan.name}</p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">{diagnosis.plan.rationale}</p>
      </div>

      {/* Próximos passos */}
      <Section icon={<ListChecks className="size-4 text-brand" aria-hidden />} title="Seus próximos passos">
        <ol className="flex flex-col gap-2.5">
          {diagnosis.nextSteps.map((s, i) => (
            <li key={s} className="flex items-start gap-3 text-[13.5px] leading-relaxed text-white/70">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-bold text-white/80">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </Section>

      {/* Prova + CTA */}
      <p className="mt-6 text-center text-[13px] italic leading-relaxed text-white/45">{diagnosis.proof}</p>

      <button
        type="button"
        onClick={onContinue}
        className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(224,7,15,0.6)] transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f12]"
      >
        Quero organizar minha operação <ArrowRight className="size-4" aria-hidden />
      </button>
      <p className="mt-3 text-center text-[12px] text-white/40">
        Receba o diagnóstico completo e comece seu teste de 14 dias, sem cartão.
      </p>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6">
      <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-white/50">
        {icon}
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
