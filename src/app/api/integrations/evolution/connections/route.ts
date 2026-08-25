import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { integrationsService } from "@/lib/api/integrations/service";
import { parseCreateEvolutionConnectionBody } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

/** POST /api/integrations/evolution/connections — provisiona conexão (nasce CONNECTING). */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = parseCreateEvolutionConnectionBody(await request.json().catch(() => ({})));
    return NextResponse.json(
      await withCompany((ctx) => integrationsService.evolutionCreate(ctx, body)),
      { status: 201 },
    );
  });
}
