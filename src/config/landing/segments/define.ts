import { DEFAULT_SEGMENT } from "./default";
import type { SegmentContent, SegmentId } from "./types";

/** Partial recursivo: um segmento sobrescreve só o que muda. */
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Deep-merge: objetos são mesclados recursivamente; arrays e primitivos são
 * SUBSTITUÍDOS (um segmento que declara `benefits` troca a lista inteira, sem
 * concatenar). Retorna um objeto novo — nunca muta a base.
 */
function deepMerge<T>(base: T, override: DeepPartial<T>): T {
  const out: Record<string, unknown> = Array.isArray(base) ? [...(base as unknown[])] as never : { ...(base as object) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (value === undefined) continue;
    const current = (out as Record<string, unknown>)[key];
    out[key] = isPlainObject(value) && isPlainObject(current) ? deepMerge(current, value as DeepPartial<unknown>) : value;
  }
  return out as T;
}

/**
 * Cria um segmento a partir do conteúdo GERAL, aplicando só as diferenças.
 * `id`, `label` e `emoji` são obrigatórios (identidade no seletor); o resto é
 * herdado do default quando omitido.
 */
export function defineSegment(
  identity: { id: SegmentId; label: string; emoji: string },
  overrides: DeepPartial<Omit<SegmentContent, "id" | "label" | "emoji">> = {},
): SegmentContent {
  return { ...deepMerge(DEFAULT_SEGMENT, overrides), ...identity };
}
