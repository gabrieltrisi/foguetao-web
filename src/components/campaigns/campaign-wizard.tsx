"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/toast";
import { useMessagingAccounts } from "@/hooks/messaging/use-messaging-accounts";
import { useTags } from "@/hooks/crm/use-crm-meta";
import { useContacts } from "@/hooks/crm/use-contacts";
import {
  useCampaign,
  useCreateCampaign,
  usePreviewAudience,
  useScheduleCampaign,
  useUpdateCampaign,
} from "@/hooks/campaigns/use-campaigns";
import { EXCLUSION_LABELS, formatDateTime } from "@/lib/campaigns/display";
import type { ApiAudiencePreview, AudienceKind, AudienceSpec } from "@/types/api/campaigns";

const STEPS = [
  { label: "Informações" },
  { label: "Público" },
  { label: "Mensagem" },
  { label: "Agendamento" },
  { label: "Revisão" },
];
const TEXT_LIMIT = 8192;
const TZ = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  } catch {
    return "America/Sao_Paulo";
  }
})();

type SendMode = "now" | "schedule";

function toLocalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function CampaignWizard({ campaignId }: { campaignId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const existing = useCampaign(campaignId ?? null);
  const accounts = useMessagingAccounts();
  const tags = useTags();
  const contacts = useContacts({ limit: 100 });

  const create = useCreateCampaign();
  const [draftId, setDraftId] = React.useState<string | null>(campaignId ?? null);
  const update = useUpdateCampaign(draftId ?? "none");
  const schedule = useScheduleCampaign(draftId ?? "none");
  const preview = usePreviewAudience(draftId ?? "none");

  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [kind, setKind] = React.useState<AudienceKind>("ALL");
  const [tagIds, setTagIds] = React.useState<string[]>([]);
  const [contactIds, setContactIds] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState("");
  const [sendMode, setSendMode] = React.useState<SendMode>("schedule");
  const [scheduleValue, setScheduleValue] = React.useState("");
  const [previewData, setPreviewData] = React.useState<ApiAudiencePreview | null>(null);
  const [busy, setBusy] = React.useState(false);

  // Prefill em modo edição.
  const loaded = React.useRef(false);
  /* eslint-disable react-hooks/set-state-in-effect -- prefill único (edição), guardado por ref */
  React.useEffect(() => {
    const c = existing.data;
    if (!c || loaded.current) return;
    loaded.current = true;
    setName(c.name);
    setDescription(c.description ?? "");
    setAccountId(c.messagingAccountId ?? "");
    setMessage(c.message ?? "");
    if (c.audience?.kind === "TAGS") {
      setKind("TAGS");
      setTagIds(c.audience.tagIds);
    } else if (c.audience?.kind === "CONTACTS") {
      setKind("CONTACTS");
      setContactIds(c.audience.contactIds);
    }
    if (c.scheduledAt) setScheduleValue(toLocalInput(new Date(c.scheduledAt)));
  }, [existing.data]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const accountOptions = (accounts.data?.items ?? []) as Array<{
    id: string;
    displayName?: string | null;
    status: string;
  }>;
  const tagOptions = (tags.data?.items ?? []).map((t) => ({ value: t.id, label: t.name }));
  const contactOptions = (contacts.data?.items ?? []).map((c) => ({
    value: c.id,
    label: `${c.fullName ?? c.firstName ?? "Contato"}${c.phone ? ` · ${c.phone}` : ""}`,
  }));

  function buildAudience(): AudienceSpec {
    if (kind === "TAGS") return { kind: "TAGS", tagIds };
    if (kind === "CONTACTS") return { kind: "CONTACTS", contactIds };
    return { kind: "ALL" };
  }

  /** Garante um rascunho (cria na 1ª vez) e devolve o id. */
  async function ensureDraft(): Promise<string> {
    if (draftId) {
      await update.mutateAsync({
        name: name.trim(),
        description: description || undefined,
        messagingAccountId: accountId || undefined,
        audience: buildAudience(),
        message: message || undefined,
        timezone: TZ,
      });
      return draftId;
    }
    const c = await create.mutateAsync({
      name: name.trim(),
      description: description || undefined,
      messagingAccountId: accountId || undefined,
      audience: buildAudience(),
      message: message || undefined,
      timezone: TZ,
    });
    setDraftId(c.id);
    return c.id;
  }

  async function runPreview() {
    if (!draftId) return;
    try {
      const r = await preview.mutateAsync(buildAudience());
      setPreviewData(r);
    } catch {
      /* silencioso: o resumo mostra "—" */
    }
  }

  async function next() {
    setBusy(true);
    try {
      if (step === 0) {
        if (!name.trim() || !accountId) {
          toast({ title: "Informe nome e conta", variant: "error" });
          return;
        }
        await ensureDraft();
      } else {
        await ensureDraft();
      }
      const nextStep = step + 1;
      if (nextStep === 1 || nextStep === 4) await runPreview();
      setStep(nextStep);
    } catch {
      toast({ title: "Não foi possível salvar o rascunho", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!draftId) return;
    setBusy(true);
    try {
      const sendAt =
        sendMode === "schedule" && scheduleValue
          ? new Date(scheduleValue).toISOString()
          : undefined;
      const c = await schedule.mutateAsync(sendAt);
      toast({ title: "Campanha agendada", variant: "success" });
      router.push(`/whatsapp/campaigns/${c.id}`);
    } catch {
      toast({ title: "Não foi possível agendar", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  const overLimit = message.length > TEXT_LIMIT;
  const scheduleValid = sendMode === "now" || scheduleValue.length > 0;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Stepper steps={STEPS} current={step} />

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step].label}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {step === 0 ? (
            <>
              <FormField id="c-name" label="Nome da campanha" required>
                {(p) => (
                  <Input {...p} value={name} maxLength={160} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Dia dos Pais" />
                )}
              </FormField>
              <FormField id="c-desc" label="Descrição (opcional)">
                {(p) => (
                  <Input {...p} value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} />
                )}
              </FormField>
              <FormField id="c-acc" label="Conta de WhatsApp" required>
                {(p) => (
                  <select
                    {...p}
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="h-10 rounded-lg border border-line bg-white px-3 text-body text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <option value="">Selecione…</option>
                    {accountOptions.map((a) => (
                      <option key={a.id} value={a.id} disabled={a.status !== "CONNECTED"}>
                        {a.displayName || a.id.slice(0, 8)} {a.status !== "CONNECTED" ? "(desconectada)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <RadioGroup value={kind} onValueChange={(v) => setKind(v as AudienceKind)} className="flex gap-4">
                {(["ALL", "TAGS", "CONTACTS"] as const).map((k) => (
                  <label key={k} className="flex items-center gap-2 text-body">
                    <RadioGroupItem value={k} /> {k === "ALL" ? "Todos" : k === "TAGS" ? "Por tags" : "Contatos"}
                  </label>
                ))}
              </RadioGroup>
              {kind === "TAGS" ? (
                <MultiSelect options={tagOptions} value={tagIds} onValueChange={setTagIds} placeholder="Selecione tags…" />
              ) : null}
              {kind === "CONTACTS" ? (
                <MultiSelect options={contactOptions} value={contactIds} onValueChange={setContactIds} placeholder="Selecione contatos…" />
              ) : null}
              <div className="flex items-center justify-between rounded-lg border border-line bg-surface/40 p-3">
                <div className="text-body2">
                  {previewData ? (
                    <>
                      <strong className="text-success">{previewData.eligible} elegíveis</strong>
                      {previewData.excluded > 0 ? ` · ${previewData.excluded} excluídos` : ""}
                    </>
                  ) : (
                    <span className="text-ink-3">Clique em estimar para ver o público.</span>
                  )}
                </div>
                <Button variant="secondary" size="sm" loading={preview.isPending} onClick={runPreview}>
                  Estimar
                </Button>
              </div>
              {previewData && previewData.excluded > 0 ? (
                <ExclusionBreakdown preview={previewData} />
              ) : null}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMessage((m) => `${m}{{primeiro_nome}}`)}
                >
                  + {"{{primeiro_nome}}"}
                </Button>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={TEXT_LIMIT + 200}
                placeholder="Olá {{primeiro_nome}}, ..."
              />
              <p className={overLimit ? "text-right text-caption text-danger" : "text-right text-caption text-ink-3"}>
                {message.length}/{TEXT_LIMIT}
              </p>
              <div className="rounded-lg border border-line bg-surface/40 p-3 text-body2">
                <p className="mb-1 text-caption text-ink-3">Prévia:</p>
                {message.replace(/\{\{primeiro_nome\}\}/g, "João") || "—"}
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <RadioGroup value={sendMode} onValueChange={(v) => setSendMode(v as SendMode)} className="flex gap-4">
                <label className="flex items-center gap-2 text-body">
                  <RadioGroupItem value="now" /> Enviar agora
                </label>
                <label className="flex items-center gap-2 text-body">
                  <RadioGroupItem value="schedule" /> Agendar
                </label>
              </RadioGroup>
              {sendMode === "schedule" ? (
                <>
                  <input
                    type="datetime-local"
                    value={scheduleValue}
                    onChange={(e) => setScheduleValue(e.target.value)}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-body2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15"
                  />
                  <p className="text-caption text-ink-3">Fuso: {TZ}</p>
                </>
              ) : (
                <p className="text-body2 text-ink-2">
                  O envio começa imediatamente após a confirmação.
                </p>
              )}
            </>
          ) : null}

          {step === 4 ? (
            <ExecutiveSummary
              name={name}
              account={accountOptions.find((a) => a.id === accountId)?.displayName ?? accountId}
              message={message}
              sendMode={sendMode}
              scheduleValue={scheduleValue}
              tz={TZ}
              preview={previewData}
            />
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" disabled={step === 0 || busy} onClick={() => setStep((s) => s - 1)}>
          Voltar
        </Button>
        {step < 4 ? (
          <Button loading={busy} onClick={next} disabled={overLimit}>
            Avançar
          </Button>
        ) : (
          <Button loading={busy} onClick={confirm} disabled={!scheduleValid || !previewData?.eligible}>
            Confirmar e agendar
          </Button>
        )}
      </div>
    </div>
  );
}

function ExclusionBreakdown({ preview }: { preview: ApiAudiencePreview }) {
  const rows = Object.entries(preview.byReason).filter(([, n]) => (n as number) > 0);
  if (rows.length === 0) return null;
  return (
    <div className="text-caption text-ink-2">
      Excluídos:{" "}
      {rows.map(([reason, n]) => `${EXCLUSION_LABELS[reason] ?? reason} ${n}`).join(" · ")}
    </div>
  );
}

function ExecutiveSummary({
  name,
  account,
  message,
  sendMode,
  scheduleValue,
  tz,
  preview,
}: {
  name: string;
  account: string;
  message: string;
  sendMode: SendMode;
  scheduleValue: string;
  tz: string;
  preview: ApiAudiencePreview | null;
}) {
  const rows: Array<[string, React.ReactNode]> = [
    ["Campanha", name],
    ["Conta", account || "—"],
    [
      "Mensagem",
      <span key="msg" className="whitespace-pre-wrap">
        {message.replace(/\{\{primeiro_nome\}\}/g, "João") || "—"}
      </span>,
    ],
    [
      "Agendamento",
      sendMode === "now"
        ? "Enviar agora"
        : scheduleValue
          ? `${formatDateTime(new Date(scheduleValue).toISOString(), tz)} (${tz})`
          : "—",
    ],
    ["Elegíveis", <strong key="elig" className="text-success">{preview?.eligible ?? "—"}</strong>],
    ["Excluídos", preview?.excluded ?? "—"],
  ];
  return (
    <div className="flex flex-col gap-2">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[120px_1fr] gap-2 border-b border-line/60 pb-2 text-body2">
          <span className="text-ink-3">{label}</span>
          <span className="text-ink">{value}</span>
        </div>
      ))}
      {preview && preview.excluded > 0 ? <ExclusionBreakdown preview={preview} /> : null}
      <p className="mt-1 rounded-lg bg-warning/10 p-2 text-caption text-warning">
        Envio conservador para proteger o número, respeitando o limite da conta.
      </p>
    </div>
  );
}
