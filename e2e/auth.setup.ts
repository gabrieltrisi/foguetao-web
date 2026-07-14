import { test as setup, expect } from "@playwright/test";

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
