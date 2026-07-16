import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { parseMetricsSummaryQuery } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { metricsService } from "@/lib/api/crm-metrics/service";

/** GET /api/crm/metrics/summary — resumo comercial (exige crm.metrics.read). */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const filters = parseMetricsSummaryQuery(queryParams(request));
    return NextResponse.json(await withCompany((ctx) => metricsService.summary(ctx, filters)));
  });
}
