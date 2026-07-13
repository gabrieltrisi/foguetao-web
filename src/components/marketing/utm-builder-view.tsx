"use client";

import * as React from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Combobox } from "@/components/ui/combobox";
import { QRCodeMock } from "@/components/messaging/qr-mock";
import { useToast } from "@/components/ui/toast";
import { utmHistory, utmMediums, utmSources } from "@/mocks/marketing/utm";

function slugify(v: string) {
  return v.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
}

export function UTMBuilderView() {
  const { toast } = useToast();
  const [base, setBase] = React.useState("https://foguetao.com.br");
  const [source, setSource] = React.useState("google");
  const [medium, setMedium] = React.useState("cpc");
  const [campaign, setCampaign] = React.useState("black-week");
  const [term, setTerm] = React.useState("");
  const [content, setContent] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const params = new URLSearchParams();
  if (source) params.set("utm_source", slugify(source));
  if (medium) params.set("utm_medium", slugify(medium));
  if (campaign) params.set("utm_campaign", slugify(campaign));
  if (term) params.set("utm_term", slugify(term));
  if (content) params.set("utm_content", slugify(content));
  const url = `${base}${params.toString() ? `?${params.toString()}` : ""}`;

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(url);
    } catch {
      // clipboard indisponível
    }
    setCopied(true);
    toast({ title: "Link copiado", variant: "success" });
    window.setTimeout(() => setCopied(false), 1500);
  };

  const sourceOptions = utmSources.map((s) => ({ value: s, label: s }));
  const mediumOptions = utmMediums.map((m) => ({ value: m, label: m }));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Form */}
        <Card className="p-5">
          <div className="flex flex-col gap-4">
            <FormField id="utm-base" label="URL de destino" required>
              {(p) => <Input value={base} onChange={(e) => setBase(e.target.value)} placeholder="https://…" {...p} />}
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="utm-source" label="Source" required>
                {(p) => <Combobox id={p.id} options={sourceOptions} value={source} onValueChange={setSource} />}
              </FormField>
              <FormField id="utm-medium" label="Medium" required>
                {(p) => <Combobox id={p.id} options={mediumOptions} value={medium} onValueChange={setMedium} />}
              </FormField>
            </div>
            <FormField id="utm-campaign" label="Campaign" required>
              {(p) => <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="black-week" {...p} />}
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="utm-term" label="Term">
                {(p) => <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="palavra-chave" {...p} />}
              </FormField>
              <FormField id="utm-content" label="Content">
                {(p) => <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="variacao-a" {...p} />}
              </FormField>
            </div>
          </div>
        </Card>

        {/* Preview */}
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <p className="mb-2 flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ink-3"><Link2 className="size-3.5" aria-hidden /> URL final</p>
            <p className="break-all rounded-lg border border-line bg-surface p-3 text-body2 text-ink" aria-label="URL gerada">{url}</p>
            <Button size="sm" className="mt-3 w-full" onClick={copy}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Copiado!" : "Copiar link"}
            </Button>
          </Card>
          <Card className="flex flex-col items-center gap-3 p-5">
            <p className="text-caption font-semibold uppercase tracking-wide text-ink-3">QR Code</p>
            <div className="rounded-xl border border-line p-3"><QRCodeMock seed={url} size={148} /></div>
            <p className="text-caption text-ink-3">Aponte a câmera para abrir o link</p>
          </Card>
        </div>
      </div>

      {/* Histórico */}
      <div>
        <p className="mb-3 font-display text-h3 font-semibold text-ink">Histórico recente</p>
        <Card className="divide-y divide-line">
          {utmHistory.map((h) => (
            <div key={h.id} className="flex items-center gap-3 p-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-2"><Link2 className="size-4" aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body2 text-ink">{h.url}</p>
                <p className="text-caption text-ink-3">{h.source} · {h.medium} · {h.createdAt}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Copiar"
                className={cn("shrink-0")}
                onClick={() => { navigator.clipboard?.writeText(h.url).catch(() => {}); toast({ title: "Link copiado", variant: "success" }); }}
              >
                <Copy />
              </Button>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
