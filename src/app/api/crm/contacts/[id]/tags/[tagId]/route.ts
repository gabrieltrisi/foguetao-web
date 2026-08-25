import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

type P = { params: Promise<{ id: string; tagId: string }> };

export function POST(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id, tagId } = await params;
    await withCompany((ctx) => crmService.attachTag(ctx, id, tagId));
    return NextResponse.json({ ok: true });
  });
}

export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id, tagId } = await params;
    await withCompany((ctx) => crmService.detachTag(ctx, id, tagId));
    return NextResponse.json({ ok: true });
  });
}
