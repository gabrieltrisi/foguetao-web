import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LandingLogo } from "@/components/site/landing/brand-logo";
import { AuthBackToSite } from "@/components/auth/auth-ui";

/**
 * Recorte discreto do produto (tema claro real do CRM) para o painel lateral —
 * reforça "você está entrando em um produto de verdade" sem competir com o
 * formulário. Estático, leve, sem dados fictícios apresentados como prova.
 */
function AuthProductHint({ className }: { className?: string }) {
  const funnel = [
    { label: "Novos leads", w: 100, v: "312" },
    { label: "Em contato", w: 72, v: "224" },
    { label: "Proposta", w: 45, v: "141" },
    { label: "Fechamento", w: 28, v: "88" },
  ];
  return (
    <div
      className={cn(
        "w-full max-w-[300px] rounded-xl border border-black/10 bg-[#ffffff] p-4 text-[#17171a] shadow-[0_30px_90px_-45px_rgba(0,0,0,0.8)]",
        className,
      )}
      aria-hidden
    >
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-[#66666d]">Funil de vendas</span>
        <span className="size-1.5 rounded-full bg-brand" />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {funnel.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5">
            <span className="w-20 shrink-0 text-[11px] text-[#66666d]">{s.label}</span>
            <span className="h-5 flex-1 overflow-hidden rounded bg-[#f7f7f8]">
              <span
                className="flex h-full items-center rounded bg-gradient-to-r from-brand to-brand-dark px-2 text-[9px] font-semibold text-white"
                style={{ width: `${s.w}%` }}
              >
                {s.v}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Painel institucional — narrativa de crescimento + recorte do produto. Desktop. */
function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden border-r border-white/[0.06] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_15%_5%,rgba(224,7,15,0.14),transparent_58%)]"
      />
      <Link
        href="/"
        aria-label="Foguetão — início"
        className="relative z-10 w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <LandingLogo className="h-7" />
      </Link>

      <div className="relative z-10 max-w-md">
        <h2 className="font-display text-[clamp(1.9rem,2.6vw,2.7rem)] font-bold leading-[1.08] tracking-[-0.025em] text-white">
          Sua operação comercial,
          <br />
          <span className="text-brand">sob controle</span>.
        </h2>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/55">
          Contatos, pipeline e negócios em um só lugar — organização e previsibilidade do
          primeiro contato ao fechamento.
        </p>
        <AuthProductHint className="mt-10" />
      </div>

      <p className="relative z-10 text-[12.5px] text-white/50">Feito no Brasil · Suporte em português</p>
    </aside>
  );
}

/**
 * Casca compartilhada das telas públicas de autenticação. Duas colunas no
 * desktop (institucional + formulário); no mobile, só o formulário com uma
 * faixa discreta (logo + voltar ao site). Fundo `#08080a`, igual à landing.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-[#08080a] text-white antialiased">
      <div className="grid min-h-screen lg:grid-cols-2">
        <AuthAside />
        <section className="flex min-h-screen flex-col px-6 py-6 sm:px-10">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              aria-label="Foguetão — início"
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
            >
              <LandingLogo className="h-6" />
            </Link>
            <AuthBackToSite className="ml-auto" />
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-sm">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
