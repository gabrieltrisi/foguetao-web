"use client";

import * as React from "react";
import { CornerUpLeft, MessageSquare, Paperclip, Send, StickyNote, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useConversationDraft } from "@/features/inbox/hooks/use-conversation-draft";
import { useSendInboxMessage } from "@/hooks/messaging/use-inbox";
import { useSendInternalNote } from "@/features/inbox/hooks/use-send-note";
import { useAttachmentQueue } from "@/features/inbox/hooks/use-attachment-queue";
import { toSendabilityVM } from "@/features/inbox/view-models";
import { COMPOSER_MODES, type ComposerMode } from "@/features/inbox/constants";
import { TEXT_LIMIT, canSubmit as canSubmitFn, modeBlock } from "@/features/inbox/composer";
import { BACKEND_MEDIA_MIMES } from "@/features/inbox/attachments";
import { useSendConversationImage } from "@/features/inbox/hooks/use-inbox-mutations";
import { AttachmentTray } from "@/features/inbox/components/composer/attachment-tray";
import { SuggestReplyButton } from "@/features/copilot/components/suggest-reply";
import type { ApiSendabilityPublic } from "@/types/api/messaging";
import type { DraftSaveState } from "@/features/inbox/hooks/use-conversation-draft";

/**
 * Envio de ANEXOS ainda NÃO é suportado pelo contrato (F5): upload é MOCK sem bytes e o
 * endpoint de conversa é TEXT-only. A infraestrutura (validação/preview/fila/ObjectURL)
 * está pronta e testada; o ENVIO fica BLOQUEADO com aviso honesto até o backend suportar.
 */
const ATTACHMENTS_SENDABLE = true;
// Envio de mídia nesta fase: SÓ IMAGEM (documento/áudio/vídeo virão depois).
const SENDABLE_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ATTACH_ACCEPT = ATTACHMENTS_SENDABLE
  ? SENDABLE_IMAGE_MIMES.join(",")
  : BACKEND_MEDIA_MIMES.join(",");

/** Lê o File como base64 puro (sem o prefixo `data:...;base64,`). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result);
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    reader.onerror = () => reject(reader.error ?? new Error("read error"));
    reader.readAsDataURL(file);
  });
}
const ATTACH_BLOCK_NOTICE =
  "Por enquanto só é possível enviar imagens. Anexos de outros tipos serão ignorados.";

export interface ReplyTarget {
  id: string;
  preview: string;
}

function draftStateLabel(s: DraftSaveState): string {
  switch (s) {
    case "saving":
      return "Salvando rascunho…";
    case "saved":
      return "Rascunho salvo";
    case "conflict":
      return "Rascunho editado em outra aba";
    case "error":
      return "Falha ao salvar rascunho";
    default:
      return "";
  }
}

/**
 * Composer DEFINITIVO da Inbox (F3). Dois modos INEQUÍVOCOS:
 *  - RESPONDER → mensagem PÚBLICA (otimista, `useSendInboxMessage`), draft-backed;
 *  - NOTA INTERNA → endpoint DEDICADO (`useSendInternalNote`), buffer transiente.
 *
 * O roteamento por modo garante que a nota NUNCA vai ao envio público (anti-vazamento).
 * Bloqueios por `modeBlock` (permissão/conexão/canal/janela/template). Envio: Enter
 * envia, Shift+Enter quebra linha. `clear()` do rascunho no envio público.
 *
 * Reply target: prévia + cancelar. LACUNA de contrato — o endpoint de conversa não
 * aceita `replyToMessageId`, então o vínculo NÃO é enviado (adiado; ver docs). O alvo
 * é um auxílio de composição; some ao enviar.
 */
export function Composer({
  conversationId,
  canSendPerm,
  canNotePerm,
  sendabilityCanSend,
  sendabilityMessage,
  sendabilityDetail,
  replyTarget,
  onClearReply,
}: {
  conversationId: string;
  canSendPerm: boolean;
  canNotePerm: boolean;
  sendabilityCanSend: boolean;
  sendabilityMessage: string;
  sendabilityDetail: ApiSendabilityPublic | null | undefined;
  replyTarget: ReplyTarget | null;
  onClearReply: () => void;
}) {
  const { toast } = useToast();
  const [mode, setMode] = React.useState<ComposerMode>("reply");
  const draft = useConversationDraft(conversationId);
  const [noteText, setNoteText] = React.useState("");
  const send = useSendInboxMessage(conversationId);
  const note = useSendInternalNote(conversationId);
  const sendImage = useSendConversationImage(conversationId);
  const attachments = useAttachmentQueue();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const sVM = toSendabilityVM(sendabilityDetail, sendabilityCanSend);
  const block = modeBlock(mode, {
    canSendPerm,
    canNotePerm,
    canSend: sendabilityCanSend,
    connectionMessage: sendabilityMessage,
    requiresTemplate: sVM.requiresTemplate,
  });

  const isNote = mode === "note";
  const text = isNote ? noteText : draft.text;
  const setText = isNote ? setNoteText : draft.setText;
  const limit = TEXT_LIMIT[mode];
  const overLimit = text.length > limit;
  // Anexos só no modo público; envio de texto é BLOQUEADO enquanto houver anexos
  // (senão o envio silenciosamente descartaria os arquivos anexados).
  const canAttach = !isNote && !block.blocked;
  const hasAttachments = attachments.count > 0;
  const sendingImages = sendImage.isPending;
  const canSendImages =
    ATTACHMENTS_SENDABLE && hasAttachments && !block.blocked && !sendingImages;
  const submitOk =
    canSendImages ||
    (canSubmitFn({ mode, text, block, pending: false }) && !hasAttachments);

  const addFiles = React.useCallback(
    (files: FileList | File[]) => {
      const rejected = attachments.add(files);
      if (rejected.length > 0) toast({ title: rejected[0].message, variant: "error" });
    },
    [attachments, toast],
  );

  // Sugestão da IA: INSERE no rascunho (nunca substitui sem consentimento; nunca envia).
  const draftSetText = draft.setText;
  const draftText = draft.text;
  const insertSuggestion = React.useCallback(
    (suggestion: string) => {
      draftSetText(draftText.trim() ? `${draftText}\n${suggestion}` : suggestion);
      inputRef.current?.focus();
    },
    [draftText, draftSetText],
  );

  const sendMutate = send.mutate;
  const noteMutateAsync = note.mutateAsync;
  const clearDraft = draft.clear;

  const sendImageAsync = sendImage.mutateAsync;
  const clearAttachments = attachments.clear;
  const attachmentItems = attachments.items;

  const submit = React.useCallback(async () => {
    // Envio de IMAGEM anexada (outbound de mídia). Precede o texto: quando há anexo,
    // a legenda é o texto atual (só na primeira imagem). Limpa a fila no sucesso.
    if (hasAttachments) {
      if (block.blocked || sendingImages) return;
      const images = attachmentItems.filter((a) => a.mime.startsWith("image/"));
      if (images.length === 0) {
        toast({ title: "Por enquanto só é possível enviar imagens.", variant: "error" });
        return;
      }
      const caption = text.trim();
      try {
        for (let i = 0; i < images.length; i++) {
          const att = images[i];
          const base64 = await fileToBase64(att.file);
          await sendImageAsync({
            base64,
            mimeType: att.mime,
            filename: att.name,
            caption: i === 0 && caption ? caption : undefined,
          });
        }
        clearAttachments();
        clearDraft();
        onClearReply();
      } catch {
        toast({ title: "Não foi possível enviar a imagem.", variant: "error" });
      }
      inputRef.current?.focus();
      return;
    }

    const trimmed = text.trim();
    if (block.blocked || !trimmed || text.length > limit) return;
    const clientMessageId = crypto.randomUUID();
    if (isNote) {
      try {
        await noteMutateAsync({ text: trimmed, clientMessageId });
        setNoteText(""); // limpa só no sucesso (falha preserva o texto)
      } catch {
        toast({ title: "Não foi possível salvar a nota.", variant: "error" });
      }
    } else {
      // Público: otimista (temp na hora; falha vira bolha FAILED com "Tentar novamente").
      sendMutate({ text: trimmed, clientMessageId });
      clearDraft();
      onClearReply();
    }
    inputRef.current?.focus();
  }, [
    text,
    limit,
    block.blocked,
    isNote,
    noteMutateAsync,
    sendMutate,
    clearDraft,
    onClearReply,
    toast,
    hasAttachments,
    sendingImages,
    attachmentItems,
    sendImageAsync,
    clearAttachments,
  ]);

  const showReply = !isNote && replyTarget;
  const draftLabel = isNote ? "" : draftStateLabel(draft.saveState);

  return (
    <div
      onDragEnter={canAttach ? (e) => { e.preventDefault(); setDragging(true); } : undefined}
      onDragOver={canAttach ? (e) => { e.preventDefault(); setDragging(true); } : undefined}
      onDragLeave={canAttach ? (e) => { e.preventDefault(); if (e.currentTarget === e.target) setDragging(false); } : undefined}
      onDrop={
        canAttach
          ? (e) => {
              e.preventDefault();
              setDragging(false);
              if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
            }
          : undefined
      }
      className={cn(
        "relative border-t p-3",
        isNote ? "border-warning/40 bg-warning/5" : "border-line bg-white",
      )}
    >
      {dragging && canAttach ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded bg-brand/10 ring-2 ring-dashed ring-brand">
          <span className="text-body2 font-medium text-brand">Solte os arquivos para anexar</span>
        </div>
      ) : null}
      {/* Troca de modo — visualmente INEQUÍVOCA (nota = âmbar). */}
      <div className="mb-2 flex items-center gap-2">
        <div role="tablist" aria-label="Modo do composer" className="inline-flex rounded-lg border border-line p-0.5">
          {COMPOSER_MODES.map((m) => {
            const active = mode === m;
            const noteTab = m === "note";
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(m)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-caption font-medium transition-colors",
                  active
                    ? noteTab
                      ? "bg-warning/15 text-warning"
                      : "bg-brand-soft text-brand"
                    : "text-ink-3 hover:text-ink",
                )}
              >
                {noteTab ? (
                  <StickyNote className="size-3.5" aria-hidden />
                ) : (
                  <MessageSquare className="size-3.5" aria-hidden />
                )}
                {noteTab ? "Nota interna" : "Responder"}
              </button>
            );
          })}
        </div>
        {isNote ? (
          <span className="text-micro font-medium text-warning">Visível só para a equipe</span>
        ) : null}
      </div>

      {/* Reply target (só no modo público). */}
      {showReply ? (
        <div className="mb-2 flex items-center gap-2 rounded-md border-l-2 border-brand/50 bg-surface px-2 py-1 text-caption text-ink-2">
          <CornerUpLeft className="size-3.5 shrink-0 text-brand" aria-hidden />
          <span className="min-w-0 flex-1 truncate">
            Respondendo a: <span className="text-ink">{replyTarget.preview}</span>
          </span>
          <button
            type="button"
            aria-label="Cancelar resposta"
            onClick={onClearReply}
            className="shrink-0 text-ink-3 hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      {block.blocked ? <p className="mb-2 text-caption text-ink-3">{block.reason}</p> : null}

      {/* Bandeja de anexos. Nesta fase, o envio cobre só IMAGEM. */}
      {hasAttachments ? (
        <div className="mb-2">
          <AttachmentTray attachments={attachments.items} onRemove={attachments.remove} />
          {attachments.items.some((a) => !a.mime.startsWith("image/")) ? (
            <p role="status" className="mt-1 text-micro text-warning">
              {ATTACH_BLOCK_NOTICE}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        {canAttach ? (
          <>
            <SuggestReplyButton conversationId={conversationId} onInsert={insertSuggestion} />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ATTACH_ACCEPT}
              className="sr-only"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = ""; // permite re-selecionar o mesmo arquivo
              }}
            />
            <Button
              size="icon"
              variant="secondary"
              aria-label="Anexar arquivo"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip />
            </Button>
          </>
        ) : null}
        <textarea
          ref={inputRef}
          value={text}
          disabled={block.blocked}
          onChange={(e) => setText(e.target.value)}
          onPaste={
            canAttach
              ? (e) => {
                  const files = Array.from(e.clipboardData.items)
                    .filter((it) => it.kind === "file")
                    .map((it) => it.getAsFile())
                    .filter((f): f is File => f != null);
                  if (files.length) {
                    e.preventDefault();
                    addFiles(files);
                  }
                }
              : undefined
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          rows={1}
          maxLength={limit + 500}
          placeholder={
            isNote ? "Escreva uma nota interna (só a equipe vê)…" : "Escreva uma mensagem…"
          }
          aria-label={isNote ? "Nota interna" : "Mensagem"}
          className={cn(
            "max-h-32 min-h-10 flex-1 resize-none rounded-lg border bg-white px-3 py-2 text-body2 text-ink shadow-sm placeholder:text-ink-3 focus-visible:outline-none focus-visible:ring-2",
            isNote
              ? "focus-visible:border-warning focus-visible:ring-warning/20"
              : "focus-visible:border-brand focus-visible:ring-brand/15",
            overLimit ? "border-danger" : "border-line",
            block.blocked && "cursor-not-allowed bg-surface opacity-70",
          )}
        />
        <Button
          size="icon"
          variant={isNote ? "secondary" : "primary"}
          aria-label={
            hasAttachments ? "Enviar imagem" : isNote ? "Adicionar nota interna" : "Enviar mensagem"
          }
          disabled={!submitOk}
          loading={sendingImages}
          title={hasAttachments ? "Enviar imagem" : undefined}
          onClick={() => void submit()}
        >
          {isNote ? <StickyNote /> : <Send />}
        </Button>
      </div>

      <div className="mt-1 flex items-center justify-between text-micro text-ink-3">
        <span aria-live="polite">{draftLabel}</span>
        {text.length > limit - 500 ? (
          <span className={cn("tabular-nums", overLimit ? "text-danger" : "text-ink-3")}>
            {text.length}/{limit}
          </span>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
