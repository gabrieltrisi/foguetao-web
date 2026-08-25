import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/api/route-helpers";
import { ApiError, ErrorCode } from "@/types/api/error";
import { withAuth } from "@/lib/auth/session";
import { createCompanyRequest } from "@/lib/auth/service";
import { setActiveCompanyId } from "@/lib/auth/cookies";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional(),
  timezone: z.string().trim().max(64).optional(),
});

/**
 * POST /api/companies — cria a empresa do usuário (onboarding). O criador vira
 * OWNER no backend. Já define a empresa recém-criada como ativa (cookie fg_cid)
 * para que o próximo bootstrap de sessão a resolva sem passo extra.
 */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError({
        statusCode: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: "Informe um nome de empresa válido (2 a 120 caracteres).",
      });
    }

    const body = {
      name: parsed.data.name,
      ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
      ...(parsed.data.timezone ? { timezone: parsed.data.timezone } : {}),
    };

    const company = await withAuth(({ token }) => createCompanyRequest(token, body));

    await setActiveCompanyId(company.id);
    return NextResponse.json(company, { status: 201 });
  });
}
