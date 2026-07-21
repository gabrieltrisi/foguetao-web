import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/api/route-helpers";
import { ApiError, ErrorCode } from "@/types/api/error";
import { verifyEmailRequest, listCompaniesRequest } from "@/lib/auth/service";
import { setSessionCookies, setActiveCompanyId } from "@/lib/auth/cookies";

const bodySchema = z.object({ token: z.string().min(1) });

export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError({
        statusCode: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: "Token de confirmação ausente.",
      });
    }

    const userAgent = request.headers.get("user-agent");
    // Confirma o e-mail e já autentica (o backend retorna tokens).
    const { accessToken, refreshToken, user } = await verifyEmailRequest(
      parsed.data.token,
      userAgent,
    );
    await setSessionCookies({ accessToken, refreshToken });

    try {
      const companies = await listCompaniesRequest(accessToken);
      if (companies.length > 0) {
        await setActiveCompanyId(companies[0].id);
      }
    } catch {
      // Não bloqueia se a listagem falhar (conta nova ainda não tem empresa).
    }

    return NextResponse.json({ user });
  });
}
