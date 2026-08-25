import { NextResponse } from "next/server";

/**
 * Coletor de telemetria do quiz (best-effort). Recebe os eventos via
 * `navigator.sendBeacon`. Em desenvolvimento, loga para inspeção; em produção,
 * apenas aceita (204). Ponto de plug para GA4/PostHog/Plausible no futuro —
 * sem script de terceiros na landing (LCP intacto).
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (process.env.NODE_ENV !== "production") {
    try {
      const body = (await request.json()) as { event?: string; props?: unknown };
      console.debug("[landing-analytics]", body?.event, body?.props ?? {});
    } catch {
      // corpo ausente/inválido — ignora
    }
  }
  return new NextResponse(null, { status: 204 });
}
