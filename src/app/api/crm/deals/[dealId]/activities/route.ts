import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { dealsService } from "@/lib/api/crm-deals/service";

/** Lazy: carregado apenas ao abrir o detalhe da oportunidade. */
export function GET(request: Request, { params }: { params: Promise<{ dealId: string }> }): Promise<NextResponse> {
  return route(async () => {
    const { dealId } = await params;
    return NextResponse.json(await withCompany((ctx) => dealsService.activities(ctx, dealId, queryParams(request))));
  });
}
