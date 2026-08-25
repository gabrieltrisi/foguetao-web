# Design System — Foguetão

Fonte da verdade: `foguetao-design-reference.pdf` (v1.0). Todos os tokens abaixo estão
implementados em [`src/app/globals.css`](../src/app/globals.css) via `@theme` do Tailwind v4 e
consumidos como utilitários (`bg-brand`, `text-ink`, `text-h1`, `rounded-lg`, etc.).

## Cores

| Token | Hex | Utilitário | Uso |
|---|---|---|---|
| Brand | `#E0070F` | `brand` | CTA principal, links, acentos, item ativo |
| Brand Dark | `#8A0509` | `brand-dark` | Hover de CTAs, estados pressionados |
| Brand Soft | `#FDECEC` | `brand-soft` | Fundos de destaque, itens ativos suaves |
| Ink | `#17171A` | `ink` | Texto principal, títulos |
| Ink 2 | `#66666D` | `ink-2` | Texto secundário, labels |
| Ink 3 | `#929298` | `ink-3` | Texto terciário, placeholders |
| Surface | `#F7F7F8` | `surface` | Fundo da aplicação |
| Line | `#E6E6E8` | `line` | Bordas, divisores |
| Success | `#16A34A` | `success` | Confirmações, tendências positivas |
| Warning | `#D97706` | `warning` | Atenção, prioridade média |
| Danger | `#DC2626` | `danger` | Erros, prioridade alta |
| Info | `#2563EB` | `info` | Informativos, links neutros |
| White | `#FFFFFF` | `white` | — |

> **Nota:** `Brand` (CTA) e `Danger` (erros) são vermelhos distintos e intencionalmente separados.

## Tipografia

- **Sora** (`font-display`): títulos, métricas, botões, elementos de destaque.
- **Inter** (`font-sans`): corpo, formulários, tabelas, labels.
- Fallback: `system-ui`.
- Pesos: 400 (regular), 600 (semibold), 700 (bold).

Escala (utilitário → tamanho / line-height):

| Utilitário | Tamanho | Line-height |
|---|---|---|
| `text-display` | 32px | 40px |
| `text-h1` | 22px | 28px |
| `text-h2` | 18px | 26px |
| `text-h3` | 14px | 20px |
| `text-body` | 14px | 22px |
| `text-body2` | 13px | 20px |
| `text-small` | 12px | 18px |
| `text-caption` | 11px | 16px |
| `text-micro` | 10px | 14px |

> Os tokens de tamanho de texto são registrados no `tailwind-merge`
> ([`src/lib/utils.ts`](../src/lib/utils.ts)) para não conflitarem com utilitários de cor de texto.

## Espaçamento

Escala base **4px** (Tailwind: `p-1`=4 … `p-16`=64): `4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64`.

## Raios

Raio padrão da plataforma: **10px** (`rounded-lg`).

| `sm` | `md` | `lg` | `xl` | `2xl` | `3xl` | `full` |
|---|---|---|---|---|---|---|
| 6px | 8px | 10px | 12px | 16px | 24px | 9999px |

## Sombras (discretas)

Cards dependem de **borda** (`border-line`), não de sombra.

- `shadow-sm` — cards e inputs.
- `shadow-md` — tooltips.
- `shadow-lg` — apenas elementos flutuantes (dropdowns, drawer, toasts).

## Componentes

Localização: [`src/components/ui`](../src/components/ui),
[`src/components/navigation`](../src/components/navigation),
[`src/components/layout`](../src/components/layout).

`Button` (primary/secondary/ghost/danger/outlineBrand · sm/md/lg/icon · loading), `Input`,
`PasswordInput`, `Checkbox`, `Select`, `Label`, `Badge`, `Pill`, `StatusBadge`/`PriorityBadge`,
`TrendIndicator`, `Card`, `MetricCard`, `PageHeader`, `SectionHeader`, `EmptyState`, `Skeleton`,
`Tooltip`, `DropdownMenu`, `Avatar`, `Breadcrumb`, `SearchInput`, `PeriodFilter`, `Toast`,
`SidebarItem`, `SidebarSection`, `MobileDrawer`, `Sidebar`, `AppHeader`, `AppShell`.

### Botões

| Variante | Fundo | Texto | Hover |
|---|---|---|---|
| primary | `#E0070F` | branco | `#8A0509` |
| secondary | branco | `#17171A` (borda `#E6E6E8`) | `surface` |
| ghost | transparente | `#17171A` | `surface` |
| danger | `#DC2626` | branco | `#DC2626`/90 |

### Estados suportados

`default`, `hover`, `focus` (anel `brand`), `disabled`, `loading`, `error` (`aria-invalid`),
`success`, `active`. Foco visível global via `:focus-visible` e respeito a
`prefers-reduced-motion`.
