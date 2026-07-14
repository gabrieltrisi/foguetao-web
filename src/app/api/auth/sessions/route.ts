import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withAuth } from "@/lib/auth/session";
import { listSessionsRequest } from "@/lib/auth/service";

/** GET /api/auth/sessions — sessões ativas do usuário. */
export function GET(): Promise<NextResponse> {
  return route(async () => {
    const sessions = await withAuth(({ token }) => listSessionsRequest(token));
    return NextResponse.json(sessions);
  });
}
