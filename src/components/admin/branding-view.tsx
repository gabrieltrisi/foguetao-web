"use client";

import * as React from "react";
import { Rocket, Image as ImageIcon, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PreviewNotice } from "@/components/admin/preview-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { brandDefaults, brandColorPresets } from "@/mocks/admin/branding";
import { cn } from "@/lib/utils";

function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <FormField id={id} label={label}>
      {(p) => (
        <div className="flex items-center gap-2">
          <span className="size-9 shrink-0 rounded-lg border border-line" style={{ background: value }} aria-hidden />
          <Input id={p.id} value={value} onChange={(e) => onChange(e.target.value)} className="font-mono uppercase" />
        </div>
      )}
    </FormField>
  );
}

export function BrandingView() {
  const [b, setB] = React.useState(brandDefaults);
  const set = (k: keyof typeof brandDefaults) => (v: string) => setB((s) => ({ ...s, [k]: v }));

  return (
    <div className="flex flex-col gap-5">
      <PreviewNotice>
        Cores, favicon e domínio de e-mail não existem no backend — nada aqui é salvo. Do
        contrato atual, apenas o logotipo (`logoUrl`) da empresa é persistível.
      </PreviewNotice>
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(320px,420px)]">
      {/* Editor */}
      <Card className="flex flex-col gap-5 p-5">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-h3 font-semibold text-ink">White label</h2>
          <Badge tone="brand">Pro</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="b-logo" label="Logo">
            {() => (
              <button type="button" disabled className="flex h-10 w-full items-center gap-2 rounded-lg border border-dashed border-line bg-surface px-3 text-body2 text-ink-2 transition-colors hover:border-brand hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                <Upload className="size-4" aria-hidden /> {b.logoLabel}
              </button>
            )}
          </FormField>
          <FormField id="b-favicon" label="Favicon">
            {() => (
              <button type="button" disabled className="flex h-10 w-full items-center gap-2 rounded-lg border border-dashed border-line bg-surface px-3 text-body2 text-ink-2 transition-colors hover:border-brand hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                <ImageIcon className="size-4" aria-hidden /> {b.faviconLabel}
              </button>
            )}
          </FormField>
          <FormField id="b-name" label="Nome da empresa" className="sm:col-span-2">{(p) => <Input id={p.id} value={b.companyName} onChange={(e) => set("companyName")(e.target.value)} />}</FormField>
          <ColorField id="b-primary" label="Cor primária" value={b.primary} onChange={set("primary")} />
          <ColorField id="b-secondary" label="Cor secundária" value={b.secondary} onChange={set("secondary")} />
          <FormField id="b-domain" label="Domínio">{(p) => <Input id={p.id} value={b.domain} onChange={(e) => set("domain")(e.target.value)} />}</FormField>
          <FormField id="b-email" label="E-mail de envio">{(p) => <Input id={p.id} type="email" value={b.email} onChange={(e) => set("email")(e.target.value)} />}</FormField>
        </div>

        <div>
          <p className="mb-1.5 text-body2 font-semibold text-ink">Paleta rápida</p>
          <div className="flex flex-wrap gap-2">
            {brandColorPresets.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("primary")(c)}
                aria-label={`Usar cor ${c}`}
                aria-pressed={b.primary.toLowerCase() === c.toLowerCase()}
                className={cn("size-8 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", b.primary.toLowerCase() === c.toLowerCase() ? "border-ink" : "border-line")}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line pt-5">
          <Button variant="secondary" onClick={() => setB(brandDefaults)}>Restaurar</Button>
          <Button disabled>Salvar</Button>
        </div>
      </Card>

      {/* Preview em tempo real */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <p className="mb-2 text-caption font-medium uppercase tracking-wide text-ink-2">Preview em tempo real</p>
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 px-4 py-3 text-white" style={{ background: b.primary }}>
            <Rocket className="size-5" aria-hidden />
            <span className="font-display text-body font-bold">{b.companyName || "Sua marca"}</span>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <div className="h-2 w-24 rounded-full" style={{ background: b.secondary }} aria-hidden />
            <div className="h-2 w-40 rounded-full bg-line" aria-hidden />
            <div className="h-2 w-32 rounded-full bg-line" aria-hidden />
            <button type="button" className="mt-1 h-9 w-fit rounded-lg px-4 text-body2 font-semibold text-white" style={{ background: b.primary }}>
              Botão primário
            </button>
            <p className="mt-1 text-caption text-ink-3">
              {b.domain} · {b.email}
            </p>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}
