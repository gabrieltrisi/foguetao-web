import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { getAccessToken, clearSessionCookies } from "@/lib/auth/cookies";
import { logoutAllRequest } from "@/lib/auth/service";

/** POST /api/auth/logout-all — revoga TODAS as sessões e limpa cookies. */
export function POST(): Promise<NextResponse> {
  return route(async () => {
    const token = await getAccessToken();
    if (token) {
      await logoutAllRequest(token).catch(() => undefined);
    }
    await clearSessionCookies();
    return NextResponse.json({ ok: true });
  });
}
