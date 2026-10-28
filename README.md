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

## Deploy (Vercel)

1. Importar repositório no Vercel
2. Configurar variáveis de ambiente
3. Deploy automático

## Licença

MIT
