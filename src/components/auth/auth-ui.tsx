import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Base visual compartilhada das telas de autenticação — alinhada à Landing
 * Premium 3.0 (fundo escuro, Sora nos títulos, vermelho da marca como acento,
 * inputs limpos). Sem HUD/radar/telemetria. Só classes + componentes pequenos:
 * a lógica dos formulários (react-hook-form, zod, mutations) permanece intacta.
 * ------------------------------------------------------------------------ */

/** Input escuro e limpo — foco na marca, contraste alto, autofill-friendly. */
export const authFieldClass =
  "h-11 rounded-lg border border-white/[0.12] bg-white/[0.03] px-3.5 text-[15px] text-white shadow-none transition-colors placeholder:text-white/30 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20";

/** Label sempre visível, legível (Inter), sentence-case. */
export const authLabelClass = "text-[13px] font-medium text-white/75";

/** Cabeçalho do formulário: título (Sora) + texto de apoio curto. */
export function AuthHeader({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.05] tracking-[-0.02em] text-white">
        {title}
      </h1>
      {children ? <p className="mt-2.5 text-[14.5px] leading-relaxed text-white/55">{children}</p> : null}
    </div>
  );
}

/** Botão principal — vermelho da marca. Loading NÃO muda o tamanho do botão. */
export function AuthSubmit({
  children,
  loading = false,
  className,
}: {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand px-5 text-[15px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(224,7,15,0.55)] transition-colors duration-200 hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a] disabled:cursor-not-allowed disabled:opacity-90",
        className,
      )}
    >
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <Loader2 className="size-[18px] animate-spin" />
        </span>
      ) : null}
      {/* Rótulo sempre no fluxo: mantém a largura e o nome acessível estáveis. */}
      <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>{children}</span>
    </button>
  );
}

/** Alerta de erro geral — limpo, anunciado por leitores de tela. */
export function AuthAlert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="mt-6 flex items-start gap-2.5 rounded-lg border border-danger/40 bg-danger/[0.08] px-4 py-3 text-[13.5px] text-white/85"
    >
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

/** Texto de erro por campo, associado via aria-describedby. */
export function AuthFieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="text-[12.5px] text-danger">
      {children}
    </p>
  );
}

/** Nota de rodapé sutil (ex.: risco zero) — não compete com o CTA. */
export function AuthNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 text-center text-[12px] uppercase tracking-[0.14em] text-white/40">{children}</p>
  );
}

/** Botão em formato de link (primário vermelho ou ghost) — ações dos estados. */
export function AuthLinkButton({
  href,
  children,
  variant = "primary",
  onClick,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  onClick?: () => void;
  className?: string;
}) {
  const variants = {
    primary: "bg-brand text-white shadow-[0_10px_30px_-10px_rgba(224,7,15,0.55)] hover:bg-brand-dark",
    ghost: "border border-white/15 bg-white/[0.02] text-white hover:border-white/30 hover:bg-white/[0.05]",
  };
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center rounded-lg px-5 text-[14.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Estado de página centrado (confirmação de e-mail, link inválido, sucesso…).
 * Padrão único: ícone + título claro + explicação humana + próxima ação.
 */
export function AuthState({
  icon: Icon,
  tone = "brand",
  title,
  children,
  actions,
}: {
  icon: LucideIcon;
  tone?: "brand" | "danger";
  title: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div
        className={cn(
          "mx-auto flex size-14 items-center justify-center rounded-2xl",
          tone === "danger" ? "bg-danger/10 text-danger" : "bg-brand/10 text-brand",
        )}
        aria-hidden
      >
        <Icon className="size-7" />
      </div>
      <h1 className="mt-6 font-display text-[clamp(1.6rem,3vw,2rem)] font-bold leading-tight tracking-[-0.02em] text-white">
        {title}
      </h1>
      {children ? (
        <p className="mx-auto mt-3 max-w-sm text-[14.5px] leading-relaxed text-white/55">{children}</p>
      ) : null}
      {actions ? <div className="mt-8 flex flex-col items-center gap-3">{actions}</div> : null}
    </div>
  );
}

/** Link discreto para voltar à landing. */
export function AuthBackToSite({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px] text-white/55 transition-colors hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded",
        className,
      )}
    >
      <ArrowLeft className="size-3.5" aria-hidden />
      Voltar ao site
    </Link>
  );
}
