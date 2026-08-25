import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Criar conta — Foguetão",
  description: "Crie seu acesso e comece a organizar sua operação comercial.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <AuthShell>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
