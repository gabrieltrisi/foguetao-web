import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailClient } from "@/components/auth/verify-email-client";

export const metadata: Metadata = {
  title: "Confirmar e-mail — Foguetão",
  description: "Confirmação de acesso ao Foguetão CRM.",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <Suspense>
        <VerifyEmailClient />
      </Suspense>
    </AuthShell>
  );
}
