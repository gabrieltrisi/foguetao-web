import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { pipelinesService } from "@/lib/api/crm-deals/service";

export function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const ids = (body?.orderedStageIds ?? []) as string[];
    await withCompany((ctx) => pipelinesService.reorderStages(ctx, id, ids));
    return NextResponse.json({ ok: true });
  });
}
