"use client";

import * as React from "react";
import { useAnimationFrame, useReducedMotion } from "./hooks";

type Ember = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number };

const COUNT = 90;

/** Pool de brasas iniciais (posições relativas à base). Init único. */
function makeEmbers(): Ember[] {
  const arr: Ember[] = [];
  for (let i = 0; i < COUNT; i++) {
    arr.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, r: 1 });
  }
  return arr;
}

/**
 * Ignição — "vídeo de fundo" de foguete gerado por código. Um plume de motor
 * subindo da base: núcleo branco-quente, exaustão vermelha da marca, brasas
 * que sobem e esfriam, calor pulsando. Canvas 2D, leve, in-view/aba-ativa,
 * DPR limitado. Reduced-motion: um quadro estático.
 */
export function IgnitionCanvas({ className }: { className?: string }) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const size = React.useRef({ w: 0, h: 0, dpr: 1 });
  const embers = React.useRef<Ember[]>(React.useMemo(makeEmbers, []));
  // gerador pseudoaleatório determinístico (nada de Math.random no init/SSR)
  const seed = React.useRef(1);
  const rnd = React.useCallback(() => {
    seed.current = (seed.current * 1664525 + 1013904223) % 4294967296;
    return seed.current / 4294967296;
  }, []);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      size.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      if (reduced) draw(0);
    });
    ro.observe(wrap);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  function spawn(e: Ember, w: number, h: number) {
    const spread = w * 0.14;
    e.x = w / 2 + (rnd() - 0.5) * spread;
    e.y = h - 4;
    e.vx = (rnd() - 0.5) * 0.5;
    e.vy = -(1.4 + rnd() * 2.6); // sobe
    e.max = 60 + rnd() * 80;
    e.life = reduced ? e.max * rnd() : 0;
    e.r = 0.6 + rnd() * 1.8;
  }

  function draw(elapsed: number) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { w, h, dpr } = size.current;
    if (!w || !h) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const flicker = reduced ? 0.85 : 0.78 + Math.sin(elapsed / 90) * 0.1 + Math.sin(elapsed / 37) * 0.06;

    // --- Brilho volumétrico na base (calor do motor) ---
    const glow = ctx.createRadialGradient(cx, h, 0, cx, h, h * 0.75);
    glow.addColorStop(0, `rgba(255,255,255,${0.22 * flicker})`);
    glow.addColorStop(0.12, `rgba(255,120,70,${0.28 * flicker})`);
    glow.addColorStop(0.3, `rgba(224,7,15,${0.3 * flicker})`);
    glow.addColorStop(0.62, "rgba(224,7,15,0.06)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // --- Coluna de exaustão (plume) ---
    const plumeW = w * (0.1 + flicker * 0.02);
    const plume = ctx.createLinearGradient(0, h, 0, h * 0.32);
    plume.addColorStop(0, `rgba(255,255,255,${0.5 * flicker})`);
    plume.addColorStop(0.25, `rgba(255,140,80,${0.32 * flicker})`);
    plume.addColorStop(0.6, `rgba(224,7,15,${0.16 * flicker})`);
    plume.addColorStop(1, "rgba(224,7,15,0)");
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - plumeW * 0.35, h);
    ctx.lineTo(cx + plumeW * 0.35, h);
    ctx.lineTo(cx + plumeW, h * 0.34);
    ctx.lineTo(cx - plumeW, h * 0.34);
    ctx.closePath();
    ctx.fillStyle = plume;
    ctx.filter = "blur(6px)";
    ctx.fill();
    ctx.restore();

    // --- Brasas ---
    for (const e of embers.current) {
      if (!reduced) {
        e.life += 1;
        e.x += e.vx;
        e.y += e.vy;
        e.vy *= 0.995; // desacelera ao subir
        e.vx += (rnd() - 0.5) * 0.06;
        if (e.life >= e.max || e.y < h * 0.18) spawn(e, w, h); // recicla
      }
      const t = e.max ? e.life / e.max : 0.5;
      const alpha = Math.max(0, 1 - t) * 0.9;
      // esquenta na base (branco) e esfria subindo (vermelho)
      const heat = Math.max(0, 1 - e.y / h);
      const cr = 255;
      const cg = Math.round(60 + heat * 180);
      const cb = Math.round(40 + heat * 120);
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * (1 + heat), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
      ctx.fill();
    }
  }

  // posiciona as brasas na primeira medição, mesmo estático
  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      const { w, h } = size.current;
      if (w && h) {
        for (const e of embers.current) if (e.max === 1) spawn(e, w, h);
        draw(0);
      }
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useAnimationFrame((_dt, elapsed) => draw(elapsed), wrapRef, !reduced);

  return (
    <div ref={wrapRef} className={className}>
      <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />
    </div>
  );
}
