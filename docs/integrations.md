# Central de Integrações — frontend (Sprint 1.0D-1)

**Nenhuma integração externa é executada.** A Central existe no nível
estrutural: catálogo, configuração interna, ativação/pausa, teste MOCK e logs.

Contrato, flags, catálogo e checklists de adapters: `foguetao-api/docs/architecture/integration-foundation.md`.

## Arquitetura

```
Browser  →  BFF (src/app/api/integrations/**)  →  Backend (/api/v1/integrations/**)
```

O browser nunca fala com o backend direto. Todo handler usa `withCompany()`; o
`x-company-id` só existe no BFF.

| Camada | Arquivo |
|---|---|
| Tipos + Zod (contratos reais) | `src/types/api/integrations.ts` |
| Service (server-only) | `src/lib/api/integrations/service.ts` |
| Client (browser → BFF) | `src/lib/api/integrations/client.ts` |
| Validação de entrada do BFF | `src/lib/api/validation.ts` |
| Query keys + invalidação | `src/lib/query/keys.ts` |
| Hooks | `src/hooks/integrations/use-integrations.ts` |
| Rótulos/erros/formatação | `src/lib/integrations/display.ts` |
| Permissões | `src/lib/auth/permissions.ts` |

## Rotas

| Rota | Tela |
|---|---|
| `/integrations` | catálogo (cards, filtros por categoria/disponibilidade/busca) |
| `/integrations/catalog/[key]` | detalhe do item do catálogo + conexões da empresa |
| `/integrations/connections` | lista de conexões |
| `/integrations/connections/new?provider=KEY` | criar configuração |
| `/integrations/connections/[connectionId]` | detalhe + ações + logs |
| `/integrations/connections/[connectionId]/edit` | editar nome/config pública |

## Dois conceitos que a UI nunca funde

- **Disponibilidade** (`availability`): a integração existe/opera no **produto**
  — `Disponível`, `Em breve`, `Desabilitada`.
- **Status da conexão** (`status`): como está a conexão **desta empresa** —
  `Rascunho`, `Ativa`, `Pausada`, `Degradada`, `Com erro`, `Revogada`.

Badges distintos, vocabulários que não se cruzam (travado em
`src/lib/integrations/__tests__/display.test.ts`).

**"Pausar" = `disconnect`**: o backend não tem `PAUSED`, tem `DISCONNECTED`.
Inventar um status na UI quebraria o contrato.

## Permissões (nomes reais do backend)

`integrations.connections.{read,create,update,delete,test}` e
`integrations.logs.read`.

- **não existe** permissão dedicada a ativar/pausar → o backend exige `update`;
- os logs exigem `integrations.logs.read`, distinta da leitura de conexões — sem
  ela o detalhe mostra um estado explicativo, não um erro;
- a UI esconde o que não é permitido; **não depende de receber 403**;
- `VIEWER` é somente leitura (coberto por e2e).

## Cache

Keys centralizadas em `queryKeys.integrations`; invalidação por
`integrationsInvalidation`. Nada de chave inline.

| Ação | Invalidação |
|---|---|
| criar | só a lista de conexões |
| atualizar | detalhe + lista |
| ativar/pausar | a conexão afetada + lista |
| testar | logs + detalhe + lista (`onSettled` — a **falha** também vira log) |
| excluir | remove o detalhe + invalida a lista |
| catálogo | `staleTime` de 10 min (muda com deploy, não com uso) |

O domínio `integrations` é irmão de `crm`: **nenhuma** invalidação de integração
toca contatos, deals, kanban ou tarefas — há teste provando.

`connect`/`disconnect` devolvem `{success, status}`, **não** a conexão — por isso
invalidamos em vez de escrever a resposta no cache.

## Segurança

- credencial nunca aparece: a API só expõe `credentialsSummary` (contagens/tipos);
- nenhuma tela reexibe segredo salvo; editar substitui, não recupera;
- o BFF rejeita chave secreta na config pública em qualquer convenção de nome
  (`apiKey`, `api_key`, `api-key`, `privateKey`, `token`, …);
- `requireUuid` em todo `connectionId`; `requireCatalogKey` (allowlist `A-Z0-9_`)
  bloqueia path traversal na chave do catálogo;
- enums, paginação e `sortBy` validados por allowlist antes de sair da rede interna;
- `provider`/`category` são imutáveis: o PATCH nem os aceita;
- `companyId` nunca vem do corpo nem da query.

## Testes

- unit: `src/lib/integrations/__tests__/display.test.ts`,
  `src/lib/api/__tests__/integration-validation.test.ts`,
  `src/hooks/integrations/__tests__/use-integrations.test.tsx`;
- e2e (backend real, sem internet): `e2e/integrations.spec.ts` — catálogo,
  filtros, "Em breve", fluxo MOCK completo, logs, não-vazamento de segredo,
  validações do BFF, VIEWER somente leitura e **assert de que nenhuma chamada
  externa sai do browser**.
