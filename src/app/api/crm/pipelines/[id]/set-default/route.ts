import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { pipelinesService } from "@/lib/api/crm-deals/service";

export function POST(_r: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    const result = await withCompany((ctx) => pipelinesService.setDefault(ctx, id));
    // propaga o payload do backend ({ message }) sem reescrever
    return NextResponse.json(result);
  });
}
