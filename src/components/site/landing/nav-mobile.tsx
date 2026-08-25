"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

const LINKS = [
  { label: "Produto", href: "#produto" },
  { label: "Recursos", href: "#recursos" },
  { label: "Segurança", href: "#seguranca" },
  { label: "Perguntas", href: "#faq" },
] as const;

/**
 * Menu mobile da landing — só aparece < md, onde as âncoras e o "Entrar" do nav
 * desktop ficam ocultos. Um sheet fullscreen (backdrop + painel) com as seções e
 * os acessos. Reaproveita o padrão de dialog acessível do `segment-selector`:
 * focus-trap, Escape, scroll-lock do body e retorno de foco ao gatilho. Respeita
 * a safe-area (notch) via `pt-safe`/`pb-safe`.
 */
export function NavMobile({ registerHref = "/register" }: { registerHref?: string }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  const close = React.useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
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
    };
  }, [open, close]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Abrir menu"
        className="flex size-11 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[90]"
          role="presentation"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div aria-hidden className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="pt-safe pb-safe relative ml-auto flex h-[100dvh] w-full max-w-sm flex-col border-l border-white/10 bg-[#0f0f12] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center justify-between px-6 pt-5">
              <span id={titleId} className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/55">
                Menu
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar menu"
                className="flex size-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <nav aria-label="Seções" className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className="flex min-h-12 items-center rounded-lg px-3 text-[17px] font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-2.5 border-t border-white/10 px-4 py-5">
              <Link
                href="/login"
                onClick={close}
                className="flex min-h-12 items-center justify-center rounded-lg border border-white/15 bg-white/[0.02] px-5 text-[15px] font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Entrar
              </Link>
              <Link
                href={registerHref}
                onClick={close}
                className={cn(
                  "flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-[15px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(224,7,15,0.6)] transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f12]",
                )}
              >
                Começar agora <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
