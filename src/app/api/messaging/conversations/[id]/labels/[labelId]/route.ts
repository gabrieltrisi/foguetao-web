import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

type P = { params: Promise<{ id: string; labelId: string }> };

/** DELETE remover etiqueta da conversa (idempotente). conversations.label. */
export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const p = await params;
    const id = requireUuid(p.id, "id");
    const labelId = requireUuid(p.labelId, "labelId");
    return NextResponse.json(
      await withCompany((ctx) => messagingService.removeConversationLabel(ctx, id, labelId)),
    );
  });
}
