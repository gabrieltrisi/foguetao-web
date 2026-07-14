import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { dealsService } from "@/lib/api/crm-deals/service";

type P = { params: Promise<{ dealId: string }> };

export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const dealId = requireUuid((await params).dealId, "dealId");
    return NextResponse.json(await withCompany((ctx) => dealsService.get(ctx, dealId)));
  });
}

export function PATCH(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const dealId = requireUuid((await params).dealId, "dealId");
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => dealsService.update(ctx, dealId, body)));
  });
}

export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const dealId = requireUuid((await params).dealId, "dealId");
    const result = await withCompany((ctx) => dealsService.remove(ctx, dealId));
    // propaga o payload do backend ({ message }) sem reescrever
    return NextResponse.json(result);
  });
}
