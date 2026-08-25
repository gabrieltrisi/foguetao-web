import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { notificationsService } from "@/lib/api/notifications/service";

/** GET /api/notifications/unread-count - contador de não lidas (notifications.read). */
export function GET(): Promise<NextResponse> {
  return route(async () =>
    NextResponse.json(await withCompany((ctx) => notificationsService.unreadCount(ctx))),
  );
}
