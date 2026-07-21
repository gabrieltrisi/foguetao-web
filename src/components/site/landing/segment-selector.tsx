"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEGMENT_OPTIONS } from "@/config/landing/segments";
import type { SegmentId } from "@/config/landing/segments";
import { persistSegment, withSegment } from "@/lib/landing/segment";

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Ilha client: dispara a personalização por segmento. Fora do modal, é só um
 * botão discreto no hero. A landing continua entendível sem clicar — a escolha
 * é opcional. Um clique aplica o segmento (persiste + navega `?segment=`).
 */
export function SegmentSelector({
  active,
  activeLabel,
}: {
  active: SegmentId;
  activeLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();
  const personalized = active !== "default" && active !== "outro";

  const close = React.useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  function choose(id: SegmentId) {
    persistSegment(id);
    setOpen(false);
    router.push(withSegment("/", id), { scroll: false });
  }

  // Escape fecha, trava o scroll do body e prende o foco dentro do modal.
  React.useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex h-13 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.02] px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]",
        )}
      >
        <Sparkles className="size-4 text-brand" aria-hidden />
        {personalized ? (
          <>
            Personalizado: {activeLabel} · <span className="text-white/60">trocar</span>
          </>
        ) : (
          "Ver para o meu segmento"
        )}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div aria-hidden className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12] p-6 text-left shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] sm:p-8"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="size-4" aria-hidden />
            </button>

            <h2 id={titleId} className="font-display text-xl font-bold text-white sm:text-2xl">
              Vamos personalizar sua experiência
            </h2>
            <p id={descId} className="mt-2 max-w-md text-[14px] leading-relaxed text-white/55">
              Escolha o tipo de negócio para ver exemplos mais próximos da sua realidade.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {SEGMENT_OPTIONS.map((opt) => {
                const on = opt.id === active;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => choose(opt.id)}
                    aria-pressed={on}
                    className={cn(
                      "group flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                      on
                        ? "border-brand/50 bg-brand/[0.08]"
                        : "border-white/[0.08] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]",
                    )}
                  >
                    <span className="flex w-full items-center justify-between">
                      <span className="text-xl leading-none" aria-hidden>
                        {opt.emoji}
                      </span>
                      {on ? <Check className="size-4 text-brand" aria-hidden /> : null}
                    </span>
                    <span className="text-[13.5px] font-semibold text-white">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
