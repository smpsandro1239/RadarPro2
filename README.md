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
