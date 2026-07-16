import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid, parseUpdateCampaignBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { marketingService } from "@/lib/api/marketing/service";

type P = { params: Promise<{ id: string }> };

/** GET /api/marketing/campaigns/:id - detalhe (campaigns.read). */
export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return NextResponse.json(await withCompany((ctx) => marketingService.getCampaign(ctx, id)));
  });
}

/**
 * PATCH /api/marketing/campaigns/:id - campos gerais (campaigns.update).
 * NAO altera status: isso e feito pelas acoes, que validam a transicao.
 */
export function PATCH(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    const body = parseUpdateCampaignBody(await request.json().catch(() => ({})));
    return NextResponse.json(
      await withCompany((ctx) => marketingService.updateCampaign(ctx, id, body)),
    );
  });
}

/** DELETE /api/marketing/campaigns/:id - soft delete (campaigns.delete). */
export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    // propaga o { message } do backend sem reescrever
    return NextResponse.json(await withCompany((ctx) => marketingService.deleteCampaign(ctx, id)));
  });
}
