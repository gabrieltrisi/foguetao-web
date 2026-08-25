import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

type P = { params: Promise<{ id: string }> };

/** GET /api/messaging/conversations/:id - detalhe (participantes + ultima mensagem). */
export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return NextResponse.json(await withCompany((ctx) => messagingService.getConversation(ctx, id)));
  });
}
