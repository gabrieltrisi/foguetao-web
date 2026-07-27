"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, AlertTriangle, Target, CheckCircle2, ListChecks, Gauge } from "lucide-react";
import { FEATURE_ICONS } from "./feature-icon";
import { useDiagnosisViewModel } from "../view-models/useDiagnosisViewModel";
import { ScoreGauge } from "./ScoreGauge";
import type { Diagnosis } from "../types";

/**
 * Tela de resultado — apresentada como um RELATÓRIO: faixa de KPIs (Score /
 * Maturidade / Potencial) + grade de cards (gargalos, prioridades, recursos,
 * plano, próximos passos). Só apresentação — os dados vêm de `buildDiagnosis`.
 * Entrada com stagger discreto (reduced-motion → estático).
 */
export function ResultScreen({
  diagnosis,
  onContinue,
}: {
  diagnosis: Diagnosis;
  onContinue: () => void;
}) {
  const vm = useDiagnosisViewModel(diagnosis);
  const reduced = useReducedMotion();

  const container: Variants | undefined = reduced
    ? undefined
    : { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item: Variants | undefined = reduced
    ? undefined
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
      };

  return (
    <motion.div
      className="pb-2"
      variants={container}
      initial={reduced ? false : "hidden"}
      animate={reduced ? false : "show"}
    >
      {/* Faixa de KPIs do relatório */}
      <motion.div variants={item} className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <ScoreGauge score={diagnosis.score} color={vm.visual.color} label="de 100" />
        </div>
        <Kpi label="Maturidade comercial">
          <span className={`font-display text-2xl font-bold ${vm.visual.textClass}`}>
            {diagnosis.maturity.label}
          </span>
          <span className="mt-2 block text-[12.5px] leading-relaxed text-white/50">{vm.scoreCaption}</span>
        </Kpi>
        <Kpi label="Potencial de melhoria">
          <span className="font-display text-3xl font-bold text-brand">{vm.potentialLabel}</span>
          <span className="mt-2 block text-[12.5px] leading-relaxed text-white/50">{vm.potentialCaption}</span>
        </Kpi>
      </motion.div>

      {/* Headline personalizada */}
      <motion.p
        variants={item}
        className="mt-4 rounded-xl border-l-2 border-brand/50 bg-white/[0.02] p-4 text-[15px] leading-relaxed text-white/75"
      >
        {diagnosis.headline}
      </motion.p>

      {/* Gargalos + Prioridades */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <ReportCard variants={item} icon={<AlertTriangle className="size-4 text-brand" aria-hidden />} title="Principais gargalos">
          <ul className="flex flex-col gap-3">
            {diagnosis.gaps.map((g) => (
              <li key={g.id}>
                <p className="text-[14px] font-semibold text-white">{g.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-white/50">{g.body}</p>
              </li>
            ))}
          </ul>
        </ReportCard>

        <ReportCard variants={item} icon={<Target className="size-4 text-brand" aria-hidden />} title="Suas prioridades agora">
          <ul className="flex flex-col gap-2.5">
            {diagnosis.priorities.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-white/70">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </ReportCard>
      </div>

      {/* Recursos recomendados */}
      <ReportCard
        variants={item}
        className="mt-3"
        icon={<CheckCircle2 className="size-4 text-brand" aria-hidden />}
        title="O que o Foguetão resolve para você"
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {diagnosis.features.map((f) => {
            const Icon = FEATURE_ICONS[f.icon];
            return (
              <div key={f.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="size-4" aria-hidden />
                </span>
                <p className="mt-2.5 text-[13.5px] font-semibold text-white">{f.title}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-white/50">{f.body}</p>
              </div>
            );
          })}
        </div>
      </ReportCard>

      {/* Plano + Próximos passos */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <motion.div variants={item} className="rounded-2xl border border-brand/25 bg-brand/[0.06] p-5">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
            <Gauge className="size-3.5" aria-hidden /> Plano recomendado
          </p>
          <p className="mt-2 font-display text-xl font-bold text-white">{diagnosis.plan.name}</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">{diagnosis.plan.rationale}</p>
        </motion.div>

        <ReportCard variants={item} icon={<ListChecks className="size-4 text-brand" aria-hidden />} title="Seus próximos passos">
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
        </ReportCard>
      </div>

      {/* Prova + CTA */}
      <motion.p variants={item} className="mt-6 text-center text-[13px] italic leading-relaxed text-white/45">
        {diagnosis.proof}
      </motion.p>

      <motion.button
        variants={item}
        type="button"
        onClick={onContinue}
        className="mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(224,7,15,0.6)] transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f12]"
      >
        Quero organizar minha operação <ArrowRight className="size-4" aria-hidden />
      </motion.button>
      <motion.p variants={item} className="mt-3 text-center text-[12px] text-white/40">
        Receba o diagnóstico completo e comece seu teste de 14 dias, sem cartão.
      </motion.p>
    </motion.div>
  );
}

function Kpi({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-center sm:text-left">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/45">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ReportCard({
  icon,
  title,
  children,
  className,
  variants,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div
      variants={variants}
      className={`rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 ${className ?? ""}`}
    >
      <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-white/50">
        {icon}
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}
