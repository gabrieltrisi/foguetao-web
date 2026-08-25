import type { ApiPublicMessageListItem } from "@/types/api/messaging";
import { toTimelineMessage, type TimelineMessageVM } from "@/features/inbox/view-models";

/**
 * Núcleo PURO da timeline (F2A). Uma ÚNICA regra de ORDEM VISUAL (antigo→novo),
 * agrupamento e separadores. Sem React, sem mutação dos dados originais — testável.
 * O backend pagina do mais recente para o mais antigo; aqui produzimos a ordem
 * cronológica estável de exibição.
 */

/** Intervalo máximo (ms) para agrupar mensagens do mesmo remetente. */
export const GROUP_GAP_MS = 5 * 60_000;

interface PageLike {
  items: ApiPublicMessageListItem[];
}

/**
 * Combina páginas do infinite query em uma lista ÚNICA em ordem VISUAL (antigo →
 * novo), deduplicando por id e desempatando por (createdAt, id). Imutável.
 */
export function flattenTimelinePages(pages: PageLike[] | undefined): ApiPublicMessageListItem[] {
  if (!pages || pages.length === 0) return [];
  const byId = new Map<string, ApiPublicMessageListItem>();
  for (const page of pages) {
    for (const m of page.items) {
      if (!byId.has(m.id)) byId.set(m.id, m);
    }
  }
  return [...byId.values()].sort((a, b) => {
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
    return a.id < b.id ? -1 : 1; // desempate estável
  });
}

/** Chave de DIA no fuso local (para separadores). */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Rótulo do separador de dia: Hoje / Ontem / dia da semana / data curta. */
export function formatTimelineDay(iso: string, now: Date): string {
  const d = new Date(iso);
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(now) - start(d)) / 86_400_000);
  if (diff <= 0) return "Hoje";
  if (diff === 1) return "Ontem";
  if (diff < 7) {
    const wd = d.toLocaleDateString("pt-BR", { weekday: "long" });
    return wd.charAt(0).toUpperCase() + wd.slice(1);
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Devem `prev` e `curr` ficar no MESMO grupo? Sistema NUNCA agrupa. Requer mesma
 * classe (public/internal), mesma direção, mesmo autor e intervalo curto.
 */
export function shouldGroupMessages(
  prev: TimelineMessageVM,
  curr: TimelineMessageVM,
  maxGapMs = GROUP_GAP_MS,
): boolean {
  if (prev.kind === "system" || curr.kind === "system") return false;
  if (prev.kind !== curr.kind) return false;
  if (prev.direction !== curr.direction) return false;
  if ((prev.senderUserId ?? null) !== (curr.senderUserId ?? null)) return false;
  const gap = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
  return gap >= 0 && gap <= maxGapMs;
}

/**
 * Primeira mensagem NÃO LIDA do usuário atual (aproximada). `unreadForUser` conta
 * mensagens PUBLIC INBOUND após a leitura; a primeira não lida = a N-ésima do fim
 * entre as inbound públicas CARREGADAS. Limitação: se nem todas as páginas foram
 * carregadas, a posição pode ser conservadora (a primeira inbound carregada).
 * Retorna `null` quando não há não-lidas.
 */
export function findFirstUnreadId(
  ordered: ApiPublicMessageListItem[],
  unreadForUser: number | null | undefined,
): string | null {
  if (!unreadForUser || unreadForUser <= 0) return null;
  const inbound = ordered.filter(
    (m) => m.direction === "INBOUND" && (m.visibility ?? "PUBLIC") === "PUBLIC",
  );
  if (inbound.length === 0) return null;
  const idx = Math.max(0, inbound.length - unreadForUser);
  return inbound[idx]?.id ?? null;
}

/* ---------- Itens visuais da timeline ---------- */

export type GroupPosition = "single" | "first" | "middle" | "last";

export interface GroupMeta {
  firstInGroup: boolean;
  lastInGroup: boolean;
  showSender: boolean;
  showTimestamp: boolean;
  position: GroupPosition;
}

export type TimelineItem =
  | { kind: "day"; id: string; label: string; at: string }
  | { kind: "unread"; id: string }
  | { kind: "message"; id: string; message: TimelineMessageVM; group: GroupMeta };

/**
 * Constrói a lista de ITENS VISUAIS: separadores de dia, separador de não-lidas
 * (uma única vez) e mensagens com metadados de grupo. Entrada já ordenada
 * (antigo→novo) por `flattenTimelinePages`. PURA.
 */
export function buildTimeline(
  ordered: ApiPublicMessageListItem[],
  opts: { now: Date; firstUnreadId?: string | null },
): TimelineItem[] {
  const out: TimelineItem[] = [];
  const vms = ordered.map(toTimelineMessage);
  let lastDay: string | null = null;
  let unreadInserted = false;

  for (let i = 0; i < vms.length; i++) {
    const vm = vms[i];
    const raw = ordered[i];
    const dk = dayKey(raw.createdAt);
    if (dk !== lastDay) {
      out.push({ kind: "day", id: `day-${dk}`, label: formatTimelineDay(raw.createdAt, opts.now), at: raw.createdAt });
      lastDay = dk;
    }
    if (!unreadInserted && opts.firstUnreadId && vm.id === opts.firstUnreadId) {
      out.push({ kind: "unread", id: "unread-sep" });
      unreadInserted = true;
    }

    // Grupo: compara com a mensagem anterior (não separador) do mesmo dia.
    const prevVm = i > 0 ? vms[i - 1] : null;
    const sameDayAsPrev = prevVm ? dayKey(ordered[i - 1].createdAt) === dk : false;
    const groupsWithPrev = prevVm !== null && sameDayAsPrev && shouldGroupMessages(prevVm, vm);
    const nextVm = i < vms.length - 1 ? vms[i + 1] : null;
    const sameDayAsNext = nextVm ? dayKey(ordered[i + 1].createdAt) === dk : false;
    const groupsWithNext = nextVm !== null && sameDayAsNext && shouldGroupMessages(vm, nextVm);

    const firstInGroup = !groupsWithPrev;
    const lastInGroup = !groupsWithNext;
    const position: GroupPosition =
      firstInGroup && lastInGroup ? "single" : firstInGroup ? "first" : lastInGroup ? "last" : "middle";

    out.push({
      kind: "message",
      id: vm.id,
      message: vm,
      group: {
        firstInGroup,
        lastInGroup,
        showSender: firstInGroup && vm.kind !== "system",
        showTimestamp: lastInGroup,
        position,
      },
    });
  }
  return out;
}
