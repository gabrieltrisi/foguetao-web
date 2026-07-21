import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { LandingNav } from "@/components/site/landing/nav";
import { LandingHero } from "@/components/site/landing/hero";
import { LandingProblem } from "@/components/site/landing/problem";
import { LandingPillars } from "@/components/site/landing/pillars";
import { LandingShowcase } from "@/components/site/landing/showcase";
import { LandingBenefits } from "@/components/site/landing/benefits";
import { LandingFeatures } from "@/components/site/landing/features";
import { LandingSecurity } from "@/components/site/landing/security";
import { LandingComparison } from "@/components/site/landing/comparison";
import { LandingFaq } from "@/components/site/landing/faq";
import { LandingCta } from "@/components/site/landing/cta";
import { LandingFooter } from "@/components/site/landing/footer";
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

export default function LandingPage() {
  return (
    <div
      className={`${jetbrainsMono.variable} min-h-screen overflow-x-hidden bg-[#08080a] text-white antialiased`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNav />
      <main>
        <LandingHero />
        <LandingProblem />
        <LandingPillars />
        <LandingShowcase />
        <LandingBenefits />
        <LandingFeatures />
        <LandingSecurity />
        <LandingComparison />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
