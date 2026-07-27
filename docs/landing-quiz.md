# Landing — Quiz Inteligente (Sprint LP1)

Diagnóstico comercial premium no hero da landing. Substitui e unifica o antigo
seletor de segmento: a Pergunta 1 alimenta o motor de segmentos existente, gera
um score/diagnóstico personalizado, captura o lead e o envia ao CRM por um seam
desligado por padrão. Carregado sob demanda — sem impacto no LCP.

## Fluxo

```
Hero (gatilho "Descobrir meu plano em 60s")
  → Overlay fullscreen (lazy, ssr:false)
    → 6 perguntas (uma por tela, com voltar + progresso + progresso salvo)
      → Análise "Estamos analisando sua operação…" (2–3s; 0,6s em reduced-motion)
        → Resultado (score + maturidade + gargalos + potencial + recursos + plano + próximos passos)
          → Captura do lead (Nome, Email, WhatsApp, Empresa)
            → POST /api/landing/quiz-lead (seam CRM)
              → Sucesso (CTA /register?segment=…)
```

Ao gerar o diagnóstico, o segmento escolhido é persistido (`persistSegment`); ao
fechar o overlay, a landing por trás é personalizada (`router.replace(?segment=)`).

## Arquitetura

`src/features/landing/quiz/` — dados puros e serializáveis separados da UI:

| Pasta | Conteúdo |
|---|---|
| `types/` | Contratos (`QuizAnswers`, `Diagnosis`, `QuizLeadPayload`, …) |
| `constants/` | `questions.ts` (as 6 perguntas + mapa segmento→SegmentId), `storage.ts` |
| `config/` | `weights.ts` (pesos do score), `diagnosis.ts` (cópia por dor/objetivo/segmento) |
| `utils/` | `score.ts`, `diagnosis.ts` (PUROS), `validation.ts` (zod), `persistence.ts`, `utm.ts` |
| `analytics/` | `events.ts`, `track.ts` (dispatcher pluggable) |
| `hooks/` | `useQuizMachine.ts` (máquina de estados), `useQuizAnalytics.ts`, `useFocusTrap.ts` |
| `view-models/` | `useDiagnosisViewModel.ts` (dados prontos de apresentação) |
| `components/` | `QuizEntry` (gatilho + lazy), `QuizOverlay` (shell), telas e primitivos |

Barrel público (`index.ts`) exporta **apenas** `QuizEntry`. O hero
(`components/site/landing/hero.tsx`) o renderiza no lugar do antigo
`SegmentSelector` (mantido no repo como fallback removível).

Reaproveita da landing: `getLandingContent`/`SEGMENTS`/`normalizeSegmentId`
(`config/landing/segments`), `persistSegment`/`withSegment` (`lib/landing/segment`),
`route()` (`lib/api/route-helpers`), `ApiError` (`types/api/error`), e as chaves de
ícone dos benefícios (`BenefitIconKey`).

## Perguntas & Branching

| # | Pergunta | Papel |
|---|---|---|
| 1 | Segmento | Personalização (→ SegmentId) |
| 2 | Maior dificuldade (dor) | Gargalo primário + penalidade |
| 3 | Quantas pessoas vendem | Porte (score + plano) |
| 4 | Leads/mês | Volume (score + plano + descompasso) |
| 5 | Controle atual | Sinal dominante de maturidade |
| 6 | Objetivo | Clareza da meta (score) |

Mapa segmento do quiz → `SegmentId` (`constants/questions.ts`):

| Quiz | SegmentId |
|---|---|
| Consultoria | `prestador-servico` |
| Agência | `agencia` |
| Academia | `academia` |
| Imobiliária | `imobiliaria` |
| Clínica | `clinica` |
| E-commerce | `loja` |
| Infoproduto | `outro` |
| Outro | `outro` |

## Algoritmo de Score (`utils/score.ts`, puro)

```
score = clamp( control(Q5) + scale(Q3+Q4) + goalClarity(Q6) − painPenalty(Q2), 0, 100 )
```

| Parcela | Faixa | Pesos (`config/weights.ts`) |
|---|---|---|
| control | 0–45 | memória 6 · whatsapp 22 · outro 26 · planilha 32 · notion 36 · crm 45 |
| scale | 0–25 | time (solo 3 … grande 14) + leads (poucos 3 … muito_alto 11) |
| goalClarity | 0–15 | indicadores 15 · escalar 13 · automatizar 11 · organização 9 · vendas 8 |
| painPenalty | 0–14 | organização 14 · follow-up 12 · whatsapp 10 · conversão 8 · equipe 7 · automação 4 |

**Maturidade**: 0–20 Muito baixa · 21–40 Baixa · 41–60 Média · 61–80 Alta · 81–100 Excelente.

**Propriedade garantida por teste**: monotonicidade no controle (mantidas as demais
respostas, melhor controle ⇒ score maior). O algoritmo é determinístico.

**Potencial de melhoria**: `clamp(round((100−score)·0,8)+8, 12, 88)`.

## Diagnóstico (`utils/diagnosis.ts`, puro)

- **Gargalos** (até 3): dor primária → fraqueza do controle informal → descompasso
  de volume (leads altos + controle informal).
- **Prioridades** (até 3): dor → controle → meta.
- **Recursos recomendados** (até 4): dor (2) + meta (1), sem repetição de título.
- **Plano**: `grande`/`muito_alto` → Escala; `media`/`alto` → Pro; senão Essencial.
- **Próximos passos** (3): importar base + configurar funil (**etapas reais do
  segmento** via `getLandingContent(id).pipeline.stages`) + ação da dor.
- **Headline/prova**: personalizadas por segmento (`config/diagnosis.ts`), com
  fallback no default.

## Integração CRM (seam web-only)

`POST /api/landing/quiz-lead` valida o payload (`quizLeadPayloadSchema`) e delega a
`captureQuizLead` (`src/lib/landing/lead-capture.ts`). Nunca vaza erro de entrega
ao cliente.

- **Desligado (padrão)**: sem env → registra o lead (sem PII em produção) e retorna
  `{ ok: true, delivered: false }`. A experiência conclui normalmente.
- **Ligado**: com `LANDING_LEAD_CAPTURE_URL` + `LANDING_LEAD_CAPTURE_KEY`, faz
  `POST` ao backend com header `x-landing-key`. Payload espelha o `CreateContactDto`:

```jsonc
{
  "firstName": "…", "lastName": "…", "email": "…",
  "phone": "…", "whatsappPhone": "…",
  "status": "LEAD", "source": "LANDING_PAGE", "sourceDetail": "landing_quiz",
  "metadata": {
    "origin": "landing_quiz", "segment": "…", "segmentLabel": "…",
    "dor": "…", "equipe": "…", "leads": "…", "controle": "…", "objetivo": "…",
    "score": 0, "maturity": "media", "plano": "…", "empresa": "…",
    "utm": { "utm_source": "…" }, "referrer": "…", "ts": "ISO"
  }
}
```

### Variáveis de ambiente

| Var | Descrição |
|---|---|
| `LANDING_LEAD_CAPTURE_URL` | URL do endpoint público de captação no backend |
| `LANDING_LEAD_CAPTURE_KEY` | Segredo enviado em `x-landing-key` |

### TODO backend (fora do escopo desta sprint)

Criar no `foguetao-api` um endpoint público de intake (não existe hoje), espelhando
os padrões já presentes (`auth/activate` com `x-admin-key` + `PublicWebhooksController`):

- `@Public() POST /api/v1/public/landing-lead`, header `x-landing-key` conferido
  contra config.
- Resolver a empresa destino via `LANDING_LEAD_COMPANY_ID` (env do backend) e
  chamar `ContactsService.create` com o payload acima.
- `source: "LANDING_PAGE"` já é enum válido; `origin=landing_quiz` vai em
  `sourceDetail`/`metadata` (não é valor de enum de `source`).

## Analytics

`analytics/track.ts` → `navigator.sendBeacon('/api/landing/analytics', …)`
(best-effort, com fallback em `fetch(keepalive)` e `console.debug` em dev). O route
handler loga em dev e responde 204 em produção. **Sem script de terceiros** —
pluggable para GA4/PostHog/Plausible depois (trocar só o adapter).

Eventos: `quiz_started`, `question_viewed`, `question_answered`, `quiz_abandoned`,
`diagnosis_viewed`, `lead_created`, `quiz_finished`.

## Performance

`QuizEntry` é uma ilha client leve no hero. `QuizOverlay` (+ telas e framer-motion)
é carregado via `next/dynamic(…, { ssr: false })` **só ao abrir** — fora do bundle
inicial. O hero permanece server component; LCP intacto.

## Acessibilidade

`role="dialog"` + `aria-modal`, focus-trap (`useFocusTrap`), Escape fecha, foco
retorna ao gatilho, grupos rotulados por pergunta, alvos de toque ≥ 44px,
`prefers-reduced-motion` respeitado (análise curta, animações estáticas).

## Testes

`npm test`. Cobertura: score (fronteiras + monotonicidade), diagnóstico
(mapeamento, gargalos, plano, próximos passos, personalização), validação,
persistência, utm, seam de lead (ligado/desligado), máquina do quiz (fluxo,
voltar, progresso, abandono, submissão/erro) e componentes (OptionCard,
QuizOverlay ponta a ponta, QuizEntry lazy, NavMobile).

---

# LP2 — Conversão & UX

Camada de conversão/percepção premium **aditiva** sobre a LP1 (overlay, máquina,
score, seam e analytics permanecem intactos).

## Auditoria de conversão

A landing já era sólida (copy honesta, headings/SEO corretos, motion único). Os
atritos reais e as alavancas atacadas:

| Achado | Ação LP2 |
|---|---|
| Quiz (maior conversor) só no hero | Hierarquia de CTA que repete o quiz em pontos de alta intenção |
| Sem prova social | Nova seção **Prova** por segmento (demonstração rotulada) |
| Mock estático | Mock **"ao vivo"** (KPIs contando, barras crescendo, pulso) |
| Comparativo denso | Redesenho visual Planilha × WhatsApp × Foguetão (leitura rápida) |
| Diagnóstico "corrido" | Diagnóstico como **relatório de cards** |
| `loja`/`prestador` genéricos | `benefits` próprios + `proof` bespoke |

## Hierarquia de CTA (leva ao quiz)

- **Primário** (sólido, marca): "Começar agora" → `/register` (hero, nav, CTA final).
- **Secundário** (ghost): Quiz "Descobrir meu plano em 60s" (hero + CTA final).
- **Contextual** (sólido): `QuizCtaStrip` após o Comparativo — "Fazer meu diagnóstico".

Implementação **aditiva**: `QuizProvider` (client) envolve o conteúdo em
`page.tsx` e é dono de UM overlay lazy compartilhado + da aplicação do segmento ao
fechar; `QuizTrigger` (variantes `hero`/`cta`/`strip`) abre via `useQuiz()`.
`QuizEntry` virou wrapper fino. Nada do overlay/máquina/score da LP1 mudou.

## Personalização por segmento (estratégia)

Cada nicho já entrega hero, benefits, pipeline, faqExtra, mock CRM e finalCta
próprios. LP2 adiciona:
- `SegmentContent.proof` (`ProofStat[]` + `ProofTestimonial`, `demo: boolean`):
  8 nichos com prova bespoke (semeada dos flavors do quiz); `default`/`outro`
  honestos genéricos. **`demo: true` até haver dados reais** — trocar é só editar
  o config (`config/landing/segments/*.ts`).
- `benefits` próprios para `loja` e `prestador-servico` (fecha a lacuna).

Trocar `?segment=` agora personaliza hero + benefits + mock + **prova** + finalCta.

## Mock "ao vivo" (`product-ui-live.tsx`)

`LiveNumber` (count-up), `LiveBar` (cresce 0→pct) e `LiveDot` (pulso). Regras:
anima **só on-view** (`useInView`, once), `transform`/`width` contidos (**zero
CLS**), DOM já com o **valor final** (SSR/no-JS/leitor de tela leem o real) e
**desliga em `prefers-reduced-motion`**. O hero pinta estático primeiro → **LCP
preservado**.

## Diagnóstico como relatório (`ResultScreen.tsx`)

Faixa de KPIs (Score / Maturidade / Potencial) + grade de cards (gargalos,
prioridades, recursos, plano, próximos passos), com stagger discreto
(reduced-safe). Só apresentação — `buildDiagnosis` inalterado.

## Prova social (`proof.tsx` + `demo-badge.tsx`)

Stats + depoimento por segmento em `<figure>/<blockquote>/<figcaption>`, com selo
**"Demonstração"** (`DemoBadge`, neutro, com texto — não só cor). Nunca finge
cliente real. Renderizada entre Produto e Benefícios.

## A11y / Performance / SEO (LP2)

- Todas as novas animações desligam em `prefers-reduced-motion`; números animados
  têm o valor final no DOM (leitor de tela lê o real); marcas do comparativo com
  `sr-only`; foco visível nos novos gatilhos.
- Quiz continua **lazy** (sem regressão de bundle/LCP); animações `transform`/`width`
  + rAF on-view; prova server-rendered; sem dependências novas.
- h1 único mantido; Prova usa `h2`/`h3` + `<figure>`; sem novas imagens
  (avatares por iniciais); meta/canonical/OG/JSON-LD inalterados.
