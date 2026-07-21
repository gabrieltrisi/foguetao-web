import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const PASS = "Str0ng!Passw0rd";
const VIEWER = { email: "viewer@foguetao.dev", password: PASS };
const OWNER_NAME = "Owner Dev";
const API = "http://localhost:3000/api/v1";
/** storageState do projeto: `browser.newContext()` NÃO o herda. */
const OWNER_STATE = "e2e/.auth/owner.json";
const MEMBER_RE = /\/team\/[0-9a-f-]{36}/;

/** Membros do seed: mexer neles quebraria outras suítes. */
const SEED_EMAILS = ["owner@foguetao.dev", "commercial@foguetao.dev", "viewer@foguetao.dev"];

/** A tabela de membros/convites — evita casar com a navegação lateral. */
function table(page: Page) {
  return page.locator("tbody");
}

/** A linha de um membro/convite específico. Imune à re-renderização do filtro. */
function row(page: Page, text: string) {
  return table(page).locator("tr").filter({ hasText: text });
}

/**
 * Cria um usuário descartável de verdade (o backend não tem seed para isso).
 * Não é mock: é uma conta real criada pelo endpoint real de registro.
 */
async function createUser(request: APIRequestContext, label: string) {
  const email = `e2e-${label}-${Date.now()}@e2e.dev`;
  const name = `E2E ${label} ${Date.now()}`;
  const res = await request.post(`${API}/auth/register`, {
    data: { name, email, password: PASS },
  });
  expect(res.status()).toBe(201);
  // A confirmação de e-mail é obrigatória para o login. Fora de produção o
  // backend expõe o verifyToken — confirmamos pelo fluxo REAL (sem burlar a
  // segurança nem desabilitar a confirmação).
  const { verifyToken } = await res.json();
  expect(verifyToken, "backend deve expor verifyToken fora de produção").toBeTruthy();
  const confirm = await request.post(`${API}/auth/verify-email`, { data: { token: verifyToken } });
  expect(confirm.status()).toBe(200);
  return { email, name };
}

/** Convida pela UI e devolve o token (o backend só o expõe fora de produção). */
async function invite(page: Page, email: string, role: string): Promise<string> {
  const res = await page.request.post("/api/company/invitations", {
    data: { email, role },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  const token = body.token ?? body.devToken;
  expect(token, "o backend deve expor o token fora de produção").toBeTruthy();
  return token as string;
}

async function loginAs(page: Page, email: string, password = PASS) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

/** Registra + convida + aceita: devolve um membro descartável já ativo. */
async function addMember(page: Page, memberPage: Page, role: string, label: string) {
  const user = await createUser(page.request, label);
  const token = await invite(page, user.email, role);
  await loginAs(memberPage, user.email);
  await memberPage.goto(`/invitations/accept/${token}`);
  await memberPage.getByRole("button", { name: "Aceitar convite" }).click();
  await expect(memberPage.getByRole("heading", { name: "Convite aceito" })).toBeVisible();
  return user;
}

test.describe("Equipe — listagem (owner)", () => {
  test("lista membros reais e destaca o usuário atual", async ({ page }) => {
    await page.goto("/team");
    await expect(page.getByRole("heading", { level: 1, name: "Equipe" })).toBeVisible();

    await expect(table(page).getByText(OWNER_NAME)).toBeVisible();
    await expect(table(page).getByText("commercial@foguetao.dev")).toBeVisible();
    // o próprio usuário aparece marcado
    await expect(page.getByText("você", { exact: true })).toBeVisible();
    await expect(page.getByText(/membro\(s\) na empresa ativa/)).toBeVisible();
  });

  test("filtra por papel e por status", async ({ page }) => {
    await page.goto("/team");
    await expect(table(page).getByText(OWNER_NAME)).toBeVisible();

    await page.getByRole("button", { name: "Todos os papéis" }).click();
    await page.getByRole("option", { name: "Owner", exact: true }).click();
    await expect(table(page).getByText(OWNER_NAME)).toBeVisible();
    await expect(table(page).getByText("commercial@foguetao.dev")).toHaveCount(0);

    await page.getByRole("button", { name: "Owner", exact: true }).click();
    await page.getByRole("option", { name: "Todos os papéis" }).click();
    await expect(table(page).getByText("commercial@foguetao.dev")).toBeVisible();
  });

  test("busca por nome ou e-mail (debounce)", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/company/members?")) requests.push(r.url());
    });

    await page.goto("/team");
    await expect(table(page).getByText(OWNER_NAME)).toBeVisible();

    await page.getByPlaceholder("Buscar por nome ou e-mail…").fill("commercial");
    await expect(table(page).getByText("commercial@foguetao.dev")).toBeVisible();
    await expect(table(page).getByText(OWNER_NAME)).toHaveCount(0);

    // debounce: a digitação inteira não gera uma requisição por tecla
    expect(requests.filter((u) => u.includes("search=")).length).toBeLessThan(5);
  });

  test("estado vazio quando a busca não casa", async ({ page }) => {
    await page.goto("/team");
    await page.getByPlaceholder("Buscar por nome ou e-mail…").fill("zzz-nao-existe-zzz");
    await expect(page.getByText("Nenhum membro encontrado.")).toBeVisible();
  });

  test("abre o detalhe do membro", async ({ page }) => {
    await page.goto("/team");
    await table(page).getByText("Commercial Dev").click();
    await page.waitForURL(MEMBER_RE);
    await expect(page.getByRole("heading", { level: 1, name: "Commercial Dev" })).toBeVisible();
    await expect(page.getByText("commercial@foguetao.dev").first()).toBeVisible();
  });
});

test.describe("Convites (owner)", () => {
  test("cria convite e ele aparece como pendente", async ({ page }) => {
    const user = await createUser(page.request, "conv");

    await page.goto("/team/new");
    await page.getByRole("textbox", { name: "E-mail", exact: true }).fill(user.email);
    await page.getByRole("button", { name: "Papel", exact: true }).click();
    await page.getByRole("option", { name: "Comercial" }).click();
    await page.getByRole("button", { name: "Enviar convite" }).click();

    await page.waitForURL("**/invitations");
    await expect(page.getByText(`Convite enviado para ${user.email}`)).toBeVisible();
    await expect(row(page, user.email)).toBeVisible();
    await expect(row(page, user.email).getByText("Pendente")).toBeVisible();
  });

  test("revoga convite e o status vira revogado", async ({ page }) => {
    const user = await createUser(page.request, "revog");
    await invite(page, user.email, "VIEWER");

    await page.goto("/invitations");
    await page.getByPlaceholder("Buscar por e-mail…").fill(user.email);
    await expect(table(page).getByText(user.email)).toBeVisible();

    await page.getByRole("button", { name: `Revogar convite de ${user.email}` }).click();
    await page.getByRole("button", { name: "Revogar", exact: true }).click();
    await expect(page.getByText("Convite revogado")).toBeVisible();
    // Escopado à linha: outros convites revogados coexistem na tabela.
    await expect(row(page, user.email).getByText("Revogado")).toBeVisible();
  });

  test("convite revogado não oferece mais a ação de revogar", async ({ page }) => {
    const user = await createUser(page.request, "norevog");
    await invite(page, user.email, "VIEWER");
    await page.goto("/invitations");
    await page.getByPlaceholder("Buscar por e-mail…").fill(user.email);
    await page.getByRole("button", { name: `Revogar convite de ${user.email}` }).click();
    await page.getByRole("button", { name: "Revogar", exact: true }).click();
    await expect(page.getByText("Convite revogado")).toBeVisible();

    await expect(page.getByRole("button", { name: `Revogar convite de ${user.email}` })).toHaveCount(0);
  });

  test("filtra convites por status derivado", async ({ page }) => {
    const user = await createUser(page.request, "filtro");
    await invite(page, user.email, "VIEWER");

    await page.goto("/invitations");
    await page.getByRole("tab", { name: "Pendentes" }).click();
    await expect(table(page).getByText(user.email)).toBeVisible();

    await page.getByRole("tab", { name: "Aceitos" }).click();
    await expect(table(page).getByText(user.email)).toHaveCount(0);
  });

  test("e-mail que já é membro é recusado com mensagem clara", async ({ page }) => {
    await page.goto("/team/new");
    await page.getByRole("textbox", { name: "E-mail", exact: true }).fill("commercial@foguetao.dev");
    await page.getByRole("button", { name: "Enviar convite" }).click();
    await expect(page.getByText(/já é membro ativo/i)).toBeVisible();
  });

  test("o formulário não oferece o papel OWNER (o backend recusaria)", async ({ page }) => {
    await page.goto("/team/new");
    await page.getByRole("button", { name: "Papel", exact: true }).click();
    await expect(page.getByRole("option", { name: "Owner", exact: true })).toHaveCount(0);
    await expect(page.getByRole("option", { name: "Comercial" })).toBeVisible();
  });

  test("e-mail inválido é barrado no BFF", async ({ page }) => {
    const res = await page.request.post("/api/company/invitations", {
      data: { email: "nao-e-email", role: "VIEWER" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });

  test("convidar como OWNER é recusado pelo backend", async ({ page }) => {
    const res = await page.request.post("/api/company/invitations", {
      data: { email: `owner-try-${Date.now()}@e2e.dev`, role: "OWNER" },
    });
    expect(res.status()).toBe(403);
    expect((await res.json()).code).toBe("OWNER_ROLE_RESTRICTED");
  });
});

test.describe("Aceitar convite", () => {
  test("o convidado aceita e vira membro", async ({ page, browser }) => {
    const context = await browser.newContext({ storageState: EMPTY_STATE });
    const memberPage = await context.newPage();

    const user = await addMember(page, memberPage, "SUPPORT", "aceite");

    // o novo membro aparece na equipe para o owner, com o papel do convite
    await page.goto("/team");
    await page.getByPlaceholder("Buscar por nome ou e-mail…").fill(user.email);
    await expect(row(page, user.email)).toBeVisible();
    await expect(row(page, user.email).getByText("Suporte")).toBeVisible();

    await context.close();
  });

  test("convite revogado é recusado ao aceitar", async ({ page, browser }) => {
    const user = await createUser(page.request, "revog-aceite");
    const token = await invite(page, user.email, "VIEWER");

    // revoga antes do aceite
    const list = await page.request.get(`/api/company/invitations?search=${user.email}`);
    const invitation = (await list.json()).items[0];
    await page.request.delete(`/api/company/invitations/${invitation.id}`);

    const context = await browser.newContext({ storageState: EMPTY_STATE });
    const memberPage = await context.newPage();
    await loginAs(memberPage, user.email);
    await memberPage.goto(`/invitations/accept/${token}`);
    await memberPage.getByRole("button", { name: "Aceitar convite" }).click();
    await expect(memberPage.getByText(/foi revogado/i)).toBeVisible();

    await context.close();
  });

  test("convite de outro e-mail é recusado", async ({ page, browser }) => {
    const invited = await createUser(page.request, "dono");
    const outro = await createUser(page.request, "outro");
    const token = await invite(page, invited.email, "VIEWER");

    const context = await browser.newContext({ storageState: EMPTY_STATE });
    const memberPage = await context.newPage();
    await loginAs(memberPage, outro.email);
    await memberPage.goto(`/invitations/accept/${token}`);
    await memberPage.getByRole("button", { name: "Aceitar convite" }).click();
    await expect(memberPage.getByText(/pertence a outro e-mail/i)).toBeVisible();

    await context.close();
  });

  test("token malformado nem chega ao backend", async ({ page }) => {
    await page.goto("/invitations/accept/token-invalido");
    await expect(page.getByText("Convite inválido.")).toBeVisible();

    const res = await page.request.post("/api/company/invitations/accept", {
      data: { token: "../../etc/passwd" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });
});

test.describe("Gestão de membros (owner)", () => {
  test("altera o papel de um membro", async ({ page, browser }) => {
    const context = await browser.newContext({ storageState: EMPTY_STATE });
    const memberPage = await context.newPage();
    const user = await addMember(page, memberPage, "VIEWER", "papel");
    await context.close();

    await page.goto("/team");
    await page.getByPlaceholder("Buscar por nome ou e-mail…").fill(user.email);
    await table(page).getByText(user.name).click();
    await page.waitForURL(MEMBER_RE);

    await page.getByRole("button", { name: /Atual: Viewer/ }).click();
    await page.getByRole("option", { name: "Manager" }).click();
    await page.getByRole("button", { name: "Alterar papel" }).click();

    await expect(page.getByText("Papel atualizado")).toBeVisible();
    await expect(page.getByText("Manager").first()).toBeVisible();
  });

  test("suspende e reativa um membro", async ({ page, browser }) => {
    const context = await browser.newContext({ storageState: EMPTY_STATE });
    const memberPage = await context.newPage();
    const user = await addMember(page, memberPage, "COMMERCIAL", "susp");
    await context.close();

    await page.goto("/team");
    await page.getByPlaceholder("Buscar por nome ou e-mail…").fill(user.email);
    await table(page).getByText(user.name).click();
    await page.waitForURL(MEMBER_RE);

    await page.getByRole("button", { name: "Suspender" }).click();
    await expect(page.getByText("Membro suspenso")).toBeVisible();
    await expect(page.getByText("Suspenso").first()).toBeVisible();

    await page.getByRole("button", { name: "Reativar" }).click();
    await expect(page.getByText("Membro reativado")).toBeVisible();
    await expect(page.getByText("Ativo").first()).toBeVisible();
  });

  test("remove um membro e ele some da equipe", async ({ page, browser }) => {
    const context = await browser.newContext({ storageState: EMPTY_STATE });
    const memberPage = await context.newPage();
    const user = await addMember(page, memberPage, "SUPPORT", "remov");
    await context.close();

    await page.goto("/team");
    await page.getByPlaceholder("Buscar por nome ou e-mail…").fill(user.email);
    await table(page).getByText(user.name).click();
    await page.waitForURL(MEMBER_RE);

    await page.getByRole("button", { name: "Remover membro" }).click();
    await page.getByRole("button", { name: "Remover", exact: true }).click();

    await page.waitForURL("**/team");
    await expect(page.getByText("Membro removido")).toBeVisible();
    await page.getByPlaceholder("Buscar por nome ou e-mail…").fill(user.email);
    await expect(page.getByText("Nenhum membro encontrado.")).toBeVisible();
  });

  test("não permite alterar o próprio acesso", async ({ page }) => {
    await page.goto("/team");
    await table(page).getByText(OWNER_NAME).click();
    await page.waitForURL(MEMBER_RE);

    await expect(page.getByText(/não pode alterar o seu próprio acesso/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Remover membro" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Suspender" })).toHaveCount(0);
  });
});

test.describe("Último OWNER", () => {
  test("a UI não oferece remover nem suspender o último OWNER", async ({ page }) => {
    await page.goto("/team");
    await table(page).getByText(OWNER_NAME).click();
    await page.waitForURL(MEMBER_RE);

    await expect(page.getByRole("button", { name: "Remover membro" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Suspender" })).toHaveCount(0);
  });

  test("o backend recusa remover o último OWNER (autoridade final)", async ({ page }) => {
    const list = await page.request.get("/api/company/members?role=OWNER&status=ACTIVE");
    const body = await list.json();
    expect(body.total).toBe(1);
    const ownerId = body.items[0].id;

    // Mesmo forçando pelo BFF, o backend protege a continuidade do OWNER.
    // (409 LAST_OWNER_REQUIRED ou 400/403 por auto-alteração — nunca 200.)
    const res = await page.request.delete(`/api/company/members/${ownerId}`);
    expect(res.status()).not.toBe(200);
    expect([400, 403, 409]).toContain(res.status());
  });
});

test.describe("ADMIN não gerencia OWNER", () => {
  test.use({ storageState: EMPTY_STATE });

  test("admin vê o owner mas sem ações", async ({ page, browser }) => {
    // owner cria e promove um admin descartável
    const ownerContext = await browser.newContext({ storageState: OWNER_STATE });
    const ownerPage = await ownerContext.newPage();
    const memberContext = await browser.newContext({ storageState: EMPTY_STATE });
    const memberPage = await memberContext.newPage();

    const admin = await addMember(ownerPage, memberPage, "ADMIN", "admin");
    await ownerContext.close();
    await memberContext.close();

    await loginAs(page, admin.email);
    await page.goto("/team");
    await page.getByPlaceholder("Buscar por nome ou e-mail…").fill("owner@foguetao.dev");
    await table(page).getByText(OWNER_NAME).click();
    await page.waitForURL(MEMBER_RE);

    await expect(page.getByText(/privilégio igual ou superior/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Remover membro" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Suspender" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Alterar papel" })).toHaveCount(0);
  });

  test("o backend recusa admin rebaixando owner", async ({ page, browser }) => {
    const ownerContext = await browser.newContext({ storageState: OWNER_STATE });
    const ownerPage = await ownerContext.newPage();
    const memberContext = await browser.newContext({ storageState: EMPTY_STATE });
    const memberPage = await memberContext.newPage();

    const admin = await addMember(ownerPage, memberPage, "ADMIN", "admin2");
    const owners = await ownerPage.request.get("/api/company/members?role=OWNER&status=ACTIVE");
    const ownerId = (await owners.json()).items[0].id;
    await ownerContext.close();
    await memberContext.close();

    await loginAs(page, admin.email);
    const res = await page.request.patch(`/api/company/members/${ownerId}`, {
      data: { role: "VIEWER" },
    });
    expect(res.status()).toBe(403);
    expect((await res.json()).code).toBe("INSUFFICIENT_ROLE");
  });
});

test.describe("VIEWER somente leitura", () => {
  test.use({ storageState: EMPTY_STATE });

  test("viewer não lê equipe nem convites (sem company.members.read)", async ({ page }) => {
    await loginAs(page, VIEWER.email, VIEWER.password);

    await page.goto("/team");
    await expect(page.getByText(/não tem permissão para ver os membros/i)).toBeVisible();

    await page.goto("/invitations");
    await expect(page.getByText(/não tem permissão para ver os convites/i)).toBeVisible();

    await page.goto("/team/new");
    await expect(page.getByText(/não tem permissão para convidar/i)).toBeVisible();
  });

  test("o backend recusa o viewer listando e convidando", async ({ page }) => {
    await loginAs(page, VIEWER.email, VIEWER.password);

    const list = await page.request.get("/api/company/members");
    expect(list.status()).toBe(403);

    const invited = await page.request.post("/api/company/invitations", {
      data: { email: `viewer-try-${Date.now()}@e2e.dev`, role: "VIEWER" },
    });
    expect(invited.status()).toBe(403);
  });
});

test.describe("Isolamento e integridade", () => {
  test("membro de outra empresa é 404 aqui", async ({ page }) => {
    await page.goto("/team/00000000-0000-4000-8000-000000000000");
    await expect(page.getByText("Membro não encontrado.")).toBeVisible();
  });

  test("id inválido é barrado no BFF, sem chegar ao backend", async ({ page }) => {
    const res = await page.request.get("/api/company/members/usr-1");
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });

  test("filtro inválido é barrado no BFF", async ({ page }) => {
    const res = await page.request.get("/api/company/members?role=GOD");
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });

  test("PATCH não aceita campos fora do contrato", async ({ page }) => {
    const list = await page.request.get("/api/company/members?search=commercial");
    const id = (await list.json()).items[0].id;
    const res = await page.request.patch(`/api/company/members/${id}`, {
      data: { role: "MANAGER", companyId: "00000000-0000-4000-8000-000000000000" },
    });
    expect(res.status()).toBe(400);
  });

  test("os membros do seed continuam intactos (outras suítes dependem deles)", async ({ page }) => {
    const res = await page.request.get("/api/company/members?limit=100");
    const emails = (await res.json()).items.map((m: { user: { email: string } }) => m.user.email);
    for (const seeded of SEED_EMAILS) {
      expect(emails, `${seeded} deve continuar membro ativo`).toContain(seeded);
    }
  });
});
