import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { pipelinesService } from "@/lib/api/crm-deals/service";

type P = { params: Promise<{ id: string; stageId: string }> };

export function PATCH(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id, stageId } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => pipelinesService.updateStage(ctx, id, stageId, body)));
  });
}

export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id, stageId } = await params;
    const result = await withCompany((ctx) => pipelinesService.deleteStage(ctx, id, stageId));
    // propaga o payload do backend ({ message }) sem reescrever
    return NextResponse.json(result);
  });
}
