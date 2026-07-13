import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { siteConfig } from "@/config/site";
import { landingBenefits } from "@/mocks/landing";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20">
      <div className="max-w-3xl text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-small font-medium text-ink-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60" />
            <span className="relative inline-flex size-2 rounded-full bg-brand" />
          </span>
          {siteConfig.tagline}
        </span>

        <h1 className="mt-6 font-display text-[40px] font-bold leading-[1.1] tracking-tight text-ink sm:text-[56px]">
          Venda mais.
          <br />
          Automatize tudo.
          <br />
          <span className="text-brand">Escale sem limites.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-body text-ink-2 sm:text-[16px]">
          {siteConfig.description}
        </p>

        <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg">
            <Link href="/login">
              Começar agora
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="#plataforma">Conhecer a plataforma</Link>
          </Button>
        </div>

        <ul className="mt-6 flex flex-wrap items-center justify-start gap-x-5 gap-y-2">
          {landingBenefits.map((benefit) => (
            <li key={benefit} className="inline-flex items-center gap-1.5 text-small text-ink-2">
              <Check className="size-4 text-success" aria-hidden />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12">
        <DashboardPreview />
      </div>
    </section>
  );
}
