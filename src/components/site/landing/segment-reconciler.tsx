"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isSegmentId } from "@/config/landing/segments";
import type { SegmentId } from "@/config/landing/segments";
import { persistSegment, SEGMENT_STORAGE_KEY, withSegment } from "@/lib/landing/segment";

/**
 * Ilha invisível que reconcilia a prioridade URL > Cookie > LocalStorage.
 *
 * O servidor só enxerga URL e cookie, então o SSR é determinístico (sem
 * hydration mismatch). Este efeito, uma vez montado, cuida do que o servidor
 * não vê — SEMPRE respeitando que a URL é autoritativa:
 *  - URL válida        → grava cookie + localStorage (a escolha "gruda");
 *  - URL presente inválida → não faz NADA (não restaura, não sobrescreve cookie);
 *  - sem URL, veio do cookie → espelha no localStorage;
 *  - sem URL e default → se houver segmento no localStorage, restaura via URL.
 */
export function SegmentReconciler({
  active,
  fromUrl,
  urlPresent,
}: {
  active: SegmentId;
  fromUrl: boolean;
  urlPresent: boolean;
}) {
  const router = useRouter();

  React.useEffect(() => {
    if (fromUrl) {
      persistSegment(active);
      return;
    }
    // Havia parâmetro na URL, porém inválido: a URL manda (default nesta view).
    // Não restaura do storage nem sobrescreve o cookie por causa de um typo.
    if (urlPresent) return;
    // Sem parâmetro na URL: veio do cookie → espelha no localStorage.
    if (active !== "default") {
      persistSegment(active);
      return;
    }
    // Sem URL e default: tenta restaurar do localStorage.
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(SEGMENT_STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (isSegmentId(stored) && stored !== "default") {
      router.replace(withSegment("/", stored), { scroll: false });
    }
  }, [active, fromUrl, urlPresent, router]);

  return null;
}
