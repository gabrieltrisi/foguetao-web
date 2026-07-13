import { LandingHeader } from "@/components/landing/landing-header";
import { Hero } from "@/components/landing/hero";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { PlatformSection } from "@/components/landing/platform-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <FeatureGrid />
        <PlatformSection />
      </main>
      <LandingFooter />
    </div>
  );
}
