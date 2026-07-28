"use client";

import * as React from "react";
import type { SegmentId } from "@/config/landing/segments";
import { persistSegment } from "@/lib/landing/segment";

/**
 * Ilha invisível de reconciliação de segmento.
 *
 * LP3.1 — Reposicionamento Universal: a home pública é personalizada APENAS por
 * um `?segment=` explícito na URL. Portanto este efeito NÃO restaura mais um
 * segmento persistido (cookie/localStorage) na home sem contexto — a home aberta
 * sem contexto permanece universal (`default`).
 *
 * Ele apenas PERSISTE a escolha quando ela veio de uma URL explícita (link de
 * campanha ou aplicação do Quiz), para que a preferência possa ser reutilizada
 * depois de uma escolha explícita. Sem `?segment=` na URL, é um no-op.
 */
export function SegmentReconciler({
  active,
  fromUrl,
}: {
  active: SegmentId;
  fromUrl: boolean;
}) {
  React.useEffect(() => {
    if (fromUrl) persistSegment(active);
    // Sem parâmetro de URL: NÃO restauramos segmento persistido — a home sem
    // contexto nunca vira um nicho (LP3.1).
  }, [active, fromUrl]);

  return null;
}
