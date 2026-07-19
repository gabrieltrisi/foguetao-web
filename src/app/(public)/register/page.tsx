import type { Metadata } from "next";
import { Suspense } from "react";
import { JetBrains_Mono } from "next/font/google";
import { LoginHero } from "@/components/auth/login-hero";
import { RegisterForm } from "@/components/auth/register-form";
import { HudCorners, HudGrid } from "@/components/site/hud";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Criar acesso — Foguetão",
  description: "Crie sua conta e assuma o comando da operação.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <main
      className={`${jetbrainsMono.variable} selection:bg-brand relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080a] p-4 text-white antialiased selection:text-white sm:p-6`}
    >
      <HudGrid mask="radial-gradient(120% 80% at 50% 40%, #000 20%, transparent 75%)" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(60% 50% at 30% 40%, rgba(224,7,15,0.08), transparent 70%)",
        }}
      />

      <HudCorners />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-sm lg:min-h-[640px] lg:grid-cols-2">
        <LoginHero
          eyebrow="Missão 001 — Novo comando"
          status="Recrutando · Aberto"
          title={
            <>
              Sua operação,
              <br />
              no <span className="text-brand">centro do comando</span>.
            </>
          }
          description={
            <>
              Crie o acesso e o radar liga na hora: contatos, pipeline e conversas
              do WhatsApp em um só painel. 14 dias, sem cartão.
            </>
          }
        />
        <div className="flex flex-col justify-center px-6 py-14 sm:px-14">
          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
