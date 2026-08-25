import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";
import { route } from "@/lib/api/route-helpers";

/** POST /api/messaging/conversations/import-contacts — importa contatos das conversas. */
export function POST(): Promise<NextResponse> {
  return route(async () =>
    NextResponse.json(
      await withCompany((ctx) => messagingService.importContactsFromConversations(ctx)),
    ),
  );
}
