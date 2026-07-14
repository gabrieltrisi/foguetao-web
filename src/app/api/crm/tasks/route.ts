import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { parseTaskListQuery } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { tasksService } from "@/lib/api/crm-tasks/service";

export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const filters = parseTaskListQuery(queryParams(request));
    return NextResponse.json(await withCompany((ctx) => tasksService.list(ctx, filters)));
  });
}

export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => tasksService.create(ctx, body)), { status: 201 });
  });
}
