import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };

/** Landing pública — sem sessão. */
test.use({ storageState: EMPTY_STATE });

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test.describe("Landing — personalização por segmento", () => {
  test("default: hero geral, sem selo, sem erros de console/hydration", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /operação comercial/i })).toBeVisible();
    await expect(page.getByText("Exemplo para Academias")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /ver para o meu segmento/i })).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(errors, `console: ${errors.join(" | ")}`).toEqual([]);
  });

  test("?segment=academia: headline, selo e CTA do nicho; sem erros", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/?segment=academia");
    await expect(page.getByRole("heading", { name: /oportunidades perdidas/i })).toBeVisible();
    await expect(page.getByText("Exemplo para Academias").first()).toBeVisible();
    // CTA principal preserva o segmento no destino
    const cta = page.getByRole("link", { name: /aumentar minhas matrículas/i }).first();
    await expect(cta).toHaveAttribute("href", /\/register\?segment=academia/);
    await page.waitForLoadState("networkidle");
    expect(errors, `console: ${errors.join(" | ")}`).toEqual([]);
  });

  test("segmento inválido cai na versão geral", async ({ page }) => {
    await page.goto("/?segment=zzz-nao-existe");
    await expect(page.getByRole("heading", { name: /operação comercial/i })).toBeVisible();
    await expect(page.getByText(/Exemplo para/)).toHaveCount(0);
  });

  test("URL inválida NÃO usa o cookie como fallback (URL é autoritativa)", async ({ page }) => {
    // grava a preferência academia via URL válida
    await page.goto("/?segment=academia");
    await expect
      .poll(async () => (await page.context().cookies()).find((c) => c.name === "fg_segment")?.value)
      .toBe("academia");

    // agora um parâmetro inválido PRESENTE: deve mostrar default, não academia
    await page.goto("/?segment=zzz-invalido");
    await expect(page.getByRole("heading", { name: /operação comercial/i })).toBeVisible();
    await expect(page.getByText("Exemplo para Academias")).toHaveCount(0);
    // e o cookie de preferência não é sobrescrito por um typo
    await expect
      .poll(async () => (await page.context().cookies()).find((c) => c.name === "fg_segment")?.value)
      .toBe("academia");
  });

  test("cookie persiste o segmento entre navegações sem parâmetro", async ({ page }) => {
    await page.goto("/?segment=clinica");
    await expect(page.getByText("Exemplo para Clínicas").first()).toBeVisible();
    // o reconciler grava o cookie no cliente
    await expect
      .poll(async () => (await page.context().cookies()).find((c) => c.name === "fg_segment")?.value)
      .toBe("clinica");

    // agora sem parâmetro: o SSR lê o cookie e mantém o nicho
    await page.goto("/");
    await expect(page.getByText("Exemplo para Clínicas").first()).toBeVisible();
  });

  test("trocar de segmento pelo seletor adapta a landing e a URL", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /ver para o meu segmento/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: /nutricionista/i }).click();

    await expect(page).toHaveURL(/segment=nutricionista/);
    await expect(page.getByText("Exemplo para Nutricionistas").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /em consultas/i })).toBeVisible();
  });

  test("teclado: Escape fecha o seletor", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /ver para o meu segmento/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("canonical não carrega ?segment (SEO consolidado na landing principal)", async ({ page }) => {
    await page.goto("/?segment=academia");
    const href = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).not.toContain("segment");
  });
});
