import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { RadarCanvas } from "@/components/site/radar-canvas";
import { TelemetryLabel } from "@/components/site/primitives";

interface AuthHeroProps {
  eyebrow?: string;
  status?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * Painel lateral de autenticação — mesmo idioma do console da landing. Sem
 * foguete, sem blobs, sem `bg-brand`. Um terminal escuro: o radar autoral
 * rastreando ao fundo, telemetria e a frase de comando. Só em telas médias+.
 * Parametrizável para reuso entre login e cadastro.
 */
export function LoginHero({
  eyebrow = "Missão 001 — Autenticação",
  status = "Terminal · Online",
  title = (
    <>
      Identifique-se para
      <br />
      assumir o <span className="text-brand">comando</span>.
    </>
  ),
  description = (
    <>
      Acesso restrito ao centro de comando. Suas credenciais abrem o radar, o
      pipeline e a operação inteira.
    </>
  ),
}: AuthHeroProps) {
  return (
    <div className="relative hidden overflow-hidden border-r border-white/8 lg:flex lg:flex-col lg:justify-between lg:p-10">
      {/* Radar ao fundo, atmosférico */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-70">
          <RadarCanvas className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-[#08080a]/40" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <Logo variant="mono" white className="h-6 w-auto" />
        <TelemetryLabel live>{status}</TelemetryLabel>
      </div>

      <div className="relative z-10 max-w-sm">
        <TelemetryLabel className="mb-5">{eyebrow}</TelemetryLabel>
        <h2 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.05] font-bold tracking-[-0.03em] text-white">
          {title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/55">{description}</p>
      </div>

      <div className="relative z-10 flex items-center gap-4 font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
        <span>LAT -23.55</span>
        <span className="h-3 w-px bg-white/15" />
        <span>LON -46.63</span>
        <span className="h-3 w-px bg-white/15" />
        <span>SEC · TLS 1.3</span>
      </div>
    </div>
  );
}
