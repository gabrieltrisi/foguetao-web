import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { landingNav } from "@/mocks/landing";

export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-white">
      {/* Faixa de CTA final */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-line bg-ink px-6 py-12 text-center">
          <h2 className="max-w-2xl font-display text-h1 font-bold text-white sm:text-[28px]">
            Pronto para acelerar sua operação?
          </h2>
          <p className="max-w-xl text-body text-white/70">
            Comece com 14 dias grátis, sem cartão e com suporte em português.
          </p>
          <Button asChild size="lg">
            <Link href="/login">
              Começar agora
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>

      {/* Rodapé */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo />
          <nav aria-label="Rodapé" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {landingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-small text-ink-2 transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="text-small text-ink-3">© 2026 {siteConfig.name}</p>
        </div>
      </div>
    </footer>
  );
}
