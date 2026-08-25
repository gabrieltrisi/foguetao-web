import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { backendUrl, COMPANY_ID_HEADER } from "@/lib/api/config";

type P = { params: Promise<{ id: string }> };

/**
 * GET conteúdo binário do criativo — PROXY de stream. O backend devolve os bytes
 * da imagem (SVG no mock, JPEG no real); aqui só repassamos com auth (cookie
 * httpOnly → Bearer + x-company-id), sem bufferizar o corpo. Cache privado curto
 * reduz re-fetch. creatives.read (no backend).
 */
export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return withCompany(async ({ token, companyId }) => {
      const upstream = await fetch(backendUrl(`/creatives/${id}/content`), {
        headers: { authorization: `Bearer ${token}`, [COMPANY_ID_HEADER]: companyId },
      });
      if (!upstream.ok || !upstream.body) {
        return new NextResponse(null, { status: upstream.status || 502 });
      }
      return new NextResponse(upstream.body, {
        status: 200,
        headers: {
          "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
          "cache-control": "private, max-age=300",
          "x-content-type-options": "nosniff",
        },
      });
    });
  });
}
