"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useQuiz } from "@/features/landing/quiz";
import { track } from "@/features/landing/quiz/analytics/track";

/**
 * CTA sticky que leva ao Quiz — surge depois do hero e some perto do fim (para
 * não competir com o CTA final). Mobile: barra inferior fixa (safe-area).
 * Desktop: botão flutuante discreto. Dismissível. `fixed` → zero CLS.
 * Reduced-motion e a11y safe.
 */
export function QuizStickyCta() {
  const { open } = useQuiz();
  const reduced = useReducedMotion();
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        const doc = document.documentElement.scrollHeight;
        const pastHero = y > vh * 0.85; // já passou do hero
        const nearBottom = y + vh > doc - 720; // perto do CTA final/footer
        setVisible(pastHero && !nearBottom);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (dismissed) return null;

  function handleOpen() {
    track("quiz_open", { source: "sticky" });
    open();
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40"
        >
          {/* Mobile: barra inferior */}
          <div className="pb-safe pointer-events-auto border-t border-white/10 bg-[#0f0f12]/95 backdrop-blur-md md:hidden">
            <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1 text-[13px] leading-tight text-white/70">
                Descubra seu plano ideal em <span className="font-semibold text-white">60 segundos</span>.
              </span>
              <button
                type="button"
                onClick={handleOpen}
                className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 text-[14px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(224,7,15,0.6)] transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Sparkles className="size-4" aria-hidden /> Diagnóstico
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Dispensar"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Desktop: botão flutuante */}
          <div className="pointer-events-none hidden justify-end px-6 pb-6 md:flex">
            <div className="pointer-events-auto flex items-center gap-1">
              <button
                type="button"
                onClick={handleOpen}
                className="flex h-12 items-center gap-2 rounded-full bg-brand pl-5 pr-5 text-[14px] font-semibold text-white shadow-[0_16px_40px_-12px_rgba(224,7,15,0.7)] transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]"
              >
                <Sparkles className="size-4" aria-hidden /> Descobrir meu plano em 60s
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Dispensar"
                className="flex size-8 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
