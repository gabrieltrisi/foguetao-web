"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MailWarning } from "lucide-react";
import { useVerifyEmail } from "@/hooks/auth/use-verify-email";
import { isApiError } from "@/types/api/error";
import { AuthState, AuthLinkButton } from "@/components/auth/auth-ui";

/**
 * Confirma o e-mail a partir do token na URL e, em sucesso, entra direto no
 * painel (o BFF já definiu os cookies). Estados: confirmando, sucesso
 * (redireciona) e erro (token inválido/expirado).
 */
export function VerifyEmailClient() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const verify = useVerifyEmail();
  const started = React.useRef(false);

  React.useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verify.mutate(token, {
      onSuccess: () => router.replace("/dashboard"),
    });
  }, [token, verify, router]);

  const status: "no-token" | "verifying" | "success" | "error" = !token
    ? "no-token"
    : verify.isSuccess
      ? "success"
      : verify.isError
        ? "error"
        : "verifying";

  if (status === "verifying" || status === "success") {
    return (
      <div className="text-center" aria-live="polite">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Loader2 className="size-7 animate-spin" aria-hidden />
        </div>
        <h1 className="mt-6 font-display text-[clamp(1.6rem,3vw,2rem)] font-bold tracking-[-0.02em] text-white">
          {status === "success" ? "Confirmado!" : "Confirmando seu e-mail…"}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[14.5px] leading-relaxed text-white/55">
          {status === "success" ? "Abrindo seu painel…" : "Validando seu link de confirmação."}
        </p>
      </div>
    );
  }

  return (
    <AuthState
      icon={MailWarning}
      tone="danger"
      title="Link inválido"
      actions={
        <>
          <AuthLinkButton href="/login">Ir para o login</AuthLinkButton>
          <Link
            href="/register"
            className="text-[13.5px] text-white/50 transition-colors hover:text-white/80"
          >
            Criar uma nova conta
          </Link>
        </>
      }
    >
      {status === "no-token"
        ? "O link de confirmação está incompleto. Abra-o direto do e-mail que enviamos."
        : errorMessage(verify.error)}
    </AuthState>
  );
}

function errorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.statusCode === 400) return "Este link não é mais válido. Solicite um novo pelo login.";
    if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
  }
  return "Não foi possível confirmar o e-mail. Tente novamente.";
}
