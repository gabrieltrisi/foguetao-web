import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/api/route-helpers";
import { ApiError, ErrorCode } from "@/types/api/error";
import { registerRequest, listCompaniesRequest } from "@/lib/auth/service";
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

    const result = await registerRequest({ name: name.trim(), email, password }, userAgent);

    // Confirmação de e-mail DESLIGADA no backend → já vem com tokens: define os
    // cookies (auto-login) e sinaliza que não há pendência.
    if (result.accessToken && result.refreshToken) {
      await setSessionCookies({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      try {
        const companies = await listCompaniesRequest(result.accessToken);
        if (companies.length > 0) await setActiveCompanyId(companies[0].id);
      } catch {
        // conta nova ainda não tem empresa — ok
      }
      return NextResponse.json({ pendingVerification: false, user: result.user }, { status: 201 });
    }

    // Confirmação LIGADA: sem login; o acesso sai após confirmar (/verify-email).
    return NextResponse.json(
      { pendingVerification: true, email, message: result.message },
      { status: 201 },
    );
  });
}
