import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

export function GET(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    return NextResponse.json(await withCompany((ctx) => crmService.timeline(ctx, id, queryParams(request))));
  });
}
