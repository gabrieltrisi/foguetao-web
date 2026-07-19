"use client";

import * as React from "react";
import { useAnimationFrame, useReducedMotion } from "./hooks";

const BRAND: [number, number, number] = [224, 7, 15];
const rgba = (a: number) => `rgba(${BRAND[0]},${BRAND[1]},${BRAND[2]},${a})`;

type Blip = {
  r: number; // raio 0..1
  a: number; // ângulo rad
  born: number; // quando (ms) foi detectado pela última varredura
  locked: boolean; // virou "alvo travado" (lead → venda)
};

/** Blips iniciais (posições em polar, determinísticas). */
function makeInitialBlips(): Blip[] {
  const seed: [number, number][] = [
    [0.34, 0.7],
    [0.62, 2.1],
    [0.5, 3.5],
    [0.8, 4.4],
    [0.28, 5.4],
    [0.72, 0.2],
    [0.46, 1.3],
    [0.9, 2.9],
  ];
  return seed.map(([r, a]) => ({ r, a, born: -9999, locked: false }));
}

/**
 * Radar HUD autoral (canvas 2D). É a cena do hero: no ruído, blips (leads)
 * aparecem; a varredura os detecta; alguns são travados (convertidos). Segue o
 * cursor com um reticle e um leve parallax. Sob reduced-motion, desenha um
 * único quadro estático. rAF só roda em vista e com a aba ativa.
 */
export function RadarCanvas({ className }: { className?: string }) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  const size = React.useRef({ w: 0, h: 0, dpr: 1 });
  const mouse = React.useRef({ x: 0.5, y: 0.5, active: false });
  // Init único via useMemo — sem escrever no ref durante o render.
  const blips = React.useRef<Blip[]>(React.useMemo(makeInitialBlips, []));
  const sweep = React.useRef(0);

  // Dimensiona o canvas ao container (DPR limitado para não queimar fill-rate).
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

  // Ponteiro (sem estado React — vai direto pro ref).
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
        active: true,
      };
    };
    const onLeave = () => (mouse.current.active = false);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  function draw(elapsed: number) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { w, h, dpr } = size.current;
    if (!w || !h) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Parallax suave conforme o mouse (profundidade).
    const mx = mouse.current.active ? mouse.current.x : 0.5;
    const my = mouse.current.active ? mouse.current.y : 0.42;
    const cx = w / 2 + (mx - 0.5) * -22;
    const cy = h * 0.5 + (my - 0.5) * -18;
    const R = Math.min(w, h) * 0.46;

    // ---- Grade de alcance ----
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (R * i) / 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${i === 4 ? 0.14 : 0.07})`;
      ctx.stroke();
    }
    // eixos + spokes
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.stroke();
    }

    // ---- Varredura (wedge cônico vermelho) ----
    if (!reduced) {
      const sweepAngle = sweep.current;
      const grad = ctx.createConicGradient(sweepAngle, cx, cy);
      grad.addColorStop(0, rgba(0.28));
      grad.addColorStop(0.12, rgba(0.05));
      grad.addColorStop(0.2, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = grad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();
      // linha da varredura
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * R, cy + Math.sin(sweepAngle) * R);
      ctx.strokeStyle = rgba(0.5);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // ---- Ruído de fundo (poeira estática) ----
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < 40; i++) {
      const a = (i * 2.399963) % (Math.PI * 2); // golden angle → distribuição
      const rr = ((i * 97) % 100) / 100;
      const px = cx + Math.cos(a) * rr * R;
      const py = cy + Math.sin(a) * rr * R;
      ctx.fillRect(px, py, 1, 1);
    }

    // ---- Blips (leads) ----
    const sweepA = ((sweep.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    for (const b of blips.current) {
      const ba = ((b.a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      // detecção: a varredura acabou de cruzar o blip
      if (!reduced && Math.abs(sweepA - ba) < 0.05) b.born = elapsed;
      const age = elapsed - b.born;
      const detected = age >= 0 && age < 2600;
      const glow = reduced ? 0.5 : detected ? 1 - age / 2600 : 0.12;

      const bx = cx + Math.cos(b.a) * b.r * R;
      const by = cy + Math.sin(b.a) * b.r * R;

      ctx.beginPath();
      ctx.arc(bx, by, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = rgba(0.35 + glow * 0.65);
      ctx.fill();
      if (glow > 0.25) {
        ctx.beginPath();
        ctx.arc(bx, by, 8 + (1 - glow) * 10, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(glow * 0.4);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // alvo travado → colchetes de reticle
      if (b.locked) drawBrackets(ctx, bx, by, 12, rgba(0.8));
    }

    // ---- Reticle no cursor ----
    if (mouse.current.active && !reduced) {
      const rx = cx + (mx - 0.5) * R * 1.2;
      const ry = cy + (my - 0.5) * R * 1.2;
      drawBrackets(ctx, rx, ry, 16, "rgba(255,255,255,0.85)");
      ctx.beginPath();
      ctx.moveTo(rx - 22, ry);
      ctx.lineTo(rx - 8, ry);
      ctx.moveTo(rx + 8, ry);
      ctx.lineTo(rx + 22, ry);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // núcleo
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = rgba(1);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(0.5);
    ctx.stroke();
  }

  useAnimationFrame(
    (dt, elapsed) => {
      sweep.current += (dt / 1000) * 0.9; // ~0.9 rad/s
      // trava 2 alvos após alguns segundos, escalonado (dá vida à narrativa)
      if (elapsed > 1500) blips.current[1].locked = true;
      if (elapsed > 3200) blips.current[6].locked = true;
      draw(elapsed);
    },
    wrapRef,
    !reduced,
  );

  // Quadro estático inicial (SSR→hydrate, e caso reduced).
  React.useEffect(() => {
    if (reduced) {
      blips.current[1].locked = true;
      blips.current[6].locked = true;
    }
    const id = requestAnimationFrame(() => draw(0));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div ref={wrapRef} className={className}>
      <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />
    </div>
  );
}

/** Colchetes de reticle (mira) ao redor de um ponto. */
function drawBrackets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  color: string,
) {
  const c = s * 0.4;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  // TL
  ctx.moveTo(x - s, y - s + c);
  ctx.lineTo(x - s, y - s);
  ctx.lineTo(x - s + c, y - s);
  // TR
  ctx.moveTo(x + s - c, y - s);
  ctx.lineTo(x + s, y - s);
  ctx.lineTo(x + s, y - s + c);
  // BR
  ctx.moveTo(x + s, y + s - c);
  ctx.lineTo(x + s, y + s);
  ctx.lineTo(x + s - c, y + s);
  // BL
  ctx.moveTo(x - s + c, y + s);
  ctx.lineTo(x - s, y + s);
  ctx.lineTo(x - s, y + s - c);
  ctx.stroke();
}
