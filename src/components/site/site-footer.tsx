import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { TelemetryLabel } from "./primitives";

/**
 * Rodapé — fecha o console. Não é um footer de template: marca à esquerda com
 * status de sistema, colunas de navegação real (sem link morto) e uma barra
 * inferior honesta. Sem CNPJ/endereço/redes inventados; links legais ainda não
 * existem, então aparecem como "em breve" em vez de apontar para 404.
 */
export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/8 bg-[#08080a]">
      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Marca */}
          <div className="max-w-xs">
            <Logo variant="mono" white className="h-6 w-auto" />
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              O centro de comando da sua operação comercial. Leads no radar, vendas
              sob comando.
            </p>
            <div className="mt-5">
              <TelemetryLabel live>Sistemas · Nominal</TelemetryLabel>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="text-[13.5px] text-white/65 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="text-[13.5px] text-white/30">
                        {link.label}
                        <span className="ml-2 font-mono text-[9px] tracking-[0.2em] text-white/25 uppercase">
                          em breve
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <span className="font-mono text-[11px] tracking-[0.2em] text-white/30 uppercase">
            © 2026 Foguetão
          </span>
          <span className="font-mono text-[11px] tracking-[0.2em] text-white/30 uppercase">
            Feito no Brasil · Suporte em português
          </span>
        </div>
      </div>
    </footer>
  );
}

interface FooterLink {
  label: string;
  href?: string;
}

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Produto",
    links: [
      { label: "Sinal", href: "/#sinal" },
      { label: "Operação", href: "/#operacao" },
      { label: "Controle", href: "/#controle" },
      { label: "Escala", href: "/#escala" },
    ],
  },
  {
    title: "Comece",
    links: [
      { label: "Planos", href: "/#planos" },
      { label: "Perguntas", href: "/#faq" },
      { label: "Criar acesso", href: "/register" },
      { label: "Entrar", href: "/login" },
    ],
  },
  {
    title: "Legal",
    links: [{ label: "Termos" }, { label: "Privacidade" }],
  },
];
