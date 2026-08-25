/**
 * Formatação de tempo relativo da central de notificações. PURO: `now` é passado
 * como parâmetro (nunca `new Date()` interno) para ser determinístico e testável.
 * pt-BR, sem biblioteca de i18n (segue o padrão de `features/inbox/format.ts`).
 */
export function formatNotificationTime(iso: string | null, now: Date): string {
  if (!iso) return "";
  const then = new Date(iso);
  const ms = now.getTime() - then.getTime();
  if (Number.isNaN(ms)) return "";

  const sec = Math.floor(ms / 1000);
  if (sec < 45) return "agora";
  const min = Math.floor(sec / 60);
  if (min < 60) return `há ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return then.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Timestamp completo para tooltip/acessibilidade. */
export function fullNotificationTimestamp(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
