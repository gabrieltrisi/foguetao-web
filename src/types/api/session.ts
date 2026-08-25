import { z } from "zod";
import { userSchema } from "./auth";
import { companySummaryListSchema, companyContextSchema } from "./company";

/**
 * Payload de bootstrap do cliente, montado pelo BFF (/api/session):
 * usuário atual, empresas disponíveis, empresa ativa e contexto/permissões.
 * `context` é null quando o usuário não tem nenhuma empresa acessível.
 */
export const sessionBootstrapSchema = z.object({
  user: userSchema,
  companies: companySummaryListSchema,
  activeCompanyId: z.string().nullable(),
  context: companyContextSchema.nullable(),
});
export type SessionBootstrap = z.infer<typeof sessionBootstrapSchema>;
