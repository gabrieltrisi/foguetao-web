import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { MagneticButton, TelemetryLabel } from "./primitives";

/**
 * Barra de console — não é um "header de SaaS". Logo à esquerda, status de
 * sistema no centro (some no mobile) e um único acesso. Fina, fixa, translúcida.
 */
export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Scrim: mantém a barra legível quando um título branco passa por baixo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#08080a] via-[#08080a]/70 to-transparent"
      />
      <div className="relative mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" aria-label="Foguetão — início" className="flex items-center">
          <Logo variant="mono" white className="h-6 w-auto" />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <TelemetryLabel live>SISTEMAS · NOMINAL</TelemetryLabel>
          <span className="h-4 w-px bg-white/15" />
          <span className="font-mono text-[11px] tracking-[0.28em] text-white/40 uppercase">
            CRM · WHATSAPP · CAMPANHAS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden font-mono text-[12px] tracking-[0.18em] text-white/60 uppercase transition-colors hover:text-white sm:inline"
          >
            Entrar
          </Link>
          <MagneticButton href="/register" className="px-5 py-2.5 text-[12px]">
            Assumir controle
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}
