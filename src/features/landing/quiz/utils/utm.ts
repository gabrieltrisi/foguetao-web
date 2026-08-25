/**
 * Captura de UTM + referrer no cliente, para atribuir o lead à origem. Somente
 * chaves `utm_*` presentes na URL (com valor) são coletadas; nada é inventado.
 */
import type { QuizTracking } from "../types";

export function captureTracking(): QuizTracking {
  if (typeof window === "undefined") return { utm: {}, referrer: "" };

  const utm: Record<string, string> = {};
  try {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of params.entries()) {
      const k = key.toLowerCase();
      if (k.startsWith("utm_") && value) utm[k] = value.slice(0, 200);
    }
  } catch {
    // URL malformada — segue sem utm
  }

  let referrer = "";
  try {
    referrer = document.referrer ? document.referrer.slice(0, 300) : "";
  } catch {
    // ignore
  }

  return { utm, referrer };
}
