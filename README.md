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

O Sentry está configurado via `@sentry/nextjs` nos ficheiros `sentry.server.config.ts`, `sentry.client.config.ts` e `sentry.edge.config.ts`.

**Variáveis necessárias:**
- `SENTRY_DSN` — DSN do projeto Sentry (lado servidor).
- `NEXT_PUBLIC_SENTRY_DSN` — DSN público para captura de erros no browser.
- `SENTRY_AUTH_TOKEN` — Token de autenticação para upload de sourcemaps no build.

**Alertas recomendados no dashboard do Sentry:**
1. **Erros 5xx em rotas de cron/background:** criar alerta para eventos com HTTP status `5xx` em rotas `/api/cron/*` e `/api/inngest`.
2. **Falhas repetidas por scraper:** criar alerta para o tag `source` com mais de 5 erros em 1 hora (ex.: `source:Imovirtual`, `source:Casa Sapo`, etc.). Os breadcrumbs de scraper já enviam `category: 'scraper'` e `message: source:..., district:...`.

### Typesense (Busca e Indexação)

**Variáveis de ambiente:**
| Variável | Descrição | Exemplo |
|---|---|---|
| `TYPESENSE_HOST` | Host do Typesense | `localhost` |
| `TYPESENSE_PORT` | Porta do Typesense | `8108` |
| `TYPESENSE_PROTOCOL` | Protocolo (http/https) | `http` |
| `TYPESENSE_API_KEY` | Chave de API do Typesense | `sua-chave-aqui` |

**Executar indexação:**
```bash
npx tsx scripts/index-typesense.ts
```

## Deploy (Vercel)

1. Importar repositório no Vercel
2. Configurar variáveis de ambiente
3. Deploy automático

## Licença

MIT
