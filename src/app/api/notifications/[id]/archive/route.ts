import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { notificationsService } from "@/lib/api/notifications/service";

type P = { params: Promise<{ id: string }> };

/** PATCH /api/notifications/:id/archive - arquiva uma (notifications.update). */
export function PATCH(_request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return NextResponse.json(await withCompany((ctx) => notificationsService.archive(ctx, id)));
  });
}
