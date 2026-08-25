import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { requireUuid, parseKanbanQuery } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { pipelinesService } from "@/lib/api/crm-deals/service";

/** Carregar mais cards de UMA coluna (cursor independente por etapa). */
export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; stageId: string }> },
): Promise<NextResponse> {
  return route(async () => {
    const { id, stageId } = await params;
    const pipelineId = requireUuid(id, "pipelineId");
    const stage = requireUuid(stageId, "stageId");
    const query = parseKanbanQuery(queryParams(request));
    return NextResponse.json(
      await withCompany((ctx) => pipelinesService.kanbanColumn(ctx, pipelineId, stage, query)),
    );
  });
}
