import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { dealsService } from "@/lib/api/crm-deals/service";

export function GET(): Promise<NextResponse> {
  return route(async () => NextResponse.json(await withCompany((ctx) => dealsService.lostReasons(ctx))));
}
