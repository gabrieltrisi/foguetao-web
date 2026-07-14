import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { buildSessionBootstrap } from "@/lib/auth/bootstrap";

/** GET /api/session — bootstrap do cliente (usuário, empresas, contexto). */
export function GET(): Promise<NextResponse> {
  return route(async () => {
    const bootstrap = await buildSessionBootstrap();
    return NextResponse.json(bootstrap);
  });
}
