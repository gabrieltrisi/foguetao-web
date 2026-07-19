import type { Metadata } from "next";
import { Suspense } from "react";
import { JetBrains_Mono } from "next/font/google";
import { LoginHero } from "@/components/auth/login-hero";
import { LoginForm } from "@/components/auth/login-form";
import { HudCorners, HudGrid } from "@/components/site/hud";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Acesso — Foguetão",
  description: "Terminal de acesso ao centro de comando.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main
      className={`${jetbrainsMono.variable} selection:bg-brand relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080a] p-4 text-white antialiased selection:text-white sm:p-6`}
    >
      {/* Grade técnica + vinheta (mesma atmosfera da landing) */}
      <HudGrid mask="radial-gradient(120% 80% at 50% 40%, #000 20%, transparent 75%)" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(60% 50% at 30% 40%, rgba(224,7,15,0.08), transparent 70%)",
        }}
      />

      <HudCorners />

      {/* Painel de acesso */}
      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-sm lg:min-h-[640px] lg:grid-cols-2">
        <LoginHero />
        <div className="flex flex-col justify-center px-6 py-14 sm:px-14">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
