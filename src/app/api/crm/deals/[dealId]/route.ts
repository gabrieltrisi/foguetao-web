import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { dealsService } from "@/lib/api/crm-deals/service";

type P = { params: Promise<{ dealId: string }> };

export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { dealId } = await params;
    return NextResponse.json(await withCompany((ctx) => dealsService.get(ctx, dealId)));
  });
}

export function PATCH(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { dealId } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => dealsService.update(ctx, dealId, body)));
  });
}

export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { dealId } = await params;
    await withCompany((ctx) => dealsService.remove(ctx, dealId));
    return NextResponse.json({ ok: true });
  });
}
