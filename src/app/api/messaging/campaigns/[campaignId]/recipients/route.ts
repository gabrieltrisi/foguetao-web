import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { campaignsService } from "@/lib/api/campaigns/service";
import { requireUuid } from "@/lib/api/validation";
import { queryParams, route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ campaignId: string }> };

/** GET /api/messaging/campaigns/:id/recipients — paginado + filtros (sem ciphertext). */
export function GET(request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).campaignId, "campaignId");
    const params2 = queryParams(request);
    return NextResponse.json(await withCompany((ctx) => campaignsService.recipients(ctx, id, params2)));
  });
}
