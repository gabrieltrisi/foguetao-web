import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { tasksService } from "@/lib/api/crm-tasks/service";

type P = { params: Promise<{ taskId: string }> };

export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const taskId = requireUuid((await params).taskId, "taskId");
    return NextResponse.json(await withCompany((ctx) => tasksService.get(ctx, taskId)));
  });
}

export function PATCH(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const taskId = requireUuid((await params).taskId, "taskId");
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => tasksService.update(ctx, taskId, body)));
  });
}

export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const taskId = requireUuid((await params).taskId, "taskId");
    // propaga o payload do backend ({ message }) sem reescrever
    const result = await withCompany((ctx) => tasksService.remove(ctx, taskId));
    return NextResponse.json(result);
  });
}
