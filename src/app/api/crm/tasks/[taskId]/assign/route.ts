import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid, parseAssignBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { tasksService } from "@/lib/api/crm-tasks/service";

/** POST /api/crm/tasks/:id/assign — { assignedToUserId } (UUID obrigatório). */
export function POST(request: Request, { params }: { params: Promise<{ taskId: string }> }): Promise<NextResponse> {
  return route(async () => {
    const taskId = requireUuid((await params).taskId, "taskId");
    const body = parseAssignBody(await request.json().catch(() => null));
    return NextResponse.json(await withCompany((ctx) => tasksService.assign(ctx, taskId, body)));
  });
}
