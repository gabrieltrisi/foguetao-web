import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test as setup, expect } from "@playwright/test";

const exec = promisify(execFile);

/**
 * Autentica uma vez contra o backend REAL (login owner) e persiste o
 * storageState (cookies httpOnly de sessão) para os demais projetos e2e.
 * Requer o foguetao-api rodando em NEXT_PUBLIC_API_URL e o seed aplicado.
 */
export const AUTH_FILE = "e2e/.auth/owner.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("owner@foguetao.dev");
  await page.getByLabel("Senha", { exact: true }).fill("Str0ng!Passw0rd");
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("heading", { name: "Visão geral", level: 1 })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});

/**
 * Zera os contadores de rate limit do ambiente de teste.
 *
 * O backend limita convites a 30/hora POR EMPRESA (proteção real, que NÃO
 * enfraquecemos). Como a suíte de equipe cria convites de verdade, rodá-la
 * duas vezes na mesma hora esbarraria no limite e falharia por motivo
 * ambiental, não por regressão. É o mesmo princípio do `redis.flushdb()` que
 * o e2e do backend já faz — só que cirúrgico, tocando apenas `auth:rl:*`.
 *
 * Best-effort: sem Redis acessível, apenas segue (a suíte ainda roda uma vez).
 */
setup("reset rate limits", async () => {
  const container = process.env.E2E_REDIS_CONTAINER ?? "centralia-redis";
  const script = 'for k in $(redis-cli --scan --pattern "auth:rl:*"); do redis-cli del "$k" >/dev/null; done';
  await exec("docker", ["exec", container, "sh", "-c", script]).catch(() => {
    console.warn("[e2e] rate limits não foram zerados (Redis inacessível) — ok em execução única.");
  });
});
