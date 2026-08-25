import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test as setup, expect } from "@playwright/test";

const exec = promisify(execFile);

export const AUTH_FILE = "e2e/.auth/owner.json";

/**
 * Zera os contadores de rate limit de auth ANTES de autenticar.
 *
 * O backend aplica proteções REAIS (que NÃO enfraquecemos): lockout progressivo
 * de login (`auth:login:*`, até 24h após tentativas falhas) e limites de
 * convite/refresh (`auth:rl:*`). As suítes de sessão e de equipe fazem muitos
 * logins e convites de verdade — sem limpar, uma segunda execução na mesma
 * janela travaria o próprio login do owner aqui, por motivo ambiental e não por
 * regressão. É o mesmo princípio do `redis.flushdb()` do e2e do backend, só que
 * cirúrgico: toca apenas as chaves de rate limit de auth.
 *
 * Best-effort: sem Redis acessível, apenas segue (a suíte ainda roda uma vez).
 */
async function resetAuthRateLimits(): Promise<void> {
  const container = process.env.E2E_REDIS_CONTAINER ?? "centralia-redis";
  const script =
    'for k in $(redis-cli --scan --pattern "auth:rl:*") $(redis-cli --scan --pattern "auth:login:*"); do redis-cli del "$k" >/dev/null; done';
  await exec("docker", ["exec", container, "sh", "-c", script]).catch(() => {
    console.warn("[e2e] rate limits não foram zerados (Redis inacessível) — ok em execução única.");
  });
}

/**
 * Autentica uma vez contra o backend REAL (login owner) e persiste o
 * storageState (cookies httpOnly de sessão) para os demais projetos e2e.
 * Requer o foguetao-api rodando em NEXT_PUBLIC_API_URL e o seed aplicado.
 */
setup("authenticate", async ({ page }) => {
  // Primeiro limpa os contadores — senão o login abaixo pode cair no lockout.
  await resetAuthRateLimits();

  await page.goto("/login");
  await page.getByLabel("E-mail").fill("owner@foguetao.dev");
  await page.getByLabel("Senha", { exact: true }).fill("Str0ng!Passw0rd");
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("heading", { name: "Visão geral", level: 1 })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
