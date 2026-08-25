import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

type P = { params: Promise<{ id: string }> };

export function GET(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    return NextResponse.json(await withCompany((ctx) => crmService.listNotes(ctx, id, queryParams(request))));
  });
}

export function POST(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => crmService.createNote(ctx, id, body)), { status: 201 });
  });
}
