import { MagneticButton, TelemetryLabel } from "./primitives";
import { Reveal } from "./mission";
import { IgnitionCanvas } from "./ignition-canvas";

/**
 * Fase 06 — Lançamento. O finale: a operação já está armada; falta o comando.
 * Uma sequência de lançamento (checklist mono) leva ao CTA. Fecha com uma
 * assinatura de console — não um footer de template.
 */
export function Launch() {
  return (
    <section id="lancamento" className="relative overflow-hidden">
      {/* Ignição: "vídeo de fundo" de foguete, gerado por canvas. Sobe da base;
          o overlay mantém o texto legível na parte de cima. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <IgnitionCanvas className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#08080a]/55 to-[#08080a]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 py-40 text-center sm:px-10 sm:py-52">
        <Reveal>
          <TelemetryLabel live className="justify-center">
            Fase 06 — Lançamento
          </TelemetryLabel>

          <h2 className="font-display mx-auto mt-6 max-w-4xl text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.95] font-bold tracking-[-0.035em] text-white">
            A operação está armada.
            <br />
            <span className="text-brand">Falta o comando.</span>
          </h2>
        </Reveal>

        {/* sequência de lançamento */}
        <Reveal delay={0.1}>
          <ul className="mx-auto mt-12 flex max-w-2xl flex-col gap-2.5 text-left">
            {SEQUENCE.map(([t, label]) => (
              <li
                key={t}
                className="flex items-center gap-4 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3"
              >
                <span className="text-brand w-14 shrink-0 font-mono text-[12px] tracking-widest">
                  {t}
                </span>
                <span className="flex-1 text-[14px] text-white/70">{label}</span>
                <span className="border-brand size-2.5 rotate-45 border-r border-b" />
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-col items-center gap-4">
            <MagneticButton href="/register" className="px-9 py-4 text-[14px]">
              Iniciar lançamento
            </MagneticButton>
            <span className="font-mono text-[11px] tracking-[0.2em] text-white/35 uppercase">
              14 dias · sem cartão · suporte em português
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const SEQUENCE = [
  ["T-03", "Contatos e histórico importados"],
  ["T-02", "Pipeline e etapas configurados"],
  ["T-01", "Time a bordo, permissões definidas"],
  ["T-00", "Radar ligado — leads em rastreio"],
] as const;
