import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

type P = { params: Promise<{ id: string }> };

/** POST owner comercial ({ownerId|null}). conversations.changeOwner. */
export function POST(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => messagingService.changeOwner(ctx, id, body)));
  });
}
