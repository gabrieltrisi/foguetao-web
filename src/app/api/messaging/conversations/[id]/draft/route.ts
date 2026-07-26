import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

type P = { params: Promise<{ id: string }> };

/** GET rascunho do usuário atual (null se não houver). conversations.read. */
export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return NextResponse.json(await withCompany((ctx) => messagingService.getDraft(ctx, id)));
  });
}

/** PUT rascunho (autosave, cifrado; 409 em conflito de versão). messages.send. */
export function PUT(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => messagingService.putDraft(ctx, id, body)));
  });
}

/** DELETE rascunho (204). messages.send. */
export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    await withCompany((ctx) => messagingService.deleteDraft(ctx, id));
    return new NextResponse(null, { status: 204 });
  });
}
