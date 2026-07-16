import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { requireUuid, parseMessageListQuery } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

type P = { params: Promise<{ id: string }> };

/** GET /api/messaging/conversations/:id/messages - cursor (messaging.messages.read). */
export function GET(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    const filters = parseMessageListQuery(queryParams(request));
    return NextResponse.json(
      await withCompany((ctx) => messagingService.listMessages(ctx, id, filters)),
    );
  });
}
