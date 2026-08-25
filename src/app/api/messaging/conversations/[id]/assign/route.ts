import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid, parseAssignConversationBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

type P = { params: Promise<{ id: string }> };

/** POST /api/messaging/conversations/:id/assign - exige messaging.conversations.assign. */
export function POST(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    const body = parseAssignConversationBody(await request.json().catch(() => ({})));
    return NextResponse.json(
      await withCompany((ctx) => messagingService.assignConversation(ctx, id, body)),
    );
  });
}
