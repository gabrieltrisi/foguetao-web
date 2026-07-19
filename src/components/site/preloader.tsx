"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { HudCorners } from "./hud";
import { useReducedMotion } from "./hooks";

const DURATION = 1250; // abastecimento (ms)
const HOLD = 260; // ignição antes do lançamento

function phaseFor(p: number): string {
  if (p < 0.25) return "Iniciando sequência";
  if (p < 0.55) return "Abastecendo";
  if (p < 0.82) return "Pressurizando";
  if (p < 1) return "T-menos";
  return "Ignição";
}

/**
 * Preloader — sequência de ignição em HUD. Curto e amarrado a um teto de tempo;
 * a barra "abastece", a telemetria conta, e no fim o overlay "lança" pra cima
 * revelando o hero. Reduced-motion: não aparece. Sem foguete-clipart.
 *
 * A animação escreve direto no DOM (sem re-render por frame). O único estado
 * React é `booting` (liga/desliga o overlay).
 */
export function Preloader() {
  const reduced = useReducedMotion();
  const [booting, setBooting] = React.useState(true);

  const barRef = React.useRef<HTMLSpanElement>(null);
  const countRef = React.useRef<HTMLSpanElement>(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    // Só na primeira visita da sessão: em navegações recorrentes, pula.
    const alreadyBooted =
      typeof sessionStorage !== "undefined" && sessionStorage.getItem("fg_booted") === "1";
    if (reduced || alreadyBooted) {
      const id = window.setTimeout(() => setBooting(false), 0);
      return () => window.clearTimeout(id);
    }
    try {
      sessionStorage.setItem("fg_booted", "1");
    } catch {
      // storage indisponível (modo privado): segue com o preloader normal
    }
    let raf = 0;
    let start = 0;
    let done = false;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / DURATION);
      if (barRef.current) barRef.current.style.width = `${p * 100}%`;
      if (countRef.current) countRef.current.textContent = String(Math.round(p * 100)).padStart(2, "0");
      if (labelRef.current) labelRef.current.textContent = phaseFor(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!done) {
        done = true;
        window.setTimeout(() => setBooting(false), HOLD);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <AnimatePresence>
      {booting ? (
        <motion.div
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-8%" }}
          transition={{ duration: 0.6, ease: [0.7, 0, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#08080a]"
        >
          <HudCorners fixed />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.3]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(60% 60% at 50% 50%, #000 30%, transparent 75%)",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(45% 40% at 50% 60%, rgba(224,7,15,0.10), transparent 70%)",
            }}
          />

          <div className="relative w-full max-w-sm px-8">
            <Logo variant="mono" white className="mx-auto h-7 w-auto" />

            <div className="mt-10 flex items-end justify-between font-mono">
              <span
                ref={labelRef}
                className="text-[11px] tracking-[0.28em] text-white/50 uppercase"
              >
                Iniciando sequência
              </span>
              <span className="text-white/80 tabular-nums">
                <span ref={countRef}>00</span>
                <span className="text-white/40">%</span>
              </span>
            </div>

            {/* Gauge de abastecimento */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <span
                ref={barRef}
                className="from-brand-dark to-brand block h-full w-0 rounded-full bg-gradient-to-r shadow-[0_0_16px_rgba(224,7,15,0.7)]"
              />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="bg-brand size-1.5 animate-pulse rounded-full" />
              <span className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase">
                Foguetão · Centro de Comando
              </span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
