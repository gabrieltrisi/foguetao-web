import type { Metadata } from "next";
import { LoginHero } from "@/components/auth/login-hero";
import { LoginForm } from "@/components/auth/login-form";
import { mockCredentials } from "@/mocks/account";

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
          <LoginForm />
          <p className="mx-auto mt-8 max-w-sm rounded-lg bg-surface px-3 py-2 text-center text-caption text-ink-3">
            Acesso de demonstração · <span className="font-medium text-ink-2">{mockCredentials.email}</span>{" "}
            / <span className="font-medium text-ink-2">{mockCredentials.password}</span>
          </p>
        </div>
      </div>
    </main>
  );
}
