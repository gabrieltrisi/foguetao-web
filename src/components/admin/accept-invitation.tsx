"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useAcceptInvitation } from "@/hooks/company/use-team";
import { messageForTeamError, roleLabel } from "@/lib/company/team";

/** Formato real do token: 64 chars hex opacos. */
const TOKEN_RE = /^[a-f0-9]{64}$/;

/**
 * Aceite de convite. O backend expõe a rota apenas AUTENTICADA e exige que o
 * e-mail da conta logada seja o mesmo do convite — não existe fluxo público de
 * "aceitar e criar conta", nem endpoint para pré-visualizar o convite. Por
 * isso esta tela mostra o e-mail da sessão atual antes de confirmar.
 */
export function AcceptInvitation({ token }: { token: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, switchCompany } = useSession();
  const accept = useAcceptInvitation();
  const [accepted, setAccepted] = React.useState<{ company: string; role: string } | null>(null);

  if (!TOKEN_RE.test(token)) {
    return (
      <ErrorState
        title="Convite inválido."
        message="Verifique se o link foi copiado por inteiro."
      />
    );
  }

  if (accepted) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4 py-10">
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-6" aria-hidden />
          </span>
          <h1 className="font-display text-h2 font-semibold text-ink">Convite aceito</h1>
          <p className="text-body2 text-ink-2">
            Você agora faz parte de <span className="font-medium text-ink">{accepted.company}</span>{" "}
            como {accepted.role}.
          </p>
          <Button asChild size="sm" className="mt-2">
            <Link href="/team">Ir para a equipe</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 py-10">
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-dark">
          <Mail className="size-6" aria-hidden />
        </span>
        <h1 className="font-display text-h2 font-semibold text-ink">Você recebeu um convite</h1>
        <p className="text-body2 text-ink-2">
          O convite será aceito com a conta{" "}
          <span className="font-medium text-ink">{user?.email ?? "—"}</span>. Ele só funciona se for
          o mesmo e-mail que recebeu o convite.
        </p>
        <Button
          size="sm"
          className="mt-2"
          loading={accept.isPending}
          onClick={() =>
            accept.mutate(token, {
              onSuccess: async (result) => {
                setAccepted({ company: result.company.name, role: roleLabel[result.role] });
                toast({ title: "Convite aceito", variant: "success" });
                // A sessão mudou (nova empresa): entra nela.
                await switchCompany(result.company.id).catch(() => router.refresh());
              },
              onError: (e) => toast({ title: messageForTeamError(e), variant: "error" }),
            })
          }
        >
          Aceitar convite
        </Button>
      </Card>
    </div>
  );
}
