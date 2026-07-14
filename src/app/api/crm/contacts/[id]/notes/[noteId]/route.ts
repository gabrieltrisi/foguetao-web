import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

type P = { params: Promise<{ id: string; noteId: string }> };

export function PATCH(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id, noteId } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => crmService.updateNote(ctx, id, noteId, body)));
  });
}

export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id, noteId } = await params;
    await withCompany((ctx) => crmService.deleteNote(ctx, id, noteId));
    return NextResponse.json({ ok: true });
  });
}
