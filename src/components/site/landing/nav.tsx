import Link from "next/link";
import { LandingLogo } from "./brand-logo";
import { LandingButton } from "./button";

/** Navbar minimalista da landing — logo, âncoras e acesso. Sem HUD/telemetria. */
export function LandingNav({ registerHref = "/register" }: { registerHref?: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#08080a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6 sm:px-8">
        <Link href="/" aria-label="Foguetão — início" className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          <LandingLogo priority className="h-7" />
        </Link>

        <nav aria-label="Seções" className="hidden items-center gap-8 md:flex">
          {[
            { label: "Produto", href: "#produto" },
            { label: "Recursos", href: "#recursos" },
            { label: "Segurança", href: "#seguranca" },
            { label: "Perguntas", href: "#faq" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13.5px] font-medium text-white/60 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-[13.5px] font-medium text-white/70 transition-colors hover:text-white sm:inline-flex"
          >
            Entrar
          </Link>
          <LandingButton href={registerHref}>Começar agora</LandingButton>
        </div>
      </div>
    </header>
  );
}
