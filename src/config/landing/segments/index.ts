import { DEFAULT_SEGMENT } from "./default";
import { ACADEMIA } from "./academia";
import { NUTRICIONISTA } from "./nutricionista";
import { CLINICA } from "./clinica";
import { ESTETICA } from "./estetica";
import { AGENCIA } from "./agencia";
import { IMOBILIARIA } from "./imobiliaria";
import { LOJA } from "./loja";
import { PRESTADOR_SERVICO } from "./prestador-servico";
import { OUTRO } from "./outro";
import { COMMON_FAQ, SEGMENT_IDS } from "./types";
import type { LandingContent, SegmentContent, SegmentId } from "./types";

export type { LandingContent, SegmentContent, SegmentId } from "./types";
export type {
  HeroContent,
  BenefitItem,
  BenefitIconKey,
  FaqItem,
  FinalCtaContent,
  PipelineContent,
  CrmExamples,
  CrmDashboard,
  CrmBoardColumn,
  CrmContact,
  CrmDeal,
  CrmTask,
  CrmFunnelRow,
  CrmActivity,
  CrmTag,
  Tone,
} from "./types";

/** Registro completo dos segmentos, indexado por id. */
export const SEGMENTS: Record<SegmentId, SegmentContent> = {
  default: DEFAULT_SEGMENT,
  academia: ACADEMIA,
  nutricionista: NUTRICIONISTA,
  clinica: CLINICA,
  estetica: ESTETICA,
  agencia: AGENCIA,
  imobiliaria: IMOBILIARIA,
  loja: LOJA,
  "prestador-servico": PRESTADOR_SERVICO,
  outro: OUTRO,
};

/**
 * Opções mostradas no seletor, na ordem do produto. Exclui `default` (é o
 * estado sem escolha), mas inclui `outro` (versão geral, escolhível).
 */
export const SEGMENT_OPTIONS: { id: SegmentId; label: string; emoji: string }[] = SEGMENT_IDS.filter(
  (id) => id !== "default",
).map((id) => ({ id, label: SEGMENTS[id].label, emoji: SEGMENTS[id].emoji }));

/** Type guard: `value` é um SegmentId conhecido? */
export function isSegmentId(value: unknown): value is SegmentId {
  return typeof value === "string" && (SEGMENT_IDS as readonly string[]).includes(value);
}

/** Normaliza qualquer entrada em um SegmentId válido; inválido → `default`. */
export function normalizeSegmentId(value: unknown): SegmentId {
  return isSegmentId(value) ? value : "default";
}

/**
 * A URL tem um `segment` COM valor? Um valor não-vazio (mesmo inválido, ex.
 * `?segment=xyz`) conta como presente. Um `?segment=` vazio é tratado como
 * AUSENTE — não faz sentido perder a preferência salva por um parâmetro vazio.
 */
export function hasUrlSegment(url: unknown): boolean {
  return typeof url === "string" && url.trim() !== "";
}

/**
 * Resolve o segmento ativo com a regra DEFINITIVA:
 *
 *  - Se `?segment=` está PRESENTE na URL, ele é AUTORITATIVO: válido → usa;
 *    inválido → `default`. Nunca cai para cookie/localStorage quando há
 *    parâmetro (mesmo inválido) — a URL vence.
 *  - Só quando NÃO há parâmetro na URL: cookie válido → localStorage válido →
 *    `default`.
 *
 * O servidor passa apenas url+cookie; o cliente pode acrescentar storage.
 */
export function resolveSegmentId(sources: {
  url?: unknown;
  cookie?: unknown;
  storage?: unknown;
}): SegmentId {
  if (hasUrlSegment(sources.url)) {
    return isSegmentId(sources.url) ? sources.url : "default";
  }
  for (const candidate of [sources.cookie, sources.storage]) {
    if (isSegmentId(candidate)) return candidate;
  }
  return "default";
}

/**
 * Conteúdo pronto para a UI: resolve o FAQ final (base comum + específicas do
 * nicho) e devolve todas as fatias tipadas. Componentes consomem só isto.
 */
export function getLandingContent(id: SegmentId): LandingContent {
  const segment = SEGMENTS[normalizeSegmentId(id)];
  const { faqExtra, ...rest } = segment;
  return { ...rest, faq: [...COMMON_FAQ, ...faqExtra] };
}
