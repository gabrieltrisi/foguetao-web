"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Combobox } from "@/components/ui/combobox";
import { FormPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useCreateInvitation } from "@/hooks/company/use-team";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { assignableRoles, messageForTeamError, roleLabel } from "@/lib/company/team";
import type { CompanyRole } from "@/types/api/company";

/**
 * "Criar usuário" na prática é CONVIDAR: o backend não cria contas por aqui —
 * ele emite um convite que a pessoa aceita com a própria conta.
 */
export function TeamForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { can, role: actorRole } = useSession();
  const create = useCreateInvitation();

  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<string>("VIEWER");

  if (!can(PERMISSIONS.COMPANY_MEMBERS_INVITE)) {
    return (
      <p className="py-16 text-center text-body2 text-ink-3">
        Você não tem permissão para convidar membros.
      </p>
    );
  }

  // O backend recusa convite com papel OWNER (403), qualquer que seja o ator.
  const roleOptions = assignableRoles(actorRole ?? "VIEWER")
    .filter((r) => r !== "OWNER")
    .map((r) => ({ value: r, label: roleLabel[r] }));

  async function handleSave() {
    try {
      await create.mutateAsync({ email: email.trim(), role: role as CompanyRole });
      toast({ title: `Convite enviado para ${email.trim()}`, variant: "success" });
      router.push("/invitations");
    } catch (error) {
      toast({ title: messageForTeamError(error), variant: "error" });
    }
  }

  return (
    <FormPageLayout
      title="Convidar membro"
      description="Envie um convite para alguém participar desta empresa."
      back={{ href: "/team", label: "Equipe" }}
      footer={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href="/team">Cancelar</Link>
          </Button>
          <Button
            size="sm"
            loading={create.isPending}
            disabled={!email.trim() || create.isPending}
            onClick={handleSave}
          >
            Enviar convite
          </Button>
        </>
      }
    >
      <Card className="flex flex-col gap-5 p-5">
        <div className="flex items-start gap-2 rounded-lg bg-surface p-3 text-body2 text-ink-2">
          <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
          <span>
            O convidado precisa ter uma conta com este mesmo e-mail para aceitar. O papel OWNER não
            pode ser concedido por convite.
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="tf-email" label="E-mail" required className="sm:col-span-2">
            {(p) => (
              <Input
                type="email"
                inputMode="email"
                placeholder="pessoa@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                {...p}
              />
            )}
          </FormField>

          <FormField id="tf-role" label="Papel" description="Define as permissões na empresa.">
            {(p) => (
              <Combobox id={p.id} options={roleOptions} value={role} onValueChange={setRole} />
            )}
          </FormField>
        </div>
      </Card>
    </FormPageLayout>
  );
}
