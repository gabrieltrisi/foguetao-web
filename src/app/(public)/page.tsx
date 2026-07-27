import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { LandingNav } from "@/components/site/landing/nav";
import { LandingHero } from "@/components/site/landing/hero";
import { LandingProblem } from "@/components/site/landing/problem";
import { LandingPillars } from "@/components/site/landing/pillars";
import { LandingShowcase } from "@/components/site/landing/showcase";
import { LandingProof } from "@/components/site/landing/proof";
import { LandingBenefits } from "@/components/site/landing/benefits";
import { LandingFeatures } from "@/components/site/landing/features";
import { LandingSecurity } from "@/components/site/landing/security";
import { LandingComparison } from "@/components/site/landing/comparison";
import { LandingFaq } from "@/components/site/landing/faq";
import { LandingCta } from "@/components/site/landing/cta";
import { LandingFooter } from "@/components/site/landing/footer";
import { QuizCtaStrip } from "@/components/site/landing/quiz-cta-strip";
import { QuizStickyCta } from "@/components/site/landing/quiz-sticky-cta";
import { SegmentReconciler } from "@/components/site/landing/segment-reconciler";
import { QuizProvider } from "@/features/landing/quiz";
import {
  getLandingContent,
  hasUrlSegment,
  isSegmentId,
  resolveSegmentId,
} from "@/config/landing/segments";
import { SEGMENT_COOKIE, SEGMENT_PARAM, withSegment } from "@/lib/landing/segment";
import { siteConfig } from "@/config/site";

/** Fonte mono usada nos eyebrows/telemetria. Escopada à landing via `.variable`. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const description =
  "O CRM brasileiro que reúne contatos, pipeline, negócios, tarefas e campanhas em um só painel — com números em tempo real. Organize sua operação comercial e cresça com controle.";

/**
 * Metadata SEMPRE geral, com canonical fixo em "/". A personalização por
 * `?segment=` é uma camada de UX — não gera páginas/SEO distintos nem conteúdo
 * duplicado. A Landing geral continua sendo a página canônica.
 */
export const metadata: Metadata = {
  title: "Foguetão — CRM para times comerciais que crescem",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Foguetão — CRM para times comerciais que crescem",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Foguetão — CRM para times comerciais que crescem",
    description,
  },
};

/** Dados estruturados (Schema.org) — sem preço/avaliações inventados. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Foguetão",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: siteConfig.url,
  description,
  inLanguage: "pt-BR",
  publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
};

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Prioridade URL > Cookie (localStorage é reconciliado no cliente). O SSR só
  // depende de URL+cookie → determinístico, sem hydration mismatch.
  const params = await searchParams;
  const raw = params[SEGMENT_PARAM];
  const urlSegment = Array.isArray(raw) ? raw[0] : raw;
  const cookieSegment = (await cookies()).get(SEGMENT_COOKIE)?.value;

  const active = resolveSegmentId({ url: urlSegment, cookie: cookieSegment });
  const fromUrl = isSegmentId(urlSegment);
  const urlPresent = hasUrlSegment(urlSegment);
  const content = getLandingContent(active);
  const registerHref = withSegment("/register", active);

  return (
    <div
      className={`${jetbrainsMono.variable} min-h-screen overflow-x-hidden bg-[#08080a] text-white antialiased`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SegmentReconciler active={active} fromUrl={fromUrl} urlPresent={urlPresent} />
      <QuizProvider active={active}>
        <LandingNav registerHref={registerHref} />
        <main>
          <LandingHero
            content={content.hero}
            registerHref={registerHref}
            dashboard={content.crm.dashboard}
          />
          <LandingProblem problems={content.problems} />
          <LandingPillars />
          <LandingShowcase crm={content.crm} />
          <LandingProof proof={content.proof} />
          <LandingBenefits benefits={content.benefits} />
          <LandingFeatures highlight={content.highlightFeatures} />
          <LandingSecurity />
          <LandingComparison note={content.comparisonNote} />
          <QuizCtaStrip />
          <LandingFaq faq={content.faq} />
          <LandingCta content={content.finalCta} registerHref={registerHref} />
        </main>
        <LandingFooter />
        <QuizStickyCta />
      </QuizProvider>
    </div>
  );
}
