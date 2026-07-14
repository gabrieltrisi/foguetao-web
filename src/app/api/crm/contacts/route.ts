import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const data = await withCompany((ctx) => crmService.listContacts(ctx, queryParams(request)));
    return NextResponse.json(data);
  });
}

export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = await request.json().catch(() => ({}));
    const data = await withCompany((ctx) => crmService.createContact(ctx, body));
    return NextResponse.json(data, { status: 201 });
  });
}
