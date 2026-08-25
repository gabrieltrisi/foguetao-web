import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { integrationsService } from "@/lib/api/integrations/service";
import { route } from "@/lib/api/route-helpers";

/** GET /api/integrations/evolution/capabilities — capacidades do provider. */
export function GET(): Promise<NextResponse> {
  return route(async () =>
    NextResponse.json(await withCompany((ctx) => integrationsService.evolutionCapabilities(ctx))),
  );
}
