import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { requireUuid, parseCampaignAttributionsQuery } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { attributionService } from "@/lib/api/marketing/service";

type P = { params: Promise<{ id: string }> };

/**
 * GET /api/marketing/campaigns/:id/attributions - leads atribuidos a campanha
 * (attribution.read + campaigns.read).
 *
 * `contactCount` e contagem de contatos DISTINTOS do CRM. Nao ha metrica de
 * midia neste contrato: nada de gasto, CPL, receita ou ROAS.
 */
export function GET(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const campaignId = requireUuid((await params).id, "id");
    const filters = parseCampaignAttributionsQuery(queryParams(request));
    return NextResponse.json(
      await withCompany((ctx) =>
        attributionService.listCampaignAttributions(ctx, campaignId, filters),
      ),
    );
  });
}
