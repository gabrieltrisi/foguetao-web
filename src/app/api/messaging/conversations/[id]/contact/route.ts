import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";
import { requireUuid } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

/** POST /api/messaging/conversations/:id/contact — cria/vincula contato da conversa. */
export function POST(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return NextResponse.json(
      await withCompany((ctx) => messagingService.createContactFromConversation(ctx, id)),
      { status: 201 },
    );
  });
}
