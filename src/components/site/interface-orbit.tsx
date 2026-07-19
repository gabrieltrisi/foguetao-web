"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TelemetryLabel, TiltCard } from "./primitives";
import { PhaseHeading } from "./mission";
import { usePointerVars } from "./hooks";

/**
 * Fase 03 — Operação. Fragmentos REAIS da interface (KPI, pipeline, conversa,
 * negócio, timeline) flutuam ao redor do núcleo de comando. Cada um inclina no
 * hover e faz parallax com o mouse, em profundidades diferentes — como se tudo
 * orbitasse o centro.
 */
export function InterfaceOrbit() {
  const stageRef = usePointerVars<HTMLDivElement>();

  return (
    <section
      id="operacao"
      className="relative mx-auto max-w-[1400px] px-6 pt-28 pb-20 sm:px-10 sm:pt-40 sm:pb-24"
    >
      <PhaseHeading phase="03" label="Fase 03 — Operação" title={<>Tudo orbita o núcleo.</>}>
        Contatos, pipeline, conversas do WhatsApp, negócios e histórico — não em abas
        separadas, mas girando ao redor de um só centro de comando.
      </PhaseHeading>

      <div
        ref={stageRef}
        className="relative mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:block lg:h-[470px]"
      >
        {/* Núcleo (só no desktop) */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
          <div className="relative flex size-40 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-white/10" />
            <span className="absolute inset-4 rounded-full border border-white/[0.06]" />
            <span className="bg-brand/[0.07] absolute inset-8 rounded-full blur-xl" />
            <div className="relative text-center">
              <span className="bg-brand mx-auto block size-2 rounded-full" />
              <span className="mt-2 block font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase">
                Núcleo
              </span>
            </div>
          </div>
        </div>

        <Fragment depth={26} className="lg:absolute lg:top-0 lg:left-[4%] lg:w-72">
          <KpiFragment />
        </Fragment>
        <Fragment depth={40} className="lg:absolute lg:top-[8%] lg:right-[3%] lg:w-64">
          <PipelineFragment />
        </Fragment>
        <Fragment depth={18} className="lg:absolute lg:bottom-[6%] lg:left-[8%] lg:w-72">
          <ChatFragment />
        </Fragment>
        <Fragment depth={34} className="lg:absolute lg:right-[8%] lg:bottom-0 lg:w-64">
          <DealFragment />
        </Fragment>
        <Fragment depth={22} className="lg:absolute lg:top-[42%] lg:left-[34%] lg:w-64">
          <TimelineFragment />
        </Fragment>
      </div>
    </section>
  );
}

/** Wrapper com parallax por profundidade (lê --px/--py do palco). */
function Fragment({
  children,
  depth,
  className,
}: {
  children: React.ReactNode;
  depth: number;
  className?: string;
}) {
  return (
    <div
      className={cn("transition-transform duration-300 ease-out will-change-transform", className)}
      style={{
        transform: `translate3d(calc((var(--px,0.5) - 0.5) * ${depth}px), calc((var(--py,0.5) - 0.5) * ${depth}px), 0)`,
      }}
    >
      <TiltCard className="p-4" intensity={7}>
        {children}
      </TiltCard>
    </div>
  );
}

/* ---- Fragmentos reais da UI (tema escuro) ---- */

function KpiFragment() {
  return (
    <div>
      <TelemetryLabel>Receita · Mês</TelemetryLabel>
      <p className="mt-3 text-2xl font-semibold text-white tabular-nums">R$ 128.400</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="border-brand text-brand rotate-45 border-t border-r p-0.5" />
        <span className="text-brand font-mono text-[11px]">+18,4%</span>
        <span className="font-mono text-[10px] text-white/35">vs. anterior</span>
      </div>
      <div className="mt-4 flex h-10 items-end gap-1">
        {[30, 42, 38, 55, 48, 70, 88].map((h, i) => (
          <span key={i} className="bg-brand/50 flex-1 rounded-sm" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function PipelineFragment() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest text-white/45 uppercase">
          Negociação
        </span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/60">
          3
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {[
          ["Studio F1", "R$ 42k"],
          ["Clínica Vitta", "R$ 18k"],
          ["Rede Alta", "R$ 96k"],
        ].map(([n, v]) => (
          <div key={n} className="flex items-center justify-between rounded-md border border-white/8 bg-white/[0.02] px-3 py-2">
            <span className="text-[13px] text-white/80">{n}</span>
            <span className="font-mono text-[11px] text-white/50 tabular-nums">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatFragment() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-white/85">Marina · Clínica Vitta</span>
        <TelemetryLabel>WhatsApp</TelemetryLabel>
      </div>
      <div className="mt-3 space-y-2">
        <p className="max-w-[80%] rounded-lg rounded-tl-sm bg-white/[0.05] px-3 py-2 text-[13px] text-white/75">
          Pode emitir a nota e agendar a instalação?
        </p>
        <p className="ml-auto max-w-[80%] rounded-lg rounded-tr-sm bg-brand/15 px-3 py-2 text-[13px] text-white/90">
          Fechado. Enviando agora.
        </p>
      </div>
    </div>
  );
}

function DealFragment() {
  return (
    <div>
      <TelemetryLabel live>Negócio · Fechando</TelemetryLabel>
      <p className="mt-3 text-[15px] font-medium text-white">Studio F1 Performance</p>
      <p className="mt-1 text-2xl font-semibold text-white tabular-nums">R$ 42.000</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
        <span className="from-brand to-brand-dark block h-full w-[85%] rounded-full bg-gradient-to-r" />
      </div>
      <p className="mt-2 font-mono text-[10px] tracking-widest text-white/35 uppercase">
        85% · etapa fechamento
      </p>
    </div>
  );
}

function TimelineFragment() {
  return (
    <div>
      <TelemetryLabel>Histórico</TelemetryLabel>
      <ul className="mt-3 space-y-3">
        {[
          ["Marina moveu p/ Proposta", "agora"],
          ["Ligação registrada · 4min", "12min"],
          ["Tag “quente” aplicada", "1h"],
        ].map(([t, when]) => (
          <li key={t} className="flex items-start gap-3">
            <span className="bg-brand mt-1.5 size-1.5 shrink-0 rounded-full" />
            <span className="flex-1 text-[13px] text-white/75">{t}</span>
            <span className="font-mono text-[10px] text-white/30">{when}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
