# RadarPro Portugal

Plataforma de deteção de oportunidades imobiliárias abaixo do preço de mercado em Portugal (Lisboa, Porto, Braga).

## Stack

- **Framework:** Next.js 16 (App Router)
- **Base de dados:** Turso (libSQL) + Drizzle ORM
- **Autenticação:** JWT (jose) + bcryptjs
- **Pagamentos:** Stripe
- **Estilização:** Tailwind CSS v4
- **Deploy:** Vercel

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local
# Preencher variáveis de ambiente
npm run dev
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `TURSO_DATABASE_URL` | URL da base de dados Turso |
| `TURSO_AUTH_TOKEN` | Token de autenticação Turso |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe |
| `STRIPE_WEBHOOK_SECRET` | Segredo do webhook Stripe |
| `JWT_SECRET` | Segredo para JWT |
| `NEXT_PUBLIC_APP_URL` | URL da aplicação |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN público do Sentry (cliente/browser) |
| `SENTRY_DSN` | DSN do Sentry (servidor) |
| `SENTRY_AUTH_TOKEN` | Token de autenticação do Sentry (uploads de sourcemaps) |

### Sentry (Monitoramento de Erros)

O Sentry está configurado via `@sentry/nextjs` nos ficheiros `src/sentry.server.ts`, `src/sentry.client.ts` e `src/app/layout.tsx`.

**Variáveis necessárias:**
- `SENTRY_DSN` — DSN do projeto Sentry (lado servidor).
- `NEXT_PUBLIC_SENTRY_DSN` — DSN público para captura de erros no browser.
- `SENTRY_AUTH_TOKEN` — Token de autenticação para upload de sourcemaps no build.

**Alertas recomendados no dashboard do Sentry:**
1. **Erros 5xx em rotas de cron/background:** criar alerta para eventos com HTTP status `5xx` em rotas `/api/cron/*` e `/api/inngest`.
2. **Falhas repetidas por scraper:** criar alerta para o tag `source` com mais de 5 erros em 1 hora (ex.: `source:Imovirtual`, `source:Casa Sapo`, etc.). Os breadcrumbs de scraper já enviam `category: 'scraper'` e `message: source:..., district:...`.

### Typesense (Busca e Indexação) — opcional

O RadarPro funciona em **três modos de busca**, determinados automaticamente pelas env vars. O Turso é sempre a fonte de verdade.

| Modo | Quando ativa | Comportamento | Latência (201 imóveis) |
|------|--------------|---------------|------------------------|
| **db-primary** (default) | `.env` sem `TYPESENSE_HOST`/`TYPESENSE_API_KEY` | Busca direta em Turso. Funciona sempre. | ~200–300ms |
| **typesense** | `.env` com `TYPESENSE_HOST` + `TYPESENSE_API_KEY` válidos | Busca facetada via Typesense. | <50ms |
| **db-fallback** | `.env` com `TYPESENSE_*` mas servidor offline | Tenta Typesense → cai para Turso automaticamente. | ~200–500ms |

**Nunca é obrigatório provisionar Typesense.** O site funciona em `db-primary` desde o primeiro deploy. O Typesense é um acelerador opcional.

#### Variáveis de ambiente para Typesense

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `TYPESENSE_HOST` | Host do Typesense | `localhost` |
| `TYPESENSE_PORT` | Porta do Typesense | `8108` |
| `TYPESENSE_PROTOCOL` | Protocolo (http/https) | `http` |
| `TYPESENSE_API_KEY` | Chave de API do Typesense | `sua-chave-aqui` |

#### Como ativar Typesense (opcional)

1. Subir Typesense (self-hosted no Railway/Docker ou Typesense Cloud).
2. Adicionar ao `.env.local`:
   ```
   TYPESENSE_HOST=seu-host
   TYPESENSE_PORT=8108
   TYPESENSE_PROTOCOL=http
   TYPESENSE_API_KEY=sua-chave
   ```
3. Correr `npx tsx --env-file=.env.local scripts/index-typesense.ts`.
4. Redeploy. A busca passa automaticamente para o modo `typesense`.

#### Verificar o modo ativo

```bash
npx tsx --env-file=.env.local scripts/check-search-mode.ts
```

#### Executar indexação manual (apenas se Typesense estiver ativo)

```bash
npx tsx --env-file=.env.local scripts/index-typesense.ts
```

Se Typesense não estiver configurado, o script sai com código 0 e mensagem informativa — nada é quebrado.

### Diagnóstico de saúde

```bash
npx tsx --env-file=.env.local scripts/check-search-mode.ts
```
Imprime o modo de busca ativo e se as env vars estão presentes.

## Deploy (Vercel)

1. Importar repositório no Vercel
2. Configurar variáveis de ambiente (Turso, Stripe, Sentry, opcionalmente Typesense)
3. Deploy automático

## Licença

MIT

---

## ⚠️ Sentry — não configurado em produção

O SDK está inicializado, mas `SENTRY_DSN` e `NEXT_PUBLIC_SENTRY_DSN` **não estão definidos nas env vars da Vercel**. Consequência: erros em produção **não são reportados**. Os breadcrumbs dos 14 scrapers e o `captureException` existem no código mas ficam em código morto até o DSN ser configurado.

Para ativar:
1. Criar projeto Next.js no dashboard Sentry.
2. Copiar o DSN.
3. Adicionar `SENTRY_DSN` e `NEXT_PUBLIC_SENTRY_DSN` na Vercel (Production + Preview).
4. Configurar `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` para upload de source maps.
5. Redeploy.

---

## Benchmarks

Executar `npx tsx scripts/benchmark.ts` para atualizar esta tabela. Enquanto os valores forem "por medir", as metas são aspiração, não facto.

| Métrica | db-primary | typesense | db-fallback | Meta |
|---------|------------|-----------|-------------|------|
| Busca p50 | por medir | n/a | por medir | <200ms |
| Busca p95 | por medir | n/a | por medir | <500ms |
| LCP homepage | por medir | — | — | <2.5s |
| LCP detalhe | por medir | — | — | <2.5s |
| CLS | por medir | — | — | <0.1 |
| INP | por medir | — | — | <200ms |
| Lighthouse Performance | por medir | — | — | ≥90 |
| Lighthouse Accessibility | por medir | — | — | ≥95 |

---

## Limitações conhecidas

### PPR adiado para v2.0

`cacheComponents: true` foi removido de `next.config.ts` porque quebrava rotas dinâmicas. PPR fica adiado para v2.0. **Sem PPR, o LCP em mobile pode exceder 2.5s.**

Plano de reativação:
1. `cacheComponents: true` em `next.config.ts`.
2. `'use cache'` + `cacheTag('property-{id}')` + `cacheLife('hours')` em `getPropertyById`.
3. `<Suspense>` com skeleton em todos os componentes dinâmicos (preço, score, `max_bid`, facets).
4. `revalidateTag('property-{id}')` no passo `index-new-properties` do Inngest.
5. Converter por ordem: `/` → `/imovel/[id]` → `/oportunidades`.

### Sentry sem DSN

Ver secção "⚠️ Sentry — não configurado em produção" acima. Erros em produção não são reportados até o DSN ser adicionado.

---

## Motor de avaliação — análise de mercado por tipo de ativo

O RadarPro avalia cada imóvel com um motor específico para a sua classe de ativo e modalidade. Nenhum imóvel é avaliado sem primeiro ser classificado em duas dimensões independentes:

| Dimensão | Valores |
|---|---|
| **Tipo de ativo** (`asset_class`) | `apartment`, `house`, `urban_land`, `rural_land`, `commercial`, `garage`, `mixed` |
| **Modalidade** (`listing_type`) | `fixed_price`, `auction_judicial`, `auction_private`, `auction_fiscal` |

### Motores de avaliação (`src/lib/valuation/`)

| Motor | Para | Base |
|---|---|---|
| `hedonic` | apartamento, moradia | Mediana €/m² da freguesia + ajustamentos (tipologia, andar, orientação, estado, cert. energética, garagem, elevador, vista) |
| `land_urban` | terreno urbano | €/m² de lote urbanizável + PDM + infraestrutura + topografia + frente de estrada |
| `land_rural` | terreno rústico | Método do rendimento (renda agro-florestal ÷ taxa de capitalização) |
| `income` | comercial | €/m² comercial + yield |
| `auction` | leilão | Lance máximo sustentável (`max_bid`) com custos da leiloeira + IMT + Selo |

### Cortes de score (regras obrigatórias)

| Condição | Score máximo |
|---|---|
| `valuation_confidence = 'very_low'` | 40 |
| Terreno urbano com `pdm_status` = `non_buildable` ou `unknown` | 40 |
| Terreno rural sem rendimento demonstrável | 30 |
| Leilão com `current_bid >= max_bid` | 30 (badge vermelho "Acima do lance máximo") |

### Pesos do score por tipo de ativo

| Dimensão | Apartment | Urban land | Rural land | Auction |
|---|---:|---:|---:|---:|
| Desconto vs AVM | 30% | 25% | 20% | 30% |
| Preço/m² vs mediana | 25% | 30% | 35% | 20% |
| Yield / rendimento | 20% | 10% | 25% | 20% |
| Liquidez | 15% | 20% | 10% | 15% |
| Confiança / risco | 10% | 15% | 10% | 15% |

### Leilões separados do preço fixo

Leilões e preço fixo **não aparecem no mesmo ranking**. O search route aceita o filtro `listing_type` e as páginas de listagem têm dois separadores: "Preço fixo" e "Leilões". No separador de leilões, a ordenação é por margem (`max_bid - current_bid DESC`), não por desconto bruto. No card de leilão é mostrado `current_bid`, `max_bid` e a margem em €.

### Dados de mercado (`src/lib/market-data.ts`)

Tabela de medianas €/m² por freguesia/concelho com fonte (INE / Confidencial Imobiliário) e data de referência. Ordem de preferência: paróquia > concelho > distrito. Valores são referência, não a base única do AVM.
