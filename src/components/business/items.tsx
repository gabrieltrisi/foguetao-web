"use client";

import { Download, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntityAvatar } from "@/components/business/entity-avatar";

/** Comentário (avatar + autor + tempo + corpo). */
export function CommentItem({
  author,
  time,
  body,
  className,
}: {
  author: string;
  time: string;
  body: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <EntityAvatar name={author} size="sm" />
      <div className="min-w-0 flex-1 rounded-lg border border-line bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-body2 font-semibold text-ink">{author}</span>
          <span className="text-caption text-ink-3">{time}</span>
        </div>
        <p className="mt-1 text-body2 text-ink-2">{body}</p>
      </div>
    </div>
  );
}

/** Item de arquivo (ícone + nome + tamanho + ações). */
export function FileItem({
  name,
  size,
  onDownload,
  onRemove,
  className,
}: {
  name: string;
  size?: string;
  onDownload?: () => void;
  onRemove?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-line bg-white px-3 py-2.5",
        className,
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
        <FileText className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body2 font-medium text-ink">{name}</p>
        {size ? <p className="text-caption text-ink-3">{size}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onDownload ? (
          <button
            type="button"
            aria-label={`Baixar ${name}`}
            onClick={onDownload}
            className="flex size-8 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Download className="size-4" aria-hidden />
          </button>
        ) : null}
        {onRemove ? (
          <button
            type="button"
            aria-label={`Remover ${name}`}
            onClick={onRemove}
            className="flex size-8 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-surface hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
