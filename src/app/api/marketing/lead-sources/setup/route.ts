import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { attributionService } from "@/lib/api/marketing/service";

/**
 * POST /api/marketing/lead-sources/setup - cria as 15 origens padrao
 * (lead_sources.manage). Idempotente: o backend so acrescenta as que faltam.
 */
export function POST(): Promise<NextResponse> {
  return route(async () =>
    NextResponse.json(await withCompany((ctx) => attributionService.setupLeadSources(ctx))),
  );
}
