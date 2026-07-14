import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { dealsService } from "@/lib/api/crm-deals/service";

/** Lazy: carregado apenas ao abrir o detalhe da oportunidade. */
export function GET(request: Request, { params }: { params: Promise<{ dealId: string }> }): Promise<NextResponse> {
  return route(async () => {
    const dealId = requireUuid((await params).dealId, "dealId");
    return NextResponse.json(await withCompany((ctx) => dealsService.activities(ctx, dealId, queryParams(request))));
  });
}
