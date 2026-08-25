import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { notificationsService } from "@/lib/api/notifications/service";

const ALLOWED = ["status", "type", "priority", "page", "limit"] as const;

/** GET /api/notifications - lista paginada do usuário atual (notifications.read). */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const q = queryParams(request);
    const params: Record<string, string> = {};
    for (const key of ALLOWED) {
      const v = q[key];
      if (typeof v === "string" && v !== "") params[key] = v;
    }
    return NextResponse.json(await withCompany((ctx) => notificationsService.list(ctx, params)));
  });
}

/** POST /api/notifications - cria uma notificação (notifications.create). */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => notificationsService.create(ctx, body)));
  });
}
