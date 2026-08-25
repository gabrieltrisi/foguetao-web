"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Mail, MoreHorizontal, Pencil, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { StatusBadge } from "@/components/business/badges";
import { KPIBlock, StatList } from "@/components/business/kpi-block";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useOrganization, useOrgContacts, useDeleteOrganization } from "@/hooks/crm/use-organizations";
import { useOrgCustomFields, useSetOrgCustomFields } from "@/hooks/crm/use-custom-fields";
import { CustomFieldsSection } from "@/components/crm/custom-fields-section";
import { organizationSizeLabel, contactStatusMeta, formatDate } from "@/lib/crm/display";
import { isApiError } from "@/types/api/error";

export function OrganizationDetail({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { can } = useSession();
  const { data: o, isLoading, isError, error, refetch } = useOrganization(id);
  const contacts = useOrgContacts(id, { limit: 50 });
  const del = useDeleteOrganization();
  // A organização não embute os valores no detalhe — leitura por endpoint próprio.
  const customFields = useOrgCustomFields(id);
  const setCustomFields = useSetOrgCustomFields(id);

  const canUpdate = can("crm.organizations.update");
  const canDelete = can("crm.organizations.delete");

  if (isLoading) {
    return <p className="py-16 text-center text-body2 text-ink-3">Carregando organização…</p>;
  }
  if (isError || !o) {
    const notFound = isApiError(error) && error.statusCode === 404;
    return (
      <ErrorState
        title={notFound ? "Organização não encontrada." : "Não foi possível carregar a organização."}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }

  const contactsTotal = contacts.data?.total ?? 0;

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-3 p-5 text-center">
        <EntityAvatar name={o.name} type="company" size="lg" className="size-16" />
        <div>
          <p className="font-display text-h3 font-semibold text-ink">{o.name}</p>
          {o.industry ? <p className="text-caption text-ink-3">{o.industry}</p> : null}
        </div>
        {o.size ? <Badge tone="neutral">{organizationSizeLabel[o.size]}</Badge> : null}
      </Card>
      <Card className="grid grid-cols-1 gap-2 p-4 text-center">
        <KPIBlock label="Contatos vinculados" value={String(contactsTotal)} className="items-center" />
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={o.name}
      subtitle={o.industry ?? undefined}
      back={{ href: "/organizations", label: "Organizações" }}
      actions={
        <>
          {canUpdate ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/organizations/${id}/edit`}>
                <Pencil />
                Editar
              </Link>
            </Button>
          ) : null}
          {canDelete ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="secondary" aria-label="Mais ações">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-body2 text-danger hover:bg-surface [&_svg]:text-danger"
                    >
                      <Trash2 className="size-4" aria-hidden /> Excluir organização
                    </button>
                  }
                  title="Excluir organização?"
                  description="Só é possível excluir organizações sem contatos vinculados."
                  confirmLabel="Excluir"
                  destructive
                  onConfirm={() =>
                    del.mutate(id, {
                      onSuccess: () => {
                        toast({ title: "Organização excluída", variant: "success" });
                        router.push("/organizations");
                      },
                      onError: (e) =>
                        toast({
                          title:
                            isApiError(e) && e.code === "ORGANIZATION_HAS_CONTACTS"
                              ? "Remova ou realoque os contatos antes de excluir."
                              : "Falha ao excluir organização.",
                          variant: "error",
                        }),
                    })
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </>
      }
      aside={aside}
    >
      <Tabs defaultValue="resumo">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="contatos">Contatos ({contactsTotal})</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <div className="flex flex-col gap-4">
            <Card className="p-5">
              <StatList
                items={[
                  { label: "Razão social", value: o.legalName ?? "—" },
                  { label: "Documento", value: o.document ?? "—" },
                  { label: "E-mail", value: o.email ? <span className="inline-flex items-center gap-1"><Mail className="size-3.5" aria-hidden /> {o.email}</span> : "—" },
                  { label: "Telefone", value: o.phone ? <span className="inline-flex items-center gap-1"><Phone className="size-3.5" aria-hidden /> {o.phone}</span> : "—" },
                  { label: "Website", value: o.website ? <span className="inline-flex items-center gap-1"><Globe className="size-3.5" aria-hidden /> {o.website}</span> : "—" },
                  { label: "Segmento", value: o.industry ?? "—" },
                  { label: "Porte", value: o.size ? organizationSizeLabel[o.size] : "—" },
                  { label: "Criada em", value: formatDate(o.createdAt) },
                ]}
              />
            </Card>

            <CustomFieldsSection
              entityType="ORGANIZATION"
              values={customFields.data ?? []}
              valuesLoading={customFields.isLoading}
              valuesError={customFields.isError}
              canEdit={canUpdate}
              saving={setCustomFields.isPending}
              onSave={(payload) => setCustomFields.mutateAsync(payload)}
            />
          </div>
        </TabsContent>

        <TabsContent value="contatos">
          <Card className="divide-y divide-line">
            {contacts.isLoading ? (
              <p className="p-5 text-body2 text-ink-3">Carregando contatos…</p>
            ) : (contacts.data?.items.length ?? 0) === 0 ? (
              <p className="p-5 text-body2 text-ink-3">Nenhum contato vinculado.</p>
            ) : (
              contacts.data!.items.map((c) => (
                <Link key={c.id} href={`/contacts/${c.id}`} className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-surface">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <EntityAvatar name={c.fullName} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{c.fullName}</p>
                      {c.email ? <p className="truncate text-caption text-ink-3">{c.email}</p> : null}
                    </div>
                  </div>
                  <StatusBadge tone={contactStatusMeta[c.status].tone}>{contactStatusMeta[c.status].label}</StatusBadge>
                </Link>
              ))
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </DetailPageLayout>
  );
}
