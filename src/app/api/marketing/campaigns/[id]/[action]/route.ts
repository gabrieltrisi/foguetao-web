import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid, requireCampaignAction } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { marketingService } from "@/lib/api/marketing/service";
import type { CampaignAction } from "@/types/api/marketing";

type P = { params: Promise<{ id: string; action: string }> };

/**
 * POST /api/marketing/campaigns/:id/:action - acoes de status.
 *
 * Uma rota so para as 6 acoes reais (activate/pause/complete/cancel/archive/
 * restore): a acao e validada contra a allowlist antes de sair da rede interna,
 * e o BACKEND continua sendo a autoridade sobre a transicao (409 se invalida).
 * `activate` exige campaigns.publish; as demais, campaigns.update.
 */
export function POST(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id: rawId, action: rawAction } = await params;
    const id = requireUuid(rawId, "id");
    const action = requireCampaignAction(rawAction) as CampaignAction;
    return NextResponse.json(
      await withCompany((ctx) => marketingService.campaignAction(ctx, id, action)),
    );
  });
}
