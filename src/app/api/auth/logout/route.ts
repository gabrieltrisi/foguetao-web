import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { getAccessToken, clearSessionCookies } from "@/lib/auth/cookies";
import { logoutRequest } from "@/lib/auth/service";

/** POST /api/auth/logout — revoga a sessão no backend e limpa cookies. */
export function POST(): Promise<NextResponse> {
  return route(async () => {
    const token = await getAccessToken();
    if (token) {
      // Best-effort: mesmo se o backend falhar, limpamos a sessão local.
      await logoutRequest(token).catch(() => undefined);
    }
    await clearSessionCookies();
    return NextResponse.json({ ok: true });
  });
}
