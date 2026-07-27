/**
 * Dispatcher de telemetria pluggable. Adapter padrão: `navigator.sendBeacon`
 * (best-effort, não bloqueia a UI) para `/api/landing/analytics`, com fallback
 * em `fetch(keepalive)` e `console.debug` em desenvolvimento. Trocar de provedor
 * (GA4/PostHog/Plausible) depois é só reescrever este arquivo — zero acoplamento
 * com o resto do quiz e sem script de terceiros na landing (LCP intacto).
 */
import type { QuizEventName } from "./events";

const ENDPOINT = "/api/landing/analytics";

export function track(event: QuizEventName, props: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    event,
    props,
    ts: Date.now(),
    path: typeof location !== "undefined" ? location.pathname : "",
  });

  if (process.env.NODE_ENV !== "production") {
    console.debug("[quiz]", event, props);
  }

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(ENDPOINT, {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // telemetria nunca deve quebrar a experiência
  }
}
