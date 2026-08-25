"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Info, Pause, Play, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatList } from "@/components/business/kpi-block";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import {
  useRemoveMember,
  useTeamMember,
  useTeamMembers,
  useUpdateMember,
} from "@/hooks/company/use-team";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  assignableRoles,
  formatDate,
  memberAbilities,
  memberStatusMeta,
  messageForTeamError,
  roleLabel,
} from "@/lib/company/team";
import { isApiError } from "@/types/api/error";
import type { CompanyRole } from "@/types/api/company";

export function TeamMemberProfile({ memberId }: { memberId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { can, user, role: actorRole } = useSession();
  const { data: member, isLoading, isError, error, refetch } = useTeamMember(memberId);

  // Serve só para saber se este é o ÚLTIMO OWNER ativo — dica de UI. A
  // autoridade continua sendo o backend (409 LAST_OWNER_REQUIRED).
  const owners = useTeamMembers({ limit: 100, role: "OWNER", status: "ACTIVE" });

  const update = useUpdateMember(memberId);
  const remove = useRemoveMember();
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const [nextRole, setNextRole] = React.useState("");

  if (!can(PERMISSIONS.COMPANY_MEMBERS_READ)) {
    return (
      <p className="py-16 text-center text-body2 text-ink-3">
        Você não tem permissão para ver os membros desta empresa.
      </p>
    );
  }
  if (isLoading) {
    return <p className="py-16 text-center text-body2 text-ink-3">Carregando membro…</p>;
  }
  if (isError || !member) {
    const notFound = isApiError(error) && error.statusCode === 404;
    return (
      <ErrorState
        title={notFound ? "Membro não encontrado." : "Não foi possível carregar o membro."}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }

  const status = memberStatusMeta[member.status];
  const onError = (e: unknown) => toast({ title: messageForTeamError(e), variant: "error" });

  const abilities = memberAbilities({
    actorRole: actorRole ?? "VIEWER",
    actorUserId: user?.id ?? "",
    target: member,
    canUpdate: can(PERMISSIONS.COMPANY_MEMBERS_UPDATE),
    canRemove: can(PERMISSIONS.COMPANY_MEMBERS_REMOVE),
    members: owners.data?.items ?? [],
  });

  // Só OWNER concede OWNER — o seletor nem oferece o que seria recusado.
  const roleOptions = assignableRoles(actorRole ?? "VIEWER")
    .filter((r) => r !== member.role)
    .map((r) => ({ value: r, label: roleLabel[r] }));

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          <EntityAvatar name={member.user.name} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{member.user.name}</p>
            <p className="truncate text-caption text-ink-3">{member.user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" className="normal-case">
            {roleLabel[member.role]}
          </Badge>
          <Badge tone={status.tone}>{status.label}</Badge>
          {abilities.isSelf ? <Badge tone="info">Você</Badge> : null}
        </div>
        <StatList
          items={[
            { label: "Entrou em", value: formatDate(member.joinedAt) },
            { label: "Convidado em", value: formatDate(member.createdAt) },
          ]}
        />
      </Card>

      {abilities.blockedReason ? (
        <Card className="flex items-start gap-2 p-4 text-body2 text-ink-2">
          <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
          <span>{abilities.blockedReason}</span>
        </Card>
      ) : null}
    </div>
  );

  return (
    <DetailPageLayout
      title={member.user.name}
      subtitle={member.user.email}
      back={{ href: "/team", label: "Equipe" }}
      actions={
        <>
          {abilities.canSuspend ? (
            <Button
              size="sm"
              variant="secondary"
              loading={update.isPending}
              onClick={() =>
                update.mutate(
                  { status: "SUSPENDED" },
                  {
                    onSuccess: () => toast({ title: "Membro suspenso", variant: "success" }),
                    onError,
                  },
                )
              }
            >
              <Pause />
              Suspender
            </Button>
          ) : null}
          {abilities.canReactivate ? (
            <Button
              size="sm"
              loading={update.isPending}
              onClick={() =>
                update.mutate(
                  { status: "ACTIVE" },
                  {
                    onSuccess: () => toast({ title: "Membro reativado", variant: "success" }),
                    onError,
                  },
                )
              }
            >
              <Play />
              Reativar
            </Button>
          ) : null}
          {abilities.canRemove ? (
            <Button
              size="icon-sm"
              variant="secondary"
              aria-label="Remover membro"
              onClick={() => setConfirmRemove(true)}
            >
              <Trash2 />
            </Button>
          ) : null}
        </>
      }
      aside={aside}
    >
      <div className="flex flex-col gap-4">
        <Card className="flex flex-col gap-3 p-5">
          <div>
            <p className="font-display text-h3 font-semibold text-ink">Papel</p>
            <p className="text-caption text-ink-3">Define as permissões deste membro na empresa.</p>
          </div>

          {abilities.canChangeRole ? (
            roleOptions.length === 0 ? (
              <p className="text-body2 text-ink-3">
                Não há outro papel que você possa conceder a este membro.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <div className="min-w-56 flex-1">
                  <Combobox
                    options={roleOptions}
                    value={nextRole}
                    onValueChange={setNextRole}
                    placeholder={`Atual: ${roleLabel[member.role]}`}
                  />
                </div>
                <Button
                  size="sm"
                  disabled={!nextRole || update.isPending}
                  loading={update.isPending}
                  onClick={() =>
                    update.mutate(
                      { role: nextRole as CompanyRole },
                      {
                        onSuccess: () => {
                          toast({ title: "Papel atualizado", variant: "success" });
                          setNextRole("");
                        },
                        onError,
                      },
                    )
                  }
                >
                  Alterar papel
                </Button>
              </div>
            )
          ) : (
            <p className="text-body2 text-ink-2">
              Papel atual: <span className="font-medium text-ink">{roleLabel[member.role]}</span>
            </p>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remover membro?"
        description={`${member.user.name} perderá o acesso a esta empresa.`}
        confirmLabel="Remover"
        destructive
        onConfirm={() => {
          setConfirmRemove(false);
          remove.mutate(memberId, {
            onSuccess: () => {
              toast({ title: "Membro removido", variant: "success" });
              router.push("/team");
            },
            onError,
          });
        }}
      />
    </DetailPageLayout>
  );
}
