import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/api/route-helpers";
import { ApiError, ErrorCode } from "@/types/api/error";
import { registerRequest, loginRequest, listCompaniesRequest } from "@/lib/auth/service";
import { setSessionCookies, setActiveCompanyId } from "@/lib/auth/cookies";

// Espelha a política de senha do backend para falhar cedo com mensagem clara.
const bodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(255),
  password: z
    .string()
    .min(10)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError({
        statusCode: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: "Verifique os dados: nome, e-mail e senha forte (mín. 10 caracteres).",
      });
    }

    const userAgent = request.headers.get("user-agent");
    const { name, email, password } = parsed.data;

    // 1) Cria a conta (backend retorna 409 se o e-mail já existe).
    await registerRequest({ name: name.trim(), email, password }, userAgent);

    // 2) Auto-login: já entra logado (define os cookies httpOnly da sessão).
    const { accessToken, refreshToken, user } = await loginRequest(email, password, userAgent);
    await setSessionCookies({ accessToken, refreshToken });

    // 3) Empresa ativa inicial, se houver (conta nova ainda não tem — ok).
    try {
      const companies = await listCompaniesRequest(accessToken);
      if (companies.length > 0) {
        await setActiveCompanyId(companies[0].id);
      }
    } catch {
      // Não bloqueia o cadastro se a listagem de empresas falhar.
    }

    return NextResponse.json({ user }, { status: 201 });
  });
}
