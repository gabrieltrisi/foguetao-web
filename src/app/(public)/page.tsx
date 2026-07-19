import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { SiteFrame } from "@/components/site/site-frame";
import { SiteNav } from "@/components/site/site-nav";
import { HeroCommand } from "@/components/site/hero-command";
import { SignalSection, ControlSection, ScaleSection } from "@/components/site/mission";
import { InterfaceOrbit } from "@/components/site/interface-orbit";
import { Pricing } from "@/components/site/pricing";
import { Faq } from "@/components/site/faq";
import { Launch } from "@/components/site/launch";
import { SiteFooter } from "@/components/site/site-footer";
import { siteConfig } from "@/config/site";

/** Telemetria/HUD. Escopada à landing pelo `.variable` no wrapper. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Foguetão — o centro de comando da sua operação",
  description:
    "O console onde leads viram missões, o pipeline vira trajetória e cada número responde em tempo real. CRM, WhatsApp e campanhas sob um só comando.",
  openGraph: {
    title: "Foguetão — centro de comando comercial",
    description: "Leads no radar, vendas sob comando. O console da sua operação.",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className={jetbrainsMono.variable}>
      <SiteFrame>
        <SiteNav />
        <main>
          <HeroCommand />
          <SignalSection />
          <InterfaceOrbit />
          <ControlSection />
          <ScaleSection />
          <Pricing />
          <Faq />
          <Launch />
        </main>
        <SiteFooter />
      </SiteFrame>
    </div>
  );
}
