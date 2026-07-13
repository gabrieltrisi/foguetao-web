import { Rocket } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";

/** Painel esquerdo do login (marca) — visível apenas em telas médias+. */
export function LoginHero() {
  return (
    <div className="relative hidden overflow-hidden bg-brand p-10 text-white lg:flex lg:flex-col">
      {/* Formas geométricas discretas derivadas da identidade */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-10 size-96 rounded-full bg-brand-dark/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-24 left-16 size-40 rounded-full bg-white/5"
      />

      <div className="relative z-10">
        <Logo tone="white" />
      </div>

      <div className="relative z-10 mt-auto">
        <span
          aria-hidden
          className="mb-6 flex size-11 items-center justify-center rounded-xl bg-white/15"
        >
          <Rocket className="size-5" />
        </span>
        <h2 className="max-w-sm font-display text-[32px] font-bold leading-tight">
          Sua operação em um só lugar.
        </h2>
        <p className="mt-3 max-w-sm text-body text-white/80">
          Gerencie contatos, oportunidades, mensagens, campanhas e performance com mais clareza.
        </p>
      </div>

      <p className="relative z-10 mt-10 text-small text-white/70">
        © 2026 {siteConfig.name} · CRM de performance
      </p>
    </div>
  );
}
