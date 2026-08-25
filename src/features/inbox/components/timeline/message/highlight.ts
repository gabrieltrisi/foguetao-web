/**
 * Localiza uma mensagem já renderizada (por `data-message-id`) e aplica um destaque
 * TEMPORÁRIO (F2B). Respeita `prefers-reduced-motion` (sem scroll suave). Se a
 * mensagem não estiver carregada no DOM, é no-op seguro (não falha). Não altera
 * seleção. Imperativo por natureza (DOM) — isolado aqui para ser testável/mão única.
 */
export function highlightMessage(messageId: string): boolean {
  if (typeof document === "undefined") return false;
  const el = document.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(messageId)}"]`);
  if (!el) return false;
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  el.classList.add("ring-2", "ring-brand", "ring-offset-2", "rounded-lg");
  window.setTimeout(() => {
    el.classList.remove("ring-2", "ring-brand", "ring-offset-2", "rounded-lg");
  }, 1600);
  return true;
}
