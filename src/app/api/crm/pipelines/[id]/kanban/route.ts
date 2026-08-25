import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { requireUuid, parseKanbanQuery } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { pipelinesService } from "@/lib/api/crm-deals/service";

/** Board do Kanban: colunas + primeira página de cards por etapa. */
export function GET(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "pipelineId");
    const query = parseKanbanQuery(queryParams(request));
    return NextResponse.json(await withCompany((ctx) => pipelinesService.kanbanBoard(ctx, id, query)));
  });
}
