import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/api/route-helpers";
import { ApiError, ErrorCode } from "@/types/api/error";
import { registerRequest } from "@/lib/auth/service";

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

    // Cria a conta. NÃO faz login: o backend envia um e-mail de confirmação e o
    // acesso só é liberado após o usuário confirmar (fluxo em /verify-email).
    const result = await registerRequest({ name: name.trim(), email, password }, userAgent);

    return NextResponse.json(
      { pendingVerification: true, email, message: result.message },
      { status: 201 },
    );
  });
}
