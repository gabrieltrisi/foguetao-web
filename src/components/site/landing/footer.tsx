import Link from "next/link";
import { LandingLogo } from "./brand-logo";

const COLUMNS = [
  {
    title: "Produto",
    links: [
      { label: "Ver o produto", href: "#produto" },
      { label: "Recursos", href: "#recursos" },
      { label: "Segurança", href: "#seguranca" },
      { label: "Perguntas", href: "#faq" },
    ],
  },
  {
    title: "Comece",
    links: [
      { label: "Criar conta", href: "/register" },
      { label: "Entrar", href: "/login" },
    ],
  },
];

/** Footer sóbrio — sem redes/CNPJ/legal inventados. Só o que é real. */
export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.07]">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-6 py-16 sm:px-8 md:grid-cols-[1.4fr_repeat(2,1fr)]">
        <div>
          <LandingLogo className="h-7" />
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-white/55">
            O CRM que organiza sua operação comercial e coloca o seu crescimento em trajetória.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/60">{col.title}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-white/60 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.07]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-2 px-6 py-6 text-[12.5px] text-white/60 sm:flex-row sm:px-8">
          <span>© 2026 Foguetão</span>
          <span>Feito no Brasil · Suporte em português</span>
        </div>
      </div>
    </footer>
  );
}
