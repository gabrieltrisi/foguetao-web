import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { notificationsService } from "@/lib/api/notifications/service";

/** PATCH /api/notifications/read-all - marca todas como lidas (notifications.update). */
export function PATCH(): Promise<NextResponse> {
  return route(async () =>
    NextResponse.json(await withCompany((ctx) => notificationsService.markAllRead(ctx))),
  );
}
