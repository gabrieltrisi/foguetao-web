"use client";

import { useState } from "react";
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

/** URL do conteúdo via BFF (proxy sob demanda do provedor). Auth por cookie httpOnly. */
function contentUrl(mediaId: string): string {
  return `/api/messaging/media/${mediaId}/content`;
}

/**
 * Card de mídia. Fase 2 (áudio+imagem): renderiza a mídia DE VERDADE — imagem
 * inline (clique abre em nova aba) e player de áudio — buscando os bytes por proxy
 * sob demanda (`/content`). Vídeo/documento/arquivo seguem como card de metadados
 * (Fase 2.1). Fallback seguro para mídia removida/indisponível ou erro de carga.
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
  const [failed, setFailed] = useState(false);
  const kind = mediaKind(messageType, data?.mimeType);
  const url = contentUrl(mediaId);
  const unavailable =
    isError || data?.status === "DELETED" || data?.status === "EXPIRED" || failed;

  // Imagem inline (o `kind` já vem do messageType — não espera metadata).
  if (kind === "image" && !unavailable) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block w-fit">
        {/* URL autenticada por proxy (BFF) — o otimizador do next/image não a serve. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={data?.originalFilename ?? "Imagem"}
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-64 max-w-full rounded-md object-cover"
        />
      </a>
    );
  }

  // Áudio: player inline. `preload="none"` → só busca do provedor ao dar play.
  if (kind === "audio" && !unavailable) {
    return (
      <audio
        controls
        preload="none"
        src={url}
        onError={() => setFailed(true)}
        className="h-10 w-64 max-w-full"
      />
    );
  }

  if (isLoading) {
    return <Skeleton className="h-14 w-56 rounded-md" />;
  }

  // Fallback: vídeo/documento/arquivo, ou mídia indisponível/erro → card de metadados.
  const Icon = KIND_ICON[kind];
  const surface = outbound ? "border-white/20 bg-white/10" : "border-line bg-white";
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
