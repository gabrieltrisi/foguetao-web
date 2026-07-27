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
