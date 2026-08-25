"use client";

import * as React from "react";
import { File as FileIcon, FileText, Image as ImageIcon, Music, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize, mediaKindLabel } from "@/features/inbox/message-format";
import { canPreviewImage, type PendingAttachment } from "@/features/inbox/attachments";

const KIND_ICON = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  file: FileIcon,
  unknown: FileIcon,
} as const;

/**
 * Card de UM anexo pendente (F5) — miniatura segura (imagem raster via blob; vídeo em
 * <video> mudo; demais = ícone). Nome/peso/tipo + remover. `React.memo` (a lista não
 * re-renderiza item a item). NUNCA renderiza conteúdo executável/HTML inline.
 */
export const AttachmentPreview = React.memo(function AttachmentPreview({
  attachment,
  onRemove,
}: {
  attachment: PendingAttachment;
  onRemove: (id: string) => void;
}) {
  const { id, name, size, mime, kind, previewUrl } = attachment;
  const Icon = KIND_ICON[kind] ?? FileIcon;
  const showImage = previewUrl && canPreviewImage(mime);
  const showVideo = previewUrl && mime.startsWith("video/");

  return (
    <div
      role="listitem"
      className="relative flex w-40 shrink-0 items-center gap-2 rounded-lg border border-line bg-white p-1.5 pr-6"
    >
      <div className="size-10 shrink-0 overflow-hidden rounded bg-surface">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={name} className="size-10 object-cover" />
        ) : showVideo ? (
          <video src={previewUrl} muted className="size-10 object-cover" />
        ) : (
          <div className="flex size-10 items-center justify-center text-ink-3">
            <Icon className="size-5" aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-micro font-medium text-ink" title={name}>
          {name}
        </p>
        <p className="truncate text-[10px] text-ink-3">
          {mediaKindLabel(kind)}
          {formatFileSize(size) ? ` · ${formatFileSize(size)}` : ""}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Remover ${name}`}
        onClick={() => onRemove(id)}
        className="absolute right-1 top-1 rounded p-0.5 text-ink-3 hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
});

/** Bandeja de anexos pendentes (rola na horizontal; nunca quebra o layout). */
export function AttachmentTray({
  attachments,
  onRemove,
  className,
}: {
  attachments: PendingAttachment[];
  onRemove: (id: string) => void;
  className?: string;
}) {
  if (attachments.length === 0) return null;
  return (
    <div
      role="list"
      aria-label="Anexos"
      className={cn("flex gap-2 overflow-x-auto pb-1", className)}
    >
      {attachments.map((a) => (
        <AttachmentPreview key={a.id} attachment={a} onRemove={onRemove} />
      ))}
    </div>
  );
}
