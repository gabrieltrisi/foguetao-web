import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginHero } from "@/components/auth/login-hero";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta Foguetão.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-0 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden border border-line bg-white shadow-sm sm:rounded-2xl lg:grid-cols-2 lg:min-h-[620px]">
        <LoginHero />
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
