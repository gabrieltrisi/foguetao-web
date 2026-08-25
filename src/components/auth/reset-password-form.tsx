"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TriangleAlert, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validations/auth";
import { useResetPassword } from "@/hooks/auth/use-password-reset";
import { isApiError } from "@/types/api/error";
import {
  AuthHeader,
  AuthSubmit,
  AuthAlert,
  AuthFieldError,
  AuthState,
  AuthLinkButton,
  authFieldClass,
  authLabelClass,
} from "@/components/auth/auth-ui";

const PASSWORD_HINT = "Mín. 10 caracteres · maiúscula · minúscula · número · símbolo";

function messageForError(error: unknown): string {
  if (isApiError(error)) {
    if (error.statusCode === 400) return "Este link não é mais válido. Solicite uma nova recuperação.";
    if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
    if (error.statusCode === 429)
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  return "Não foi possível redefinir a senha agora. Tente novamente em instantes.";
}

export function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const { toast } = useToast();
  const reset = useResetPassword();
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) return;
    setAuthError(null);
    try {
      await reset.mutateAsync({ token, newPassword: values.newPassword });
      setDone(true);
      toast({ title: "Senha redefinida", description: "Use a nova senha para entrar.", variant: "success" });
    } catch (error) {
      setAuthError(messageForError(error));
    }
  }

  // Sem token na URL: link incompleto/inválido.
  if (!token) {
    return (
      <AuthState
        icon={TriangleAlert}
        tone="danger"
        title="Link inválido"
        actions={
          <>
            <AuthLinkButton href="/forgot-password">Solicitar novo link</AuthLinkButton>
            <AuthLinkButton href="/login" variant="ghost">
              Voltar para o login
            </AuthLinkButton>
          </>
        }
      >
        O link de redefinição está incompleto ou expirou. Solicite um novo pela tela de recuperação.
      </AuthState>
    );
  }

  // Sucesso.
  if (done) {
    return (
      <AuthState
        icon={ShieldCheck}
        title="Senha redefinida"
        actions={<AuthLinkButton href="/login">Ir para o login</AuthLinkButton>}
      >
        Sua senha foi redefinida com sucesso. Agora é só entrar com a nova senha.
      </AuthState>
    );
  }

  return (
    <div>
      <AuthHeader title="Crie uma nova senha">Escolha uma senha forte para proteger o acesso.</AuthHeader>

      {authError ? <AuthAlert>{authError}</AuthAlert> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword" className={authLabelClass}>
            Nova senha
          </Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            placeholder="Crie uma senha forte"
            aria-invalid={Boolean(errors.newPassword)}
            aria-describedby={errors.newPassword ? "new-password-error" : "new-password-hint"}
            disabled={isSubmitting}
            className={authFieldClass}
            {...register("newPassword")}
          />
          {errors.newPassword ? (
            <AuthFieldError id="new-password-error">{errors.newPassword.message}</AuthFieldError>
          ) : (
            <p id="new-password-hint" className="text-[12px] text-white/40">
              {PASSWORD_HINT}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword" className={authLabelClass}>
            Confirmar senha
          </Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            disabled={isSubmitting}
            className={authFieldClass}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <AuthFieldError id="confirm-password-error">{errors.confirmPassword.message}</AuthFieldError>
          ) : null}
        </div>

        <AuthSubmit loading={isSubmitting} className="mt-1">
          Redefinir senha
        </AuthSubmit>
      </form>

      <p className="mt-8 text-center text-[13.5px] text-white/50">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-semibold text-white transition-colors hover:text-brand">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
