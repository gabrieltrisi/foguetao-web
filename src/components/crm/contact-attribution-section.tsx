"use client";

import * as React from "react";
import { Link2, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { FormField } from "@/components/ui/form-field";
import { Modal, ModalContent } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  useContactAttributions,
  useCreateAttribution,
  useDeleteAttribution,
} from "@/hooks/marketing/use-attribution";
import { useActiveLeadSources } from "@/hooks/marketing/use-lead-sources";
import { useCampaigns } from "@/hooks/marketing/use-campaigns";
import {
  filledUtms,
  formatCapturedAt,
  kindLabel,
  messageForAttributionError,
  touchpointOriginLabel,
} from "@/lib/marketing/attribution";
import type { ApiAttribution } from "@/types/api/marketing";

/**
 * Origem do contato — histórico REAL de touchpoints.
 *
 * `firstTouch`/`lastTouch` vêm DERIVADOS do backend; o front não recalcula.
 * Não há nenhuma métrica aqui: origem é de onde o lead veio, não quanto custou.
 */
export function ContactAttributionSection({ contactId }: { contactId: string }) {
  const { can } = useSession();
  const { toast } = useToast();
  const [creating, setCreating] = React.useState(false);
  const [removing, setRemoving] = React.useState<ApiAttribution | null>(null);

  const { data, isLoading, isError, refetch } = useContactAttributions(contactId);
  const remove = useDeleteAttribution(contactId);
  const canCreate = can(PERMISSIONS.MARKETING_ATTRIBUTION_CREATE);
  const canDelete = can(PERMISSIONS.MARKETING_ATTRIBUTION_DELETE);

  if (!can(PERMISSIONS.MARKETING_ATTRIBUTION_READ)) {
    return (
      <Card className="p-5">
        <p className="text-body2 text-ink-3">
          Você não tem permissão para ver a origem deste contato.
        </p>
      </Card>
    );
  }
  if (isLoading) {
    return (
      <Card className="p-5">
        <p className="text-body2 text-ink-3">Carregando origem…</p>
      </Card>
    );
  }
  if (isError || !data) {
    return (
      <ErrorState
        variant="card"
        title="Não foi possível carregar a origem."
        onRetry={() => refetch()}
      />
    );
  }

  async function handleDelete() {
    if (!removing) return;
    try {
      await remove.mutateAsync(removing.id);
      toast({ title: "Toque removido", variant: "success" });
      setRemoving(null);
    } catch (error) {
      toast({ title: messageForAttributionError(error), variant: "error" });
    }
  }

  /** Um único toque: primeiro e último são o mesmo — não repetir o card. */
  const single = data.total === 1;

  return (
    <div className="flex flex-col gap-4">
      {data.total === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <span className="bg-surface text-ink-3 flex size-10 items-center justify-center rounded-xl">
            <Link2 className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-body text-ink font-medium">Origem não registrada.</p>
            <p className="text-body2 text-ink-3 mt-1">
              Este contato não tem nenhum toque registrado. Nada é presumido: registre de onde ele
              veio para acompanhar a origem.
            </p>
          </div>
          {canCreate ? (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus />
              Registrar origem
            </Button>
          ) : null}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TouchCard label="Primeiro toque" attribution={data.firstTouch} />
            {!single ? <TouchCard label="Último toque" attribution={data.lastTouch} /> : null}
          </div>

          <div className="flex items-center justify-between">
            <p className="font-display text-h3 text-ink font-semibold">
              Histórico ({data.total} {data.total === 1 ? "toque" : "toques"})
            </p>
            {canCreate ? (
              <Button size="sm" variant="secondary" onClick={() => setCreating(true)}>
                <Plus />
                Registrar toque
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            {data.items.map((a) => (
              <TouchpointCard
                key={a.id}
                attribution={a}
                onRemove={canDelete ? () => setRemoving(a) : undefined}
              />
            ))}
          </div>
        </>
      )}

      {creating ? (
        <AttributionModal contactId={contactId} onClose={() => setCreating(false)} />
      ) : null}

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remover este toque?"
        description="O toque sai do histórico de origem do contato. A origem já registrada no contato não é revertida."
        confirmLabel="Remover"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

/** Primeiro/último toque — derivados pelo backend. */
function TouchCard({ label, attribution }: { label: string; attribution: ApiAttribution | null }) {
  if (!attribution) return null;
  return (
    <Card className="p-4">
      <p className="text-caption text-ink-3 font-semibold tracking-wide uppercase">{label}</p>
      <p className="font-display text-h3 text-ink mt-1 font-semibold">
        {attribution.leadSource.name}
      </p>
      <p className="text-body2 text-ink-3 mt-0.5">{formatCapturedAt(attribution.capturedAt)}</p>
      {attribution.campaign ? (
        <p className="text-body2 text-ink-2 mt-2 truncate">{attribution.campaign.name}</p>
      ) : null}
    </Card>
  );
}

function TouchpointCard({
  attribution: a,
  onRemove,
}: {
  attribution: ApiAttribution;
  onRemove?: () => void;
}) {
  const utms = filledUtms(a);
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ink font-medium">{a.leadSource.name}</span>
            <Badge tone="neutral" className="normal-case">
              {kindLabel(a.leadSource.kind)}
            </Badge>
            {a.medium ? <span className="text-caption text-ink-3">via {a.medium}</span> : null}
          </div>
          <p className="text-caption text-ink-3 mt-1">
            {formatCapturedAt(a.capturedAt)} · {touchpointOriginLabel[a.touchpointOrigin]}
          </p>
        </div>
        {onRemove ? (
          <Button size="sm" variant="ghost" aria-label="Remover toque" onClick={onRemove}>
            <Trash2 className="size-4" />
          </Button>
        ) : null}
      </div>

      {a.campaign ? (
        <div className="border-line flex flex-wrap items-center gap-2 border-t pt-3">
          <span className="text-caption text-ink-3">Campanha:</span>
          <span className="text-body2 text-ink">{a.campaign.name}</span>
          {a.campaign.archived ? <Badge tone="neutral">Arquivada</Badge> : null}
          {a.campaign.deleted ? <Badge tone="danger">Excluída</Badge> : null}
        </div>
      ) : null}

      {utms.length > 0 ? (
        <dl className="border-line flex flex-wrap gap-x-4 gap-y-1 border-t pt-3">
          {utms.map((u) => (
            <div key={u.label} className="flex items-center gap-1.5">
              <dt className="text-caption text-ink-3 font-mono">{u.label}</dt>
              <dd className="text-caption text-ink font-mono">{u.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {a.landingUrl || a.referrerUrl ? (
        <div className="border-line flex flex-col gap-1 border-t pt-3">
          {a.landingUrl ? <UrlLine label="Landing" url={a.landingUrl} /> : null}
          {a.referrerUrl ? <UrlLine label="Referrer" url={a.referrerUrl} /> : null}
        </div>
      ) : null}
    </Card>
  );
}

function UrlLine({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-caption text-ink-3 shrink-0">{label}:</span>
      <span className="text-caption text-ink-2 truncate" title={url}>
        {url}
      </span>
    </div>
  );
}

const NONE = "";

/**
 * Registro manual de um toque. As UTMs entram só aqui: depois da captura são
 * imutáveis (o backend recusa alterá-las).
 */
function AttributionModal({ contactId, onClose }: { contactId: string; onClose: () => void }) {
  const { toast } = useToast();
  const { can } = useSession();
  const create = useCreateAttribution(contactId);
  const sources = useActiveLeadSources();
  // Só campanhas vivas e não arquivadas podem receber vínculo novo.
  const campaigns = useCampaigns({ limit: 100, sortBy: "createdAt", sortOrder: "desc" });

  const [leadSourceId, setLeadSourceId] = React.useState(NONE);
  const [campaignId, setCampaignId] = React.useState(NONE);
  const [medium, setMedium] = React.useState("");
  const [utmSource, setUtmSource] = React.useState("");
  const [utmMedium, setUtmMedium] = React.useState("");
  const [utmCampaign, setUtmCampaign] = React.useState("");
  const [landingUrl, setLandingUrl] = React.useState("");

  const sourceOptions = (sources.data?.items ?? []).map((s) => ({ value: s.id, label: s.name }));
  const campaignOptions = [
    { value: NONE, label: "Sem campanha" },
    ...(campaigns.data?.items ?? [])
      .filter((c) => c.status !== "ARCHIVED")
      .map((c) => ({ value: c.id, label: c.name })),
  ];

  const urlInvalid = landingUrl.trim() !== "" && !/^https?:\/\/.+/i.test(landingUrl.trim());
  const invalid = !leadSourceId || urlInvalid;

  async function handleSave() {
    try {
      await create.mutateAsync({
        leadSourceId,
        campaignId: campaignId || undefined,
        medium: medium.trim() || undefined,
        utmSource: utmSource.trim() || undefined,
        utmMedium: utmMedium.trim() || undefined,
        utmCampaign: utmCampaign.trim() || undefined,
        landingUrl: landingUrl.trim() || undefined,
      });
      toast({ title: "Origem registrada", variant: "success" });
      onClose();
    } catch (error) {
      toast({ title: messageForAttributionError(error), variant: "error" });
    }
  }

  const noSources = !sources.isLoading && sourceOptions.length === 0;

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        title="Registrar origem"
        description="De onde este contato veio. As UTMs são gravadas como estão e não podem ser editadas depois."
      >
        <div className="flex flex-col gap-4">
          {noSources ? (
            <p className="text-body2 text-ink-3">
              Nenhuma origem ativa no catálogo.{" "}
              {can(PERMISSIONS.MARKETING_LEAD_SOURCES_MANAGE)
                ? "Cadastre uma em Marketing → Origens."
                : "Peça a um gestor para cadastrar."}
            </p>
          ) : null}

          <FormField id="at-source" label="Origem" required>
            {(p) => (
              <Combobox
                id={p.id}
                options={sourceOptions}
                value={leadSourceId}
                onValueChange={setLeadSourceId}
                placeholder="Selecione a origem"
                disabled={noSources}
              />
            )}
          </FormField>

          <FormField id="at-campaign" label="Campanha">
            {(p) => (
              <Combobox
                id={p.id}
                options={campaignOptions}
                value={campaignId}
                onValueChange={setCampaignId}
              />
            )}
          </FormField>

          <FormField
            id="at-medium"
            label="Meio"
            description='Livre — ex.: "stories", "boca a boca"'
          >
            {(p) => <Input value={medium} onChange={(e) => setMedium(e.target.value)} {...p} />}
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="at-utm-source" label="utm_source">
              {(p) => (
                <Input
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="instagram"
                  {...p}
                />
              )}
            </FormField>
            <FormField id="at-utm-medium" label="utm_medium">
              {(p) => (
                <Input
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="cpc"
                  {...p}
                />
              )}
            </FormField>
          </div>

          <FormField id="at-utm-campaign" label="utm_campaign">
            {(p) => (
              <Input
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="black-week"
                {...p}
              />
            )}
          </FormField>

          <FormField
            id="at-landing"
            label="URL de destino"
            error={urlInvalid ? "Use uma URL http(s) completa." : undefined}
          >
            {(p) => (
              <Input
                value={landingUrl}
                onChange={(e) => setLandingUrl(e.target.value)}
                placeholder="https://site.com/promo"
                {...p}
              />
            )}
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="sm" loading={create.isPending} disabled={invalid} onClick={handleSave}>
              Registrar
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
