"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TelemetryLabel, TiltCard } from "./primitives";
import { useReducedMotion } from "./hooks";

/* ---------------------------------------------------------------------------
 * Reveal — entrada no scroll. Respeita reduced-motion (aí só aparece).
 * ------------------------------------------------------------------------- */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Cabeçalho de fase: número gigante fantasma + telemetria + título brutal. */
export function PhaseHeading({
  phase,
  label,
  title,
  children,
}: {
  phase: string;
  label: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="font-display pointer-events-none absolute -top-24 -left-2 text-[12rem] leading-none font-bold text-white/[0.03] select-none sm:text-[16rem]"
      >
        {phase}
      </span>
      <Reveal>
        <TelemetryLabel>{label}</TelemetryLabel>
        <h2 className="font-display mt-5 max-w-2xl text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-bold tracking-[-0.03em] text-white">
          {title}
        </h2>
        {children ? <div className="mt-5 max-w-xl text-white/65">{children}</div> : null}
      </Reveal>
    </div>
  );
}

const SECTION = "relative mx-auto max-w-[1400px] px-6 sm:px-10";

/* ===========================================================================
 * FASE 02 — SINAL. Do ruído à ordem. À esquerda o caos; à direita, o sinal.
 * ========================================================================= */
export function SignalSection() {
  return (
    <section id="sinal" className={cn(SECTION, "py-32 sm:py-44")}>
      <PhaseHeading phase="02" label="Fase 02 — Sinal" title={<>Do ruído ao sinal.</>}>
        Planilha aberta, três abas de WhatsApp, um e-mail perdido e a pergunta de
        sempre: “cadê aquele lead?”. O Foguetão separa sinal de ruído e devolve a
        ordem.
      </PhaseHeading>

      <div className="mt-16 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
        {/* RUÍDO */}
        <Reveal>
          <div className="relative h-64 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <span className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
              Ruído
            </span>
            <div className="absolute inset-0">
              {NOISE.map((n, i) => (
                <span
                  key={i}
                  className="absolute font-mono text-[11px] text-white/25"
                  style={{ left: `${n.x}%`, top: `${n.y}%`, opacity: n.o }}
                >
                  {n.t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* vetor */}
        <Reveal delay={0.1} className="hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="bg-brand h-px w-16" />
            <span className="border-brand h-2 w-2 rotate-45 border-t border-r" />
          </div>
        </Reveal>

        {/* SINAL */}
        <Reveal delay={0.15}>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <span className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
              Sinal
            </span>
            <ul className="mt-4 divide-y divide-white/5">
              {SIGNAL.map((s) => (
                <li key={s.name} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="bg-brand size-1.5 rounded-full" />
                    <span className="text-sm text-white/85">{s.name}</span>
                  </div>
                  <span className="font-mono text-[11px] tracking-wide text-white/40 uppercase">
                    {s.stage}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const NOISE = [
  { t: "planilha_v7_FINAL.xlsx", x: 8, y: 30, o: 0.5 },
  { t: "wpp: 41 não lidas", x: 46, y: 18, o: 0.4 },
  { t: "e-mail?", x: 62, y: 55, o: 0.35 },
  { t: "cadê o orçamento", x: 20, y: 66, o: 0.45 },
  { t: "ligar depois", x: 55, y: 78, o: 0.3 },
  { t: "lead frio?", x: 74, y: 34, o: 0.4 },
  { t: "sumiu", x: 34, y: 46, o: 0.5 },
] as const;

const SIGNAL = [
  { name: "Marina · Clínica Vitta", stage: "Proposta" },
  { name: "Studio F1 Performance", stage: "Negociação" },
  { name: "Rede Alta Imóveis", stage: "Fechamento" },
  { name: "Academia Órbita", stage: "Novo lead" },
] as const;

/* ===========================================================================
 * FASE 04 — CONTROLE. O painel responde em tempo real.
 * ========================================================================= */
export function ControlSection() {
  return (
    <section id="controle" className={cn(SECTION, "py-32 sm:py-44")}>
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <PhaseHeading phase="04" label="Fase 04 — Controle" title={<>Tudo responde. Agora.</>}>
          Mova um negócio no funil e o número muda na mesma tela. Sem relatório de
          ontem, sem exportar planilha. O painel é a verdade — atualizada enquanto
          você opera.
        </PhaseHeading>

        <Reveal delay={0.1}>
          <TiltCard className="p-6" intensity={6}>
            <div className="flex items-center justify-between">
              <TelemetryLabel live>Painel · Ao vivo</TelemetryLabel>
              <span className="font-mono text-[10px] tracking-widest text-white/35">T-00:00</span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <Kpi v="R$ 428k" k="Pipeline" />
              <Kpi v="31%" k="Conversão" accent />
              <Kpi v="18" k="Fechando" />
            </div>

            {/* mini funil */}
            <div className="mt-6 space-y-2">
              {FUNNEL.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 font-mono text-[10px] tracking-widest text-white/40 uppercase">
                    {f.label}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                    <span
                      className="from-brand to-brand-dark block h-full rounded-full bg-gradient-to-r"
                      style={{ width: `${f.pct}%` }}
                    />
                  </span>
                  <span className="w-8 text-right font-mono text-[11px] text-white/60 tabular-nums">
                    {f.pct}
                  </span>
                </div>
              ))}
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}

const FUNNEL = [
  { label: "Lead", pct: 100 },
  { label: "Contato", pct: 74 },
  { label: "Proposta", pct: 48 },
  { label: "Fechamento", pct: 31 },
] as const;

function Kpi({ v, k, accent }: { v: string; k: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-lg border p-3", accent ? "border-brand/40 bg-brand/[0.06]" : "border-white/8 bg-white/[0.02]")}>
      <p className={cn("text-lg font-semibold tabular-nums", accent ? "text-brand" : "text-white")}>{v}</p>
      <p className="mt-0.5 font-mono text-[9px] tracking-widest text-white/40 uppercase">{k}</p>
    </div>
  );
}

/* ===========================================================================
 * FASE 05 — ESCALA. Volume sem perder o alvo.
 * ========================================================================= */
export function ScaleSection() {
  return (
    <section id="escala" className={cn(SECTION, "py-32 sm:py-44")}>
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-end">
        <Reveal className="order-2 lg:order-1">
          <div className="flex h-56 items-end gap-2">
            {BARS.map((h, i) => (
              <span
                key={i}
                className="from-brand/70 flex-1 rounded-t bg-gradient-to-t to-transparent"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="mt-4 font-mono text-[10px] tracking-widest text-white/35 uppercase">
            Volume processado · 12 meses
          </p>
        </Reveal>

        <PhaseHeading
          phase="05"
          label="Fase 05 — Escala"
          title={
            <>
              10 ou 10 mil.<br />O mesmo controle.
            </>
          }
        >
          Dobre o time, triplique os leads, adicione canais. A operação escala e o
          radar continua limpo — cada alvo rastreado, nenhum perdido no caminho.
        </PhaseHeading>
      </div>
    </section>
  );
}

const BARS = [22, 30, 26, 38, 44, 40, 55, 61, 58, 72, 80, 96] as const;
