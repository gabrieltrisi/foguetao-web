import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { dealsService } from "@/lib/api/crm-deals/service";

/** Lazy: carregado apenas ao abrir o detalhe da oportunidade. */
export function GET(_r: Request, { params }: { params: Promise<{ dealId: string }> }): Promise<NextResponse> {
  return route(async () => {
    const { dealId } = await params;
    return NextResponse.json(await withCompany((ctx) => dealsService.history(ctx, dealId)));
  });
}
