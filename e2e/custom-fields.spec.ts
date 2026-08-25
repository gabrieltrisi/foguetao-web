import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const PASS = "Str0ng!Passw0rd";
const VIEWER = { email: "viewer@foguetao.dev", password: PASS };

/** Prefixo das keys criadas por este spec — usado também na limpeza. */
const PREFIX = "e2e_cf_";

/**
 * Sufixo único por execução. O backend checa duplicidade de `key` SEM filtrar
 * `deletedAt`: uma definição soft-deletada continua reservando a key para
 * sempre. Reaproveitar keys entre execuções daria 409 — então cada run usa as
 * suas.
 */
const RUN = Date.now().toString(36);
const k = (name: string) => `${PREFIX}${RUN}_${name}`;

async function loginAs(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASS);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

/** Remove as definições criadas pelo spec (o backend faz soft delete). */
async function purge(page: Page) {
  for (const entityType of ["CONTACT", "ORGANIZATION"]) {
    const res = await page.request.get(`/api/crm/custom-fields?entityType=${entityType}`);
    if (!res.ok()) continue;
    const defs = (await res.json()) as { id: string; key: string }[];
    for (const d of defs.filter((x) => x.key.startsWith(PREFIX))) {
      await page.request.delete(`/api/crm/custom-fields/${d.id}`);
    }
  }
}

/** Cria uma definição direto pelo BFF (fixture para os testes de valores). */
async function createDef(page: Page, body: Record<string, unknown>) {
  const res = await page.request.post("/api/crm/custom-fields", { data: body });
  expect(res.status()).toBe(201);
  return (await res.json()) as { id: string; key: string };
}

async function firstContactId(page: Page): Promise<string> {
  const res = await page.request.get("/api/crm/contacts?limit=1");
  const body = await res.json();
  return body.items[0].id as string;
}

async function firstOrgId(page: Page): Promise<string> {
  const res = await page.request.get("/api/crm/organizations?limit=1");
  const body = await res.json();
  return body.items[0].id as string;
}

test.describe("Campos personalizados — definições (owner)", () => {
  test.afterEach(async ({ page }) => {
    await purge(page);
  });

  test("lista definições e mostra os controles de gestão", async ({ page }) => {
    await createDef(page, {
      entityType: "CONTACT",
      name: "E2E Segmento",
      key: k("segmento"),
      type: "TEXT",
    });
    await page.goto("/custom-fields");
    await expect(page.getByRole("heading", { level: 1, name: "Campos personalizados" })).toBeVisible();
    await expect(page.getByPlaceholder("Buscar por nome ou key…")).toBeVisible();
    await expect(page.getByRole("button", { name: "Novo campo" })).toBeVisible();
    await expect(page.getByText("E2E Segmento")).toBeVisible();
  });

  test("cria campo para CONTATO pela UI", async ({ page }) => {
    await page.goto("/custom-fields");
    await page.getByRole("button", { name: "Novo campo" }).click();
    const modal = page.getByRole("dialog");
    await modal.getByLabel("Nome").fill("E2E Contato Texto");
    await modal.getByLabel("Key").fill(k("contato_texto"));
    await modal.getByRole("button", { name: "Criar campo" }).click();
    await expect(page.getByText("E2E Contato Texto")).toBeVisible();
  });

  test("cria campo para ORGANIZAÇÃO pela UI", async ({ page }) => {
    await page.goto("/custom-fields");
    await page.getByRole("button", { name: "Novo campo" }).click();
    const modal = page.getByRole("dialog");
    await modal.getByLabel("Nome").fill("E2E Org Texto");
    await modal.getByLabel("Key").fill(k("org_texto"));
    // Combobox dentro de FormField: o nome acessível é o LABEL, não o valor.
    await modal.getByRole("button", { name: "Entidade" }).click();
    await page.getByRole("option", { name: "Organização" }).click();
    await modal.getByRole("button", { name: "Criar campo" }).click();
    await expect(page.getByText("E2E Org Texto")).toBeVisible();
  });

  test("key duplicada é recusada pelo backend (409)", async ({ page }) => {
    await createDef(page, {
      entityType: "CONTACT",
      name: "E2E Dup",
      key: k("dup"),
      type: "TEXT",
    });
    await page.goto("/custom-fields");
    await page.getByRole("button", { name: "Novo campo" }).click();
    const modal = page.getByRole("dialog");
    await modal.getByLabel("Nome").fill("E2E Dup 2");
    await modal.getByLabel("Key").fill(k("dup"));
    await modal.getByRole("button", { name: "Criar campo" }).click();
    await expect(page.getByText(/já existe um campo com essa key/i)).toBeVisible();
  });

  test("edita a definição (a key fica bloqueada)", async ({ page }) => {
    await createDef(page, {
      entityType: "CONTACT",
      name: "E2E Editar",
      key: k("editar"),
      type: "TEXT",
    });
    await page.goto("/custom-fields");
    await page.getByRole("button", { name: "Editar E2E Editar" }).click();
    const modal = page.getByRole("dialog");
    await expect(modal.getByLabel("Key")).toBeDisabled();
    await modal.getByLabel("Nome").fill("E2E Editado");
    await modal.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("E2E Editado")).toBeVisible();
  });

  test("mudar o tipo com valores existentes é recusado (409 TYPE_IMMUTABLE)", async ({ page }) => {
    const def = await createDef(page, {
      entityType: "CONTACT",
      name: "E2E Imutável",
      key: k("imutavel"),
      type: "TEXT",
    });
    const contactId = await firstContactId(page);
    // grava um valor → o tipo passa a ser imutável
    const put = await page.request.put(`/api/crm/contacts/${contactId}/custom-fields`, {
      data: { values: { [def.key]: "algum valor" } },
    });
    expect(put.ok()).toBe(true);

    const res = await page.request.patch(`/api/crm/custom-fields/${def.id}`, {
      data: { type: "NUMBER" },
    });
    expect(res.status()).toBe(409);
    expect((await res.json()).code).toBe("CUSTOM_FIELD_TYPE_IMMUTABLE");

    // limpa o valor para o purge conseguir remover a definição
    await page.request.put(`/api/crm/contacts/${contactId}/custom-fields`, {
      data: { values: { [def.key]: null } },
    });
  });

  test("exclui a definição (soft delete preserva valores)", async ({ page }) => {
    const def = await createDef(page, {
      entityType: "CONTACT",
      name: "E2E Excluir",
      key: k("excluir"),
      type: "TEXT",
    });
    const contactId = await firstContactId(page);
    await page.request.put(`/api/crm/contacts/${contactId}/custom-fields`, {
      data: { values: { [def.key]: "preservado" } },
    });

    await page.goto("/custom-fields");
    await page.getByRole("button", { name: "Excluir E2E Excluir" }).click();
    await page.getByRole("button", { name: "Excluir", exact: true }).click();
    await expect(page.getByText("E2E Excluir")).toHaveCount(0);

    // a definição some da listagem…
    const list = await page.request.get("/api/crm/custom-fields?entityType=CONTACT");
    const defs = (await list.json()) as { id: string }[];
    expect(defs.find((d) => d.id === def.id)).toBeUndefined();
    // …e o detalhe do contato não expõe mais o valor da definição excluída
    const detail = await page.request.get(`/api/crm/contacts/${contactId}`);
    const body = await detail.json();
    expect(body.customFields.find((v: { key: string }) => v.key === def.key)).toBeUndefined();
  });

  test("busca e filtro por entidade/tipo funcionam", async ({ page }) => {
    await createDef(page, {
      entityType: "ORGANIZATION",
      name: "E2E Filtro Org",
      key: k("filtro_org"),
      type: "NUMBER",
    });
    await page.goto("/custom-fields");
    await page.getByPlaceholder("Buscar por nome ou key…").fill("E2E Filtro");
    await expect(page.getByText("E2E Filtro Org")).toBeVisible();

    // filtro de entidade é do servidor (?entityType=)
    await page.getByRole("button", { name: "Todas as entidades", exact: true }).click();
    await page.getByRole("option", { name: "Contato" }).click();
    await expect(page.getByText("E2E Filtro Org")).toHaveCount(0);
  });
});

test.describe("Campos personalizados — valores no CONTATO (owner)", () => {
  test.afterEach(async ({ page }) => {
    await purge(page);
  });

  test("preenche texto, número e opção; e limpa com null", async ({ page }) => {
    const texto = await createDef(page, {
      entityType: "CONTACT",
      name: "E2E Texto",
      key: k("texto"),
      type: "TEXT",
    });
    const numero = await createDef(page, {
      entityType: "CONTACT",
      name: "E2E Numero",
      key: k("numero"),
      type: "NUMBER",
    });
    const selecao = await createDef(page, {
      entityType: "CONTACT",
      name: "E2E Selecao",
      key: k("selecao"),
      type: "SELECT",
      options: ["Alpha", "Beta"],
    });
    const contactId = await firstContactId(page);

    await page.goto(`/contacts/${contactId}`);
    await expect(page.getByRole("heading", { name: "Campos personalizados" })).toBeVisible();
    await page.getByRole("button", { name: "Editar" }).last().click();

    await page.getByLabel("E2E Texto").fill("valor texto");
    await page.getByLabel("E2E Numero").fill("42");
    // idem: o SELECT vive num FormField, então o nome acessível é o do campo.
    await page.getByRole("button", { name: "E2E Selecao" }).click();
    await page.getByRole("option", { name: "Alpha" }).click();
    await page.getByRole("button", { name: "Salvar", exact: true }).click();

    await expect(page.getByText("valor texto")).toBeVisible();
    await expect(page.getByText("42", { exact: true })).toBeVisible();
    await expect(page.getByText("Alpha", { exact: true })).toBeVisible();

    // limpeza com null pelo contrato real
    const clear = await page.request.put(`/api/crm/contacts/${contactId}/custom-fields`, {
      data: { values: { [texto.key]: null, [numero.key]: null, [selecao.key]: null } },
    });
    expect(clear.ok()).toBe(true);
    const detail = await page.request.get(`/api/crm/contacts/${contactId}`);
    const body = await detail.json();
    expect(body.customFields.filter((v: { key: string }) => v.key.startsWith(PREFIX))).toEqual([]);
  });

  test("valor inválido para o tipo é recusado pelo backend (400)", async ({ page }) => {
    const def = await createDef(page, {
      entityType: "CONTACT",
      name: "E2E Email",
      key: k("email"),
      type: "EMAIL",
    });
    const contactId = await firstContactId(page);
    const res = await page.request.put(`/api/crm/contacts/${contactId}/custom-fields`, {
      data: { values: { [def.key]: "nao-e-email" } },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("CUSTOM_FIELD_INVALID_VALUE");
  });

  test("opção inválida é recusada (400 OPTION_INVALID)", async ({ page }) => {
    const def = await createDef(page, {
      entityType: "CONTACT",
      name: "E2E Opcao",
      key: k("opcao"),
      type: "SELECT",
      options: ["A", "B"],
    });
    const contactId = await firstContactId(page);
    const res = await page.request.put(`/api/crm/contacts/${contactId}/custom-fields`, {
      data: { values: { [def.key]: "Z" } },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("CUSTOM_FIELD_OPTION_INVALID");
  });

  test("campo obrigatório sem valor é recusado (400 REQUIRED)", async ({ page }) => {
    const def = await createDef(page, {
      entityType: "CONTACT",
      name: "E2E Obrigatorio",
      key: k("obrigatorio"),
      type: "TEXT",
      required: true,
    });
    const contactId = await firstContactId(page);
    const res = await page.request.put(`/api/crm/contacts/${contactId}/custom-fields`, {
      data: { values: { [def.key]: null } },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("CUSTOM_FIELD_REQUIRED");

    // deixa preenchido para não travar outras gravações neste contato
    await page.request.put(`/api/crm/contacts/${contactId}/custom-fields`, {
      data: { values: { [def.key]: "ok" } },
    });
  });
});

test.describe("Campos personalizados — valores na ORGANIZAÇÃO (owner)", () => {
  test.afterEach(async ({ page }) => {
    await purge(page);
  });

  test("lê e edita valores pelo endpoint próprio da organização", async ({ page }) => {
    const def = await createDef(page, {
      entityType: "ORGANIZATION",
      name: "E2E Setor",
      key: k("setor"),
      type: "TEXT",
    });
    const orgId = await firstOrgId(page);

    await page.goto(`/organizations/${orgId}`);
    await expect(page.getByRole("heading", { name: "Campos personalizados" })).toBeVisible();
    await page.getByRole("button", { name: "Editar" }).last().click();
    await page.getByLabel("E2E Setor").fill("Indústria");
    await page.getByRole("button", { name: "Salvar", exact: true }).click();

    await expect(page.getByText("Indústria")).toBeVisible();

    // o valor é lido pelo endpoint dedicado (não pelo detalhe)
    const read = await page.request.get(`/api/crm/organizations/${orgId}/custom-fields`);
    expect(read.status()).toBe(200);
    expect(await read.json()).toEqual([
      { key: def.key, name: "E2E Setor", type: "TEXT", value: "Indústria" },
    ]);

    await page.request.put(`/api/crm/organizations/${orgId}/custom-fields`, {
      data: { values: { [def.key]: null } },
    });
  });

  test("organização inexistente devolve 404 e id inválido é barrado no BFF", async ({ page }) => {
    const missing = await page.request.get(
      "/api/crm/organizations/00000000-0000-4000-8000-000000000000/custom-fields",
    );
    expect(missing.status()).toBe(404);

    const invalid = await page.request.get("/api/crm/organizations/nao-uuid/custom-fields");
    expect(invalid.status()).toBe(400);
  });
});

test.describe("BFF de campos personalizados", () => {
  test("tipo inexistente (CURRENCY) é barrado no BFF", async ({ page }) => {
    const res = await page.request.post("/api/crm/custom-fields", {
      data: { entityType: "CONTACT", name: "Moeda", key: "moeda_x", type: "CURRENCY" },
    });
    expect(res.status()).toBe(400);
  });

  test("key fora do formato é barrada no BFF", async ({ page }) => {
    const res = await page.request.post("/api/crm/custom-fields", {
      data: { entityType: "CONTACT", name: "X", key: "Chave-Invalida", type: "TEXT" },
    });
    expect(res.status()).toBe(400);
  });

  test("SELECT sem options é barrado no BFF", async ({ page }) => {
    const res = await page.request.post("/api/crm/custom-fields", {
      data: { entityType: "CONTACT", name: "X", key: "sel_x", type: "SELECT" },
    });
    expect(res.status()).toBe(400);
  });

  test("entityType inválido no filtro é barrado com 400", async ({ page }) => {
    const res = await page.request.get("/api/crm/custom-fields?entityType=DEAL");
    expect(res.status()).toBe(400);
  });

  test("fieldId não-UUID é barrado no BFF", async ({ page }) => {
    expect((await page.request.delete("/api/crm/custom-fields/nao-uuid")).status()).toBe(400);
  });
});

test.describe("Campos personalizados — VIEWER somente leitura", () => {
  test.use({ storageState: EMPTY_STATE });

  test("viewer lê a tela mas não vê ações de escrita", async ({ page }) => {
    await loginAs(page, VIEWER.email);
    await page.goto("/custom-fields");

    // VIEWER tem crm.custom_fields.read
    await expect(page.getByRole("heading", { level: 1, name: "Campos personalizados" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Novo campo" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Editar / })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Excluir / })).toHaveCount(0);
  });

  test("o backend recusa o viewer criando definição (403)", async ({ page }) => {
    await loginAs(page, VIEWER.email);
    const res = await page.request.post("/api/crm/custom-fields", {
      data: { entityType: "CONTACT", name: "X", key: "viewer_x", type: "TEXT" },
    });
    expect(res.status()).toBe(403);
  });
});

test.describe("Campos personalizados — responsividade", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("/custom-fields sem overflow horizontal @ 390", async ({ page }) => {
    await page.goto("/custom-fields");
    await expect(page.getByRole("heading", { level: 1, name: "Campos personalizados" })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});
