import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { parseConversationListQuery } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

/** GET /api/messaging/conversations - lista por cursor (messaging.conversations.read). */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const filters = parseConversationListQuery(queryParams(request));
    return NextResponse.json(
      await withCompany((ctx) => messagingService.listConversations(ctx, filters)),
    );
  });
}
