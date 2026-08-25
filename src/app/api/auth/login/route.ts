import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/api/route-helpers";
import { ApiError, ErrorCode } from "@/types/api/error";
import { loginRequest, listCompaniesRequest } from "@/lib/auth/service";
import { setSessionCookies, setActiveCompanyId } from "@/lib/auth/cookies";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError({
        statusCode: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: "E-mail e senha são obrigatórios",
      });
    }

    // Encaminha o user-agent do NAVEGADOR para o backend registrar na sessão
    // (sem isto, ele veria o UA do runtime do Next).
    const userAgent = request.headers.get("user-agent");
    const { accessToken, refreshToken, user } = await loginRequest(
      parsed.data.email,
      parsed.data.password,
      userAgent,
    );
    await setSessionCookies({ accessToken, refreshToken });

    // Define a empresa ativa inicial (primeira empresa com membership).
    try {
      const companies = await listCompaniesRequest(accessToken);
      if (companies.length > 0) {
        await setActiveCompanyId(companies[0].id);
      }
    } catch {
      // Não bloqueia o login se a listagem de empresas falhar.
    }

    return NextResponse.json({ user });
  });
}
