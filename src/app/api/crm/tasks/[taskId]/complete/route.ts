import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { tasksService } from "@/lib/api/crm-tasks/service";

/** POST /api/crm/tasks/:id/complete — sem corpo (o backend não usa expectedVersion). */
export function POST(_r: Request, { params }: { params: Promise<{ taskId: string }> }): Promise<NextResponse> {
  return route(async () => {
    const taskId = requireUuid((await params).taskId, "taskId");
    return NextResponse.json(await withCompany((ctx) => tasksService.complete(ctx, taskId)));
  });
}
