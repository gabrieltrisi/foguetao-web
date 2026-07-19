"use client";

import * as React from "react";

/**
 * `prefers-reduced-motion`. Toda animação da landing consulta isto: quem pediu
 * menos movimento recebe um estado estático (o site continua legível e vivo,
 * só não se mexe).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

/**
 * Smooth scroll (Lenis). Carregado sob demanda para não pesar o first load, e
 * desligado sob reduced-motion. Sem estado React no loop — só rAF.
 */
export function useSmoothScroll(): void {
  const reduced = useReducedMotion();
  React.useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let alive = true;

    import("lenis").then(({ default: Lenis }) => {
      if (!alive) return;
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.4 });
      const loop = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [reduced]);
}

/**
 * Escreve a posição do ponteiro como CSS vars (`--px`, `--py` em 0..1) num
 * elemento — sem re-render. É assim que o spotlight, o parallax e o tilt
 * reagem ao mouse a 60fps sem tocar o React.
 */
export function usePointerVars<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = React.useRef<T>(null);
  const reduced = useReducedMotion();
  React.useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let raf = 0;
    let px = 0.5;
    let py = 0.5;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width;
      py = (e.clientY - r.top) / r.height;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.style.setProperty("--px", px.toFixed(4));
          el.style.setProperty("--py", py.toFixed(4));
        });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);
  return ref;
}

/**
 * rAF que só roda quando o elemento está visível (IntersectionObserver) e a aba
 * está ativa. Base de qualquer canvas — nada de queimar GPU fora de vista.
 */
export function useAnimationFrame(
  callback: (dtMs: number, elapsedMs: number) => void,
  targetRef: React.RefObject<Element | null>,
  active = true,
): void {
  const cb = React.useRef(callback);
  React.useEffect(() => {
    cb.current = callback;
  });

  React.useEffect(() => {
    const el = targetRef.current;
    if (!el || !active) return;

    let raf = 0;
    let last = 0;
    let start = 0;
    let inView = false;

    const tick = (t: number) => {
      if (!start) start = t;
      const dt = last ? t - last : 16.7;
      last = t;
      cb.current(dt, t - start);
      raf = requestAnimationFrame(tick);
    };
    const play = () => {
      if (raf || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) play();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    const onVisibility = () => (document.hidden || !inView ? stop() : play());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [targetRef, active]);
}
