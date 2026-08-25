"use client";

import * as React from "react";
import { Check, Copy, Link2, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { buildUtmUrl, slugifyUtm } from "@/lib/marketing/attribution";

/**
 * UTM Builder — 100% client-side, e honesto sobre isso.
 *
 * Ele MONTA a URL; não rastreia clique, não encurta, não gera QR real e não
 * persiste nada. Não existe endpoint de UTM: o que grava UTM é a atribuição do
 * contato (`POST /contacts/:id/attributions`), quando o lead chega.
 *
 * O histórico mockado foi REMOVIDO — não há contrato que o alimente, e uma
 * lista de links "salvos" que somem no refresh é mentira. Com isso a tela sai
 * do Preview: o que ela faz, ela faz de verdade.
 */
export function UTMBuilderView() {
  const { toast } = useToast();
  const [base, setBase] = React.useState("https://");
  const [source, setSource] = React.useState("");
  const [medium, setMedium] = React.useState("");
  const [campaign, setCampaign] = React.useState("");
  const [term, setTerm] = React.useState("");
  const [content, setContent] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const values = { source, medium, campaign, term, content };
  const url = buildUtmUrl(base, values);
  const baseTouched = base.trim() !== "" && base.trim() !== "https://";
  const baseInvalid = baseTouched && url === "";

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copiado", variant: "success" });
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sem clipboard (permissão negada, contexto inseguro): não mentimos que
      // copiou — o usuário ainda pode selecionar a URL exibida.
      toast({
        title: "Não foi possível copiar. Selecione a URL e copie manualmente.",
        variant: "error",
      });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="border-info/30 bg-info/5 flex items-start gap-3 p-4">
        <Link2 className="text-info mt-0.5 size-4 shrink-0" aria-hidden />
        <p className="text-body2 text-ink-2">
          Este gerador monta a URL com os parâmetros UTM. Ele <strong>não rastreia cliques</strong>{" "}
          e não salva os links: o registro acontece quando o lead vira contato e você registra a
          origem dele na aba <strong>Origem</strong> do contato.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex flex-col gap-4">
            <FormField
              id="utm-base"
              label="URL de destino"
              required
              error={
                baseInvalid
                  ? "Informe uma URL http(s) completa (ex.: https://site.com)."
                  : undefined
              }
            >
              {(p) => (
                <Input
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  placeholder="https://site.com/promo"
                  {...p}
                />
              )}
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="utm-source" label="Source" description="De onde vem (ex.: instagram)">
                {(p) => (
                  <Input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="instagram"
                    {...p}
                  />
                )}
              </FormField>
              <FormField id="utm-medium" label="Medium" description="Como vem (ex.: cpc, stories)">
                {(p) => (
                  <Input
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    placeholder="cpc"
                    {...p}
                  />
                )}
              </FormField>
            </div>
            <FormField id="utm-campaign" label="Campaign">
              {(p) => (
                <Input
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="black-week"
                  {...p}
                />
              )}
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="utm-term" label="Term">
                {(p) => (
                  <Input
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="palavra-chave"
                    {...p}
                  />
                )}
              </FormField>
              <FormField id="utm-content" label="Content">
                {(p) => (
                  <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="variacao-a"
                    {...p}
                  />
                )}
              </FormField>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <p className="text-caption text-ink-3 mb-2 flex items-center gap-2 font-semibold tracking-wide uppercase">
              <Link2 className="size-3.5" aria-hidden /> URL final
            </p>
            {url ? (
              <p
                className="border-line bg-surface text-body2 text-ink rounded-lg border p-3 break-all"
                aria-label="URL gerada"
              >
                {url}
              </p>
            ) : (
              <p className="border-line text-body2 text-ink-3 flex items-center gap-2 rounded-lg border border-dashed p-3">
                <TriangleAlert className="size-4 shrink-0" aria-hidden />
                Informe uma URL de destino válida para gerar o link.
              </p>
            )}
            <Button size="sm" className="mt-3 w-full" disabled={!url} onClick={copy}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Copiado!" : "Copiar link"}
            </Button>
          </Card>

          <Card className="p-5">
            <p className="text-caption text-ink-3 mb-2 font-semibold tracking-wide uppercase">
              Parâmetros aplicados
            </p>
            <dl className="flex flex-col gap-1.5">
              {(
                [
                  ["utm_source", source],
                  ["utm_medium", medium],
                  ["utm_campaign", campaign],
                  ["utm_term", term],
                  ["utm_content", content],
                ] as const
              ).map(([key, raw]) => {
                const slug = slugifyUtm(raw);
                return (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <dt className="text-body2 text-ink-2 font-mono">{key}</dt>
                    <dd className="text-body2 text-ink truncate font-mono">{slug || "—"}</dd>
                  </div>
                );
              })}
            </dl>
            <p className="text-caption text-ink-3 mt-3">
              Os valores são normalizados (minúsculas, sem acento e sem espaço) para que a mesma
              campanha não vire duas.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
