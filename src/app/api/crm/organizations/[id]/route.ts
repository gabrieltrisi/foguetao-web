import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

type P = { params: Promise<{ id: string }> };

export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    return NextResponse.json(await withCompany((ctx) => crmService.getOrganization(ctx, id)));
  });
}

export function PATCH(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => crmService.updateOrganization(ctx, id, body)));
  });
}

export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    await withCompany((ctx) => crmService.deleteOrganization(ctx, id));
    return NextResponse.json({ ok: true });
  });
}
