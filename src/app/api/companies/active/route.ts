import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/api/route-helpers";
import { ApiError, ErrorCode } from "@/types/api/error";
import { withAuth } from "@/lib/auth/session";
import { companyContextRequest } from "@/lib/auth/service";
import { setActiveCompanyId } from "@/lib/auth/cookies";

const bodySchema = z.object({ companyId: z.string().uuid() });

/**
 * POST /api/companies/active — troca a empresa ativa.
 * Valida a membership (context lança 403/404 se não houver acesso) ANTES
 * de persistir o cookie fg_cid. Retorna o contexto/permissões da empresa.
 */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError({
        statusCode: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: "companyId inválido",
      });
    }

    const context = await withAuth(({ token }) =>
      companyContextRequest(token, parsed.data.companyId),
    );

    await setActiveCompanyId(parsed.data.companyId);
    return NextResponse.json(context);
  });
}
