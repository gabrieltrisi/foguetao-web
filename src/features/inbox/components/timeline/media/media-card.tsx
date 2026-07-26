"use client";

import { File, FileText, Image as ImageIcon, Music, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useMedia } from "@/features/inbox/hooks/use-media";
import {
  fileExtension,
  formatFileSize,
  mediaKind,
  mediaKindLabel,
  type MediaKind,
} from "@/features/inbox/message-format";

const KIND_ICON: Record<MediaKind, typeof File> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  file: File,
  unknown: File,
};

/**
 * Card de mídia (F2B) — SÓ metadados. O backend não expõe bytes/URL de download
 * nesta fase (storage MOCK), então NÃO há preview/reprodução/lightbox: mostra-se
 * ícone por tipo, nome, tamanho e um aviso de prévia indisponível. Fallback seguro
 * para mídia indisponível/removida. Reprodução real depende de download assinado
 * (pendência de backend — ver docs). Nunca renderiza HTML/SVG remoto.
 */
export function MediaCard({
  mediaId,
  messageType,
  outbound,
}: {
  mediaId: string;
  messageType: string;
  outbound?: boolean;
}) {
  const { data, isLoading, isError } = useMedia(mediaId);
  const kind = mediaKind(messageType, data?.mimeType);
  const Icon = KIND_ICON[kind];
  const surface = outbound ? "border-white/20 bg-white/10" : "border-line bg-white";

  if (isLoading) {
    return <Skeleton className="h-14 w-56 rounded-md" />;
  }

  const unavailable = isError || data?.status === "DELETED" || data?.status === "EXPIRED";
  const name = data?.originalFilename ?? mediaKindLabel(kind);
  const ext = fileExtension(data?.originalFilename);
  const size = formatFileSize(data?.sizeBytes);

  return (
    <div className={cn("flex items-center gap-2.5 rounded-md border px-3 py-2", surface)}>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded",
          outbound ? "bg-white/15 text-white" : "bg-surface text-ink-2",
        )}
        aria-hidden
      >
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-body2 font-medium", outbound ? "text-white" : "text-ink")} title={name}>
          {name}
        </p>
        <p className={cn("truncate text-micro", outbound ? "text-white/70" : "text-ink-3")}>
          {unavailable ? (
            <span className="text-danger">Anexo indisponível</span>
          ) : (
            <>
              {[mediaKindLabel(kind), ext, size].filter(Boolean).join(" · ")}
              <span className="ml-1 opacity-80">· prévia indisponível</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
