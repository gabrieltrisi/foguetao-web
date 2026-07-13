# Foguetão Web (`foguetao-web`)

Interface web oficial do **Foguetão** — CRM de performance para marketing, vendas e resultado.
Primeira versão visual completa: landing pública, login, AppShell autenticado, dashboard e
placeholders de todas as rotas do produto.

> **Status atual:** bootstrap visual. Toda a camada de dados é **mockada** (`src/mocks`).
> Nenhuma API real é consumida nesta etapa. O backend (`foguetao-api`) vive em outro repositório
> e **não** é tocado aqui.

A referência visual oficial é o arquivo `foguetao-design-reference.pdf`.

---

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript** estrito
- **Tailwind CSS v4** (tokens em `@theme`)
- **shadcn/ui** (padrão de composição) + **Radix UI**
- **Lucide Icons**
- **React Hook Form** + **Zod**
- **next/font** (Sora + Inter)
- **ESLint** + **Prettier**
- **Vitest** + **Testing Library** (unit/componente) e **Playwright** (e2e)

---

## Instalação

```bash
npm install
# navegadores do Playwright (apenas para testes e2e)
npx playwright install chromium
```

## Desenvolvimento

```bash
npm run dev
# http://localhost:3000
```

Acesso de demonstração (mock) na tela de login:

- **E-mail:** `camila@foguetao.com.br`
- **Senha:** `foguetao123`

## Build de produção

```bash
npm run build
npm run start
```

## Qualidade e testes (gates)

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run test        # Vitest (unit/componente)
npm run build       # build de produção (Turbopack)
npm run test:e2e    # Playwright (opcional; sobe next start automaticamente)
npm run format      # Prettier --write
```

Todos os gates (`lint`, `typecheck`, `test`, `build`) passam. O e2e valida carregamento das telas,
ausência de overflow horizontal em 1440×900, 1280×800, 768×1024 e 390×844, colapso da sidebar,
drawer mobile e o fluxo de login mockado, sem erros de console/hidratação.

---

## Estrutura

```
src/
  app/
    (public)/            # rotas públicas
      page.tsx           #   / (landing)
      login/page.tsx     #   /login
    (app)/               # rotas autenticadas (AppShell)
      layout.tsx         #   SidebarProvider + AppShell
      dashboard/page.tsx
      <rota>/page.tsx    #   placeholders (contacts, pipeline, …)
    layout.tsx           # root: fontes, metadata, ToastProvider
    icon.svg, manifest.ts
    globals.css          # tokens do design system (@theme)
  components/
    ui/                  # design system (Button, Input, Card, MetricCard, …)
    layout/              # AppShell, Sidebar, Header, Drawer, menus
    navigation/          # SidebarItem, SidebarSection
    landing/             # seções da landing
    auth/                # login (hero + form)
    dashboard/           # widgets do dashboard
    brand/               # Logo / símbolo (placeholder)
  config/                # site, nav (sidebar), routes (metadados/placeholders)
  hooks/                 # use-sidebar (estado + persistência)
  lib/                   # utils (cn), format (pt-BR), validations (zod)
  mocks/                 # dados mockados centralizados
  types/                 # tipos de domínio
public/brand/            # assets de marca (placeholders)
e2e/                     # specs Playwright
```

## Rotas

Público: `/`, `/login`.

App (todas com AppShell): `/dashboard`, `/agenda`, `/tasks`, `/contacts`, `/organizations`,
`/pipeline`, `/deals`, `/conversations`, `/whatsapp`, `/campaigns`, `/groups` (Em breve),
`/meta-ads`, `/google-ads`, `/affiliates`, `/tracking`, `/automations`, `/integrations`,
`/reports`, `/performance`, `/team`, `/audit`, `/settings`, `/help`.

Interno (fora da sidebar): `/design-system` — showcase vivo de componentes, estados, tokens,
skeletons, empty/error states, toasts e modal.

O mapa completo vive em [`src/config/nav.ts`](src/config/nav.ts). O conteúdo dos placeholders
(título, descrição, empty state e ação) vive em [`src/config/routes.ts`](src/config/routes.ts).

---

## Como integrar com o `foguetao-api` (futuro)

A arquitetura já está preparada para a troca do mock por API real com impacto mínimo:

1. **Camada de dados.** Hoje os componentes leem de `src/mocks/*`. Crie `src/lib/api/` com um
   cliente HTTP e funções tipadas (reaproveitando os tipos de `src/types`). Substitua os imports
   de `@/mocks/...` por chamadas assíncronas.
2. **Server Components / data fetching.** As páginas do grupo `(app)` são Server Components — mova a
   busca de dados para elas (ou adote React Query, fora do escopo desta etapa).
3. **Autenticação.** O login hoje valida credenciais mockadas e redireciona no cliente. Troque
   `onSubmit` em [`login-form.tsx`](src/components/auth/login-form.tsx) por uma chamada real, defina
   sessão via cookies httpOnly e proteja o grupo `(app)` com middleware/`proxy`.
4. **Seletor de empresa e usuário.** `src/mocks/account.ts` centraliza usuário e workspaces; troque
   por dados da sessão.

Consulte [`docs/frontend-architecture.md`](docs/frontend-architecture.md) e
[`docs/design-system.md`](docs/design-system.md) para detalhes.

## Assets de marca

A interface usa os **assets oficiais** do Foguetão, em `public/brand/`:

| Arquivo | Uso |
|---|---|
| `logo-horizontal.svg` | Landing, Navbar e Footer |
| `logo-sidebar.png` | Sidebar expandida e drawer mobile |
| `logo-mono.png` | Login (painel vermelho), renderizado em branco |
| `symbol.png` | Sidebar recolhida e preview |
| `app-icon.png` | App icon (`src/app/apple-icon.png`) e manifest |
| `favicon.svg` · `favicon-16.png` · `favicon-128.png` | Favicon (`src/app/icon.png` = 128px) |
| `logo-vertical.svg` | Disponível (não usado na UI atual) |

O componente [`Logo`](src/components/brand/logo.tsx) referencia esses arquivos via `next/image`.
A cor da marca (`#E0070F` / `#8A0509`) segue o `foguetao-brand-guide.pdf` e já está nos tokens.
