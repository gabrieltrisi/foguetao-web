"use client";

import * as React from "react";
import { ImageOff, Loader2, Sparkles, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  useCreatives,
  useDeleteCreative,
  useGenerateCreative,
} from "@/hooks/creatives/use-creatives";
import type { ApiCreative } from "@/types/api/creatives";

const PROMPT_MIN = 3;
const PROMPT_MAX = 2000;

/** URL do conteúdo via BFF (proxy binário). Auth por cookie httpOnly. */
function contentUrl(id: string): string {
  return `/api/creatives/${id}/content`;
}

export function CreativesView() {
  const { toast } = useToast();
  const { can } = useSession();
  const canCreate = can(PERMISSIONS.CREATIVES_CREATE);
  const canDelete = can(PERMISSIONS.CREATIVES_DELETE);

  const list = useCreatives();
  const items = list.data?.items ?? [];

  const generate = useGenerateCreative();
  const [prompt, setPrompt] = React.useState("");
  const trimmed = prompt.trim();
  const valid = trimmed.length >= PROMPT_MIN && trimmed.length <= PROMPT_MAX;

  const handleGenerate = () => {
    if (!valid || generate.isPending) return;
    generate.mutate(
      { prompt: trimmed },
      {
        onSuccess: () => {
          toast({ title: "Criativo gerado", variant: "success" });
          setPrompt("");
        },
        onError: () => toast({ title: "Não foi possível gerar o criativo", variant: "error" }),
      },
    );
  };

  const remove = useDeleteCreative();
  const [toDelete, setToDelete] = React.useState<ApiCreative | null>(null);
  const confirmDelete = () => {
    if (!toDelete) return;
    remove.mutate(toDelete.id, {
      onSuccess: () => toast({ title: "Criativo excluído", variant: "success" }),
      onError: () => toast({ title: "Não foi possível excluir", variant: "error" }),
      onSettled: () => setToDelete(null),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {canCreate ? (
        <Card className="flex flex-col gap-3 p-4">
          <label htmlFor="creative-prompt" className="text-body2 font-medium text-ink">
            Descreva a imagem que você quer gerar
          </label>
          <p className="text-caption text-ink-3">
            Descreva a cena (não precisa dar comando nem escrever em inglês — a gente traduz).
            Ex.: <span className="text-ink-2">um foguete vermelho decolando ao pôr do sol, estilo cartoon</span>.
          </p>
          <Textarea
            id="creative-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            maxLength={PROMPT_MAX}
            placeholder="Ex.: Um mascote de foguete simpático sobre fundo azul, estilo flat"
            disabled={generate.isPending}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-caption text-ink-3">
              {trimmed.length}/{PROMPT_MAX}
            </p>
            <Button size="sm" onClick={handleGenerate} loading={generate.isPending} disabled={!valid}>
              <Sparkles className="size-4" aria-hidden /> Gerar criativo
            </Button>
          </div>
        </Card>
      ) : null}

      {list.isLoading ? (
        <div className="flex items-center gap-2 py-10 text-body2 text-ink-2">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Carregando…
        </div>
      ) : list.isError ? (
        <p className="py-10 text-center text-body2 text-danger">
          Não foi possível carregar os criativos.
        </p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-body2 text-ink-3">Nenhum criativo ainda.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => (
            <CreativeCard
              key={c.id}
              creative={c}
              canDelete={canDelete}
              onDelete={() => setToDelete(c)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Excluir criativo?"
        description="A imagem será removida permanentemente."
        confirmLabel="Excluir"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function CreativeCard({
  creative,
  canDelete,
  onDelete,
}: {
  creative: ApiCreative;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const [failed, setFailed] = React.useState(false);
  const url = contentUrl(creative.id);

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border border-line bg-surface">
        {failed ? (
          <span className="flex flex-col items-center gap-1 text-caption text-ink-3">
            <ImageOff className="size-5" aria-hidden /> Imagem indisponível
          </span>
        ) : (
          // URL autenticada por proxy (BFF) — o otimizador do next/image não a serve.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={creative.prompt}
            loading="lazy"
            onError={() => setFailed(true)}
            className="size-full object-contain"
          />
        )}
      </div>
      <p className="line-clamp-2 min-h-[2.5rem] text-body2 text-ink-2" title={creative.prompt}>
        {creative.prompt}
      </p>
      {canDelete ? (
        <div className="flex items-center border-t border-line pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-danger hover:text-danger"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" aria-hidden /> Excluir
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
