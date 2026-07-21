"use client";

import { MailCheck } from "lucide-react";
import { AuthState, AuthLinkButton } from "@/components/auth/auth-ui";

/**
 * Estado "confirme seu e-mail" — mostrado após o cadastro e quando o login é
 * negado por e-mail não confirmado. Padrão visual único (AuthState).
 */
export function CheckEmailPanel({
  email,
  onResend,
  resending,
}: {
  email: string;
  onResend: () => void | Promise<void>;
  resending?: boolean;
}) {
  return (
    <AuthState
      icon={MailCheck}
      title="Confirme seu e-mail"
      actions={
        <>
          <p className="text-[13.5px] text-white/50">
            Não recebeu?{" "}
            <button
              type="button"
              onClick={onResend}
              disabled={resending}
              className="rounded font-medium text-brand underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
            >
              {resending ? "Reenviando…" : "Reenviar e-mail"}
            </button>
          </p>
          <AuthLinkButton href="/login" variant="ghost">
            Voltar para o login
          </AuthLinkButton>
        </>
      }
    >
      Enviamos um link de confirmação para{" "}
      <span className="font-medium text-white/80">{email}</span>. Clique nele para ativar seu acesso
      e começar o teste de 14 dias.
    </AuthState>
  );
}
