import { RadarCanvas } from "./radar-canvas";
import { MagneticButton, TelemetryLabel } from "./primitives";

/**
 * Hero — o centro de comando. O radar autoral ocupa a cena; a tipografia
 * entrega a frase em três tempos, com o payoff em vermelho. Telemetria embaixo
 * reforça o "isto é um console", não uma página.
 */
export function HeroCommand() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Radar: à direita no desktop, sangrando pra fora; atmosférico no mobile */}
      <div className="pointer-events-none absolute inset-0 md:left-[38%]">
        <div className="absolute inset-0 opacity-40 md:opacity-100">
          <RadarCanvas className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/70 to-transparent md:via-[#08080a]/30" />
      </div>

      <div className="relative mx-auto w-full max-w-[1400px] px-6 pt-28 pb-16 sm:px-10">
        <div className="max-w-3xl">
          <TelemetryLabel live className="mb-8">
            MISSÃO 001 — CENTRO DE COMANDO COMERCIAL
          </TelemetryLabel>

          <h1 className="font-display text-[clamp(3.2rem,10.5vw,9.5rem)] leading-[0.9] font-bold tracking-[-0.035em] text-white">
            <span className="block">Você no</span>
            <span className="block">centro de</span>
            <span className="text-brand block">comando.</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/65">
            O console onde cada lead vira uma missão, o pipeline vira trajetória e
            todo número responde em tempo real. Sem trocar de aba. Sem perder o alvo.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <MagneticButton href="/register">Assumir o controle</MagneticButton>
            <MagneticButton href="#sinal" variant="ghost">
              Ver o console
            </MagneticButton>
          </div>

          {/* Faixa de telemetria — números vivos do "sistema" */}
          <dl className="mt-16 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] font-mono">
            <Stat k="Alvos no radar" v="1.284" />
            <Stat k="Travados hoje" v="316" />
            <Stat k="Latência" v="12ms" />
          </dl>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="font-mono text-[10px] tracking-[0.3em] text-white/35 uppercase">
          Iniciar descida
        </span>
        <span className="h-8 w-px animate-pulse bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-[#08080a]/60 px-4 py-3">
      <dd className="text-xl font-medium text-white tabular-nums">{v}</dd>
      <dt className="mt-0.5 text-[10px] tracking-[0.18em] text-white/40 uppercase">{k}</dt>
    </div>
  );
}
