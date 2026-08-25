import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid, parseDealActionBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { dealsService } from "@/lib/api/crm-deals/service";

/** POST /api/crm/deals/:id/lose — exige expectedVersion (optimistic locking). */
export function POST(request: Request, { params }: { params: Promise<{ dealId: string }> }): Promise<NextResponse> {
  return route(async () => {
    const dealId = requireUuid((await params).dealId, "dealId");
    const body = parseDealActionBody(await request.json().catch(() => null));
    return NextResponse.json(await withCompany((ctx) => dealsService.lose(ctx, dealId, body)));
  });
}
