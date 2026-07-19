"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "./hooks";

/** Link animável (declarado fora do render — não recriar por render). */
const MotionLink = motion.create(Link);

/* ---------------------------------------------------------------------------
 * TelemetryLabel — rótulo mono de telemetria. O "texto de HUD" que dá o tom
 * técnico: minúsculo, monoespaçado, com um tick vermelho piscando.
 * ------------------------------------------------------------------------- */
export function TelemetryLabel({
  children,
  live = false,
  className,
}: {
  children: React.ReactNode;
  live?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.28em] text-white/55 uppercase",
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {live ? (
          <span className="bg-brand/70 absolute inline-flex h-full w-full animate-ping rounded-full" />
        ) : null}
        <span className="bg-brand relative inline-flex size-1.5 rounded-full" />
      </span>
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * MagneticButton — o CTA vivo. É atraído pelo cursor (mola) e tem uma varredura
 * de luz que cruza o botão no hover. Sem reduced-motion, fica estático.
 * ------------------------------------------------------------------------- */
export function MagneticButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 250, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 250, damping: 18, mass: 0.4 });

  function onMove(e: React.PointerEvent) {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 18);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 14);
  }
  function reset() {
    mx.set(0);
    my.set(0);
  }

  return (
    <MotionLink
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x, y }}
      className={cn(
        "group/mag relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 font-mono text-[13px] tracking-[0.18em] uppercase transition-colors",
        variant === "primary"
          ? "bg-brand text-white shadow-[0_0_0_1px_rgba(224,7,15,0.5),0_18px_50px_-12px_rgba(224,7,15,0.6)]"
          : "border border-white/15 text-white/80 hover:border-white/40 hover:text-white",
        className,
      )}
    >
      {/* varredura de luz */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/mag:translate-x-full"
      />
      <span className="relative">{children}</span>
    </MotionLink>
  );
}

/* ---------------------------------------------------------------------------
 * TiltCard — painel com profundidade. Inclina em 3D seguindo o cursor e tem
 * uma luz que acompanha o ponteiro (glare). É o que faz a interface "flutuar".
 * ------------------------------------------------------------------------- */
export function TiltCard({
  children,
  className,
  intensity = 8,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  function onMove(e: React.PointerEvent) {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * intensity * 2);
    rx.set((0.5 - py) * intensity * 2);
    ref.current.style.setProperty("--gx", `${px * 100}%`);
    ref.current.style.setProperty("--gy", `${py * 100}%`);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
      className={cn(
        "group/tilt relative rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm",
        // sombra em camadas: instrumento de painel, não card de blog
        "shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_2px_10px_-4px_rgba(0,0,0,0.6),0_24px_60px_-24px_rgba(0,0,0,0.85)]",
        "transition-shadow duration-300 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_2px_10px_-4px_rgba(0,0,0,0.6),0_30px_80px_-28px_rgba(224,7,15,0.35)]",
        "[transform-style:preserve-3d] will-change-transform",
        className,
      )}
    >
      {/* realce superior (luz de topo) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-xl bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      {/* glare que segue o cursor */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.10), transparent 60%)",
        }}
      />
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
 * CommandButton — o CTA para formulários (submit). Mesma linguagem do
 * MagneticButton (atração + varredura de luz), com um flash de "ignição" no
 * clique e estado de loading. É o botão de "Entrar no comando".
 * ------------------------------------------------------------------------- */
export function CommandButton({
  children,
  loading = false,
  type = "submit",
  className,
  onClick,
}: {
  children: React.ReactNode;
  loading?: boolean;
  type?: "submit" | "button";
  className?: string;
  onClick?: () => void;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 250, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 250, damping: 18, mass: 0.4 });
  const [ignition, setIgnition] = React.useState(0);

  function onMove(e: React.PointerEvent) {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 10);
  }
  function reset() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={loading}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onClick={() => {
        if (!reduced) setIgnition((n) => n + 1);
        onClick?.();
      }}
      style={{ x, y }}
      className={cn(
        "group/cmd bg-brand relative inline-flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-full font-mono text-[13px] tracking-[0.18em] text-white uppercase shadow-[0_0_0_1px_rgba(224,7,15,0.5),0_16px_40px_-12px_rgba(224,7,15,0.6)] transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-80",
        className,
      )}
    >
      {/* varredura de luz */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/cmd:translate-x-full"
      />
      {/* flash de ignição (remonta por clique) */}
      {ignition > 0 ? (
        <motion.span
          key={ignition}
          aria-hidden
          initial={{ scale: 0.2, opacity: 0.6 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="pointer-events-none absolute size-16 rounded-full bg-white/60 blur-md"
        />
      ) : null}

      {loading ? (
        <span
          aria-label="Enviando"
          className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
        />
      ) : (
        <span className="relative">{children}</span>
      )}
    </motion.button>
  );
}

/* ---------------------------------------------------------------------------
 * ChargeBorder — moldura que "carrega": uma luz percorre a borda no hover,
 * como um sistema energizando. Puro CSS mask, custo zero.
 * ------------------------------------------------------------------------- */
export function ChargeBorder({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group/charge relative rounded-xl", className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover/charge:opacity-100"
        style={{
          padding: "1px",
          background:
            "conic-gradient(from var(--charge,0deg), transparent 0deg, rgba(224,7,15,0.9) 40deg, transparent 120deg)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          animation: "charge-spin 2.4s linear infinite",
        }}
      />
      {children}
    </div>
  );
}
