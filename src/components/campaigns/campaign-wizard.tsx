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
import { useMessageTemplates } from "@/hooks/messaging-templates/use-message-templates";
import { useSession } from "@/providers/session-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { accountLabel, EXCLUSION_LABELS, formatDateTime } from "@/lib/campaigns/display";
import { messageForCampaignError } from "@/lib/campaigns/errors";
import type { ApiAudiencePreview, AudienceKind, AudienceSpec } from "@/types/api/campaigns";
import type { ApiMessagingAccount } from "@/types/api/messaging";

type WizardErrors = Partial<Record<"name" | "account" | "audience" | "message" | "schedule", string>>;

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

  const { can } = useSession();
  const canReadTemplates = can(PERMISSIONS.MESSAGING_TEMPLATES_READ);
  const templatesQuery = useMessageTemplates();
  const templateItems = templatesQuery.data?.items ?? [];

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
  const [errors, setErrors] = React.useState<WizardErrors>({});

  // P5: qualquer mudança de audiência INVALIDA a estimativa (nunca mostra elegíveis antigos).
  const setKindFresh = (v: AudienceKind) => {
    setKind(v);
    setPreviewData(null);
    setErrors((p) => ({ ...p, audience: undefined }));
  };
  const setTagsFresh = (v: string[]) => {
    setTagIds(v);
    setPreviewData(null);
    setErrors((p) => ({ ...p, audience: undefined }));
  };
  const setContactsFresh = (v: string[]) => {
    setContactIds(v);
    setPreviewData(null);
    setErrors((p) => ({ ...p, audience: undefined }));
  };

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

  const accountOptions = (accounts.data?.items ?? []) as ApiMessagingAccount[];

  /** Valida o passo atual; devolve o id do 1º campo inválido (para focar) ou null. */
  function validateStep(s: number): { errors: WizardErrors; firstInvalid: string | null } {
    const e: WizardErrors = {};
    if (s === 0) {
      if (!name.trim()) e.name = "Informe o nome da campanha.";
      if (!accountId) e.account = "Selecione uma conta de WhatsApp conectada.";
    }
    if (s === 1) {
      if (kind === "TAGS" && tagIds.length === 0) e.audience = "Selecione ao menos uma tag.";
      if (kind === "CONTACTS" && contactIds.length === 0)
        e.audience = "Selecione ao menos um contato.";
    }
    if (s === 2) {
      if (!message.trim()) e.message = "Escreva a mensagem da campanha.";
      else if (message.length > TEXT_LIMIT) e.message = "A mensagem excede o limite.";
    }
    if (s === 3 && sendMode === "schedule") {
      if (!scheduleValue) e.schedule = "Escolha a data e hora do agendamento.";
      else if (new Date(scheduleValue).getTime() <= Date.now())
        e.schedule = "A data precisa ser no futuro.";
    }
    const order = ["name", "account", "audience", "message", "schedule"] as const;
    const firstInvalid = order.find((k) => e[k]) ?? null;
    const fieldId: Record<string, string> = {
      name: "c-name",
      account: "c-acc",
      audience: "c-audience",
      message: "c-message",
      schedule: "c-schedule",
    };
    return { errors: e, firstInvalid: firstInvalid ? fieldId[firstInvalid] : null };
  }
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
    // P3: validação inline — destaca campo, mostra mensagem, foca o 1º erro, bloqueia avanço.
    const { errors: e, firstInvalid } = validateStep(step);
    setErrors(e);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    setBusy(true);
    try {
      await ensureDraft();
      const nextStep = step + 1;
      if (nextStep === 1 || nextStep === 4) await runPreview();
      setStep(nextStep);
    } catch (err) {
      toast({ title: messageForCampaignError(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!draftId) return;
    const { errors: e, firstInvalid } = validateStep(3);
    if (firstInvalid) {
      setErrors(e);
      setStep(3);
      return;
    }
    setBusy(true);
    try {
      const sendAt =
        sendMode === "schedule" && scheduleValue
          ? new Date(scheduleValue).toISOString()
          : undefined;
      const c = await schedule.mutateAsync(sendAt);
      toast({
        title: sendMode === "now" ? "Envio iniciado" : "Campanha agendada",
        variant: "success",
      });
      router.push(`/whatsapp/campaigns/${c.id}`);
    } catch (err) {
      toast({
        title: messageForCampaignError(err, sendMode === "now" ? "sendNow" : "schedule"),
        variant: "error",
      });
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
              <FormField id="c-name" label="Nome da campanha" required error={errors.name}>
                {(p) => (
                  <Input
                    {...p}
                    value={name}
                    maxLength={160}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Ex.: Dia dos Pais"
                  />
                )}
              </FormField>
              <FormField id="c-desc" label="Descrição (opcional)">
                {(p) => (
                  <Input {...p} value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} />
                )}
              </FormField>
              <FormField id="c-acc" label="Conta de WhatsApp" required error={errors.account}>
                {(p) => (
                  <select
                    {...p}
                    value={accountId}
                    onChange={(e) => {
                      setAccountId(e.target.value);
                      setErrors((prev) => ({ ...prev, account: undefined }));
                    }}
                    className="h-10 rounded-lg border border-line bg-white px-3 text-body text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand aria-[invalid=true]:border-danger"
                  >
                    <option value="">Selecione…</option>
                    {accountOptions.map((a) => (
                      <option key={a.id} value={a.id} disabled={a.status !== "CONNECTED"}>
                        {accountLabel(a)}
                        {a.status !== "CONNECTED" ? " (desconectada)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div id="c-audience" tabIndex={-1} className="flex flex-col gap-4 outline-none">
                <RadioGroup value={kind} onValueChange={(v) => setKindFresh(v as AudienceKind)} className="flex gap-4">
                  {(["ALL", "TAGS", "CONTACTS"] as const).map((k) => (
                    <label key={k} className="flex items-center gap-2 text-body">
                      <RadioGroupItem value={k} /> {k === "ALL" ? "Todos" : k === "TAGS" ? "Por tags" : "Contatos"}
                    </label>
                  ))}
                </RadioGroup>
                {kind === "TAGS" ? (
                  <MultiSelect options={tagOptions} value={tagIds} onValueChange={setTagsFresh} placeholder="Selecione tags…" />
                ) : null}
                {kind === "CONTACTS" ? (
                  <MultiSelect options={contactOptions} value={contactIds} onValueChange={setContactsFresh} placeholder="Selecione contatos…" />
                ) : null}
                {errors.audience ? (
                  <p role="alert" className="text-small text-danger">
                    {errors.audience}
                  </p>
                ) : null}
              </div>
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
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMessage((m) => `${m}{{primeiro_nome}}`)}
                >
                  + {"{{primeiro_nome}}"}
                </Button>
                {canReadTemplates && templateItems.length > 0 ? (
                  <select
                    aria-label="Carregar template"
                    className="h-8 rounded-lg border border-line bg-surface px-2 text-body2 text-ink"
                    value=""
                    onChange={(e) => {
                      const tpl = templateItems.find((t) => t.id === e.target.value);
                      if (!tpl) return;
                      setMessage(tpl.body);
                      setErrors((prev) => ({ ...prev, message: undefined }));
                    }}
                  >
                    <option value="">Carregar template…</option>
                    {templateItems.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
              <Textarea
                id="c-message"
                value={message}
                aria-invalid={errors.message ? true : undefined}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setErrors((prev) => ({ ...prev, message: undefined }));
                }}
                rows={5}
                maxLength={TEXT_LIMIT + 200}
                placeholder="Olá {{primeiro_nome}}, ..."
                className="aria-[invalid=true]:border-danger"
              />
              {errors.message ? (
                <p role="alert" className="text-small text-danger">
                  {errors.message}
                </p>
              ) : null}
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
                    id="c-schedule"
                    type="datetime-local"
                    value={scheduleValue}
                    aria-invalid={errors.schedule ? true : undefined}
                    onChange={(e) => {
                      setScheduleValue(e.target.value);
                      setErrors((prev) => ({ ...prev, schedule: undefined }));
                    }}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-body2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15 aria-[invalid=true]:border-danger"
                  />
                  {errors.schedule ? (
                    <p role="alert" className="text-small text-danger">
                      {errors.schedule}
                    </p>
                  ) : null}
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
              account={accountLabel(accountOptions.find((a) => a.id === accountId))}
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
            {sendMode === "now" ? "Confirmar e enviar" : "Confirmar agendamento"}
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
