"use client";

import * as React from "react";
import {
  DEFAULT_ATTACHMENT_CONFIG,
  canPreviewImage,
  canPreviewMedia,
  validateFiles,
  type AttachmentConfig,
  type PendingAttachment,
  type Rejection,
} from "@/features/inbox/attachments";

/**
 * Fila de ANEXOS do Composer (F5). React Query NÃO entra aqui (é estado efêmero de
 * composição). Gerencia a lista + o CICLO DE VIDA de ObjectURL (cria só para
 * previsualizáveis; revoga ao remover/limpar/DESMONTAR — sem vazamento). `add` valida
 * e retorna as rejeições (para toast); nunca lança.
 */
export function useAttachmentQueue(config: AttachmentConfig = DEFAULT_ATTACHMENT_CONFIG) {
  const [items, setItems] = React.useState<PendingAttachment[]>([]);
  const itemsRef = React.useRef<PendingAttachment[]>([]);
  const seq = React.useRef(0);
  React.useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const add = React.useCallback(
    (files: File[] | FileList): Rejection[] => {
      const arr = Array.from(files);
      const { accepted, rejected } = validateFiles(
        arr,
        itemsRef.current,
        config,
        () => `att-${(seq.current += 1)}`,
      );
      if (accepted.length > 0) {
        const withUrls = accepted.map((a) =>
          canPreviewImage(a.mime) || canPreviewMedia(a.mime)
            ? { ...a, previewUrl: URL.createObjectURL(a.file) }
            : a,
        );
        setItems((prev) => [...prev, ...withUrls]);
      }
      return rejected;
    },
    [config],
  );

  const remove = React.useCallback((id: string) => {
    const found = itemsRef.current.find((a) => a.id === id);
    if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
    setItems((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clear = React.useCallback(() => {
    itemsRef.current.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
    setItems([]);
  }, []);

  // Revoga tudo no unmount (evita vazamento de blob:).
  React.useEffect(
    () => () => {
      itemsRef.current.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
    },
    [],
  );

  return { items, add, remove, clear, count: items.length };
}
