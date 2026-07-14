import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { pipelinesService } from "@/lib/api/crm-deals/service";

type P = { params: Promise<{ id: string }> };

export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    return NextResponse.json(await withCompany((ctx) => pipelinesService.get(ctx, id)));
  });
}

export function PATCH(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => pipelinesService.update(ctx, id, body)));
  });
}

export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    const result = await withCompany((ctx) => pipelinesService.remove(ctx, id));
    // propaga o payload do backend ({ message }) sem reescrever
    return NextResponse.json(result);
  });
}
