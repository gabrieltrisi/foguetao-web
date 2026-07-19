"use client";

import * as React from "react";
import { useReducedMotion, useSmoothScroll } from "./hooks";
import { HudCorners, HudGrid } from "./hud";
import { Preloader } from "./preloader";

/**
 * Moldura de console. Envolve toda a landing: preloader de ignição, cantos de
 * HUD, grade técnica, uma camada de continuidade (para nenhuma fase virar preto
 * chapado), luz que segue o cursor, scanlines e o smooth scroll. Os filhos (as
 * seções) continuam Server Components — esta camada só orquestra a atmosfera.
 */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  useSmoothScroll();
  const reduced = useReducedMotion();
  const spotRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (reduced) return;
    const el = spotRef.current;
    if (!el) return;
    let raf = 0;
    let x = 0.5;
    let y = 0.3;
    const onMove = (e: PointerEvent) => {
      x = e.clientX / window.innerWidth;
      y = e.clientY / window.innerHeight;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.style.setProperty("--sx", `${(x * 100).toFixed(2)}%`);
          el.style.setProperty("--sy", `${(y * 100).toFixed(2)}%`);
        });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div className="selection:bg-brand relative min-h-screen overflow-x-clip bg-[#08080a] text-white antialiased selection:text-white">
      <Preloader />

      {/* Continuidade: textura MUITO sutil presente em toda a altura, para as
          fases de baixo não caírem em preto morto. Fixa e baratíssima. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 60% at 50% -10%, rgba(255,255,255,0.03), transparent 55%), radial-gradient(80% 50% at 50% 115%, rgba(224,7,15,0.05), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 160px)",
        }}
      />

      {/* Grade técnica no topo do viewport */}
      <HudGrid
        className="fixed z-0"
        mask="radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 78%)"
      />

      {/* Spotlight que segue o cursor */}
      <div
        ref={spotRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 hidden md:block"
        style={{
          background:
            "radial-gradient(420px circle at var(--sx,50%) var(--sy,30%), rgba(224,7,15,0.10), transparent 62%)",
        }}
      />

      {/* Scanlines finíssimas */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.5] mix-blend-soft-light"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <HudCorners fixed />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
