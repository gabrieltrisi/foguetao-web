import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar senha — Foguetão",
  description: "Recupere o acesso à sua conta do Foguetão CRM.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
