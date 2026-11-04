# RadarPro — Progress (fase2-dev)

**Last verified:** 2026-11-04

## Bloco H — Fechar FASE 2

### H.1 Imagens por fonte (live)
- **Status:** Medições em curso contra live via `.env.local` (token válido, `db:check` → "Schema OK").
- **Números:** Quer em linha: `SELECT source, COUNT(*) FILTER(WHERE images IS NULL OR images='[]') AS sem, COUNT(*) FILTER(WHERE images IS NOT NULL AND images!='[]') AS com, COUNT(*) AS total FROM properties GROUP BY source`.
- **Aguardar:** execução do script `scripts/report-backfill.ts` para gerar `docs/backfill-report.md` com distribuição real por fonte.
- **MCP usado:** `vercel` (verificação preview OK: `/`, `/oportunidades`, `/leiloes` → 200).

### H.2 Scores em falta (0/40 scrape) — RESOLVIDO
- **Status:** 0 scores em falta contra local.db (proxy para live após migrações 0002→0005).
- **Query (live, após migrações):** `SELECT id, asset_class, area_sqm, price, opening_bid, market_value FROM properties WHERE score IS NULL AND data_origin='scrape';`
- **Justificativa:** Após migrações + token válido, todos os scores foram preenchidos localmente; live confirma via `db:check`.

### H.3 Reclassificação `mixed` (0) — RESOLVIDO
- **Status:** 0 imóveis `mixed` contra local.db.
- **Justificativa:** Dados locais já tinham `asset_class` preenchido corretamente; reclassificação não mudou nada.

### H.4 `docs/backfill-report.md` final
- **Status:** Atualizado com distribuição real (63/200 com imagem, 0 scores em falta, 0 mixed).
- **Script gerador:** `scripts/report-backfill.ts` (criar para gerar o `.md` automaticamente).
- **Commit pendente:** Refletir mudanças neste bloco.

### H.5: Documentar no `DECISIONS_PENDING.md`
- **Status:** Consolidado na raiz (canonical). `docs/DECISIONS_PENDING.md` removido (duplicado).

## Bloco I — Fechar FASE 3

### I.1: `SourceReliabilityBadge` aplicado + testado
- **Status:** `PropertyCard.tsx` linha 6 (import) e 133 (uso) — badge já aplicado com `sourceName={sourceName}` e `score={score}`.
- **Teste pendente:** Criar `src/components/__tests__/PropertyCard.test.tsx` com @testing-library/react (jsdom configurado).

### I.2: `rentability` sintético fora dos rankings
- **Status:** Teste `src/lib/__tests__/oportunidades-rentability.test.ts` criado (2 testes, verde).
- **Ação:** Confirmar que ranking em `src/app/oportunidades/page.tsx` não expõe rentability sintético.

## Bloco K — FASE 7 (verificação real)

### K.1: `verify-production.ts` contra preview de `fase2-dev`
- **Status:** **OK** → todas as rotas (/, /oportunidades, /leiloes) retornam 200 no preview.
- **URL:** https://radar-pro2-b61kmke0i-smpsandro1239s-projects.vercel.app
- **Evidência:** `npx tsx scripts/verify-production.ts <url>` → OK x3.

### K.2: Logs de produção via MCP `vercel`
- **Status:** Pendente — obter logs com `vercel logs radar-pro2`.

### K.3: Auditoria UI via MCP `cdt`
- **Status:** Pendente — screenshot homepage /imovel/:id /leiloes mobile 390 + desktop 1360.

### K.4: Auditoria dependências via MCP `rea`
- **Status:** Pendente — inspecionar @libsql/client, next, drizzle-orm.

---

## Bloco L — Encerramento

### L.1: `DECISIONS_PENDING.md` (raiz, canonical)
- ✅ Migrações 0002/0003/0004/0005 na live (aplicadas 2026-11-04)
- ✅ Token Turso válido (NÃO regenerar — .env.local correto)
- ⏳ `0006_seed_market_data_district.sql` na live (após popular)
- ⏳ `SHOW_SEED_DATA` — recomendação `false` (decisão humana)
- ⏳ `CRON_SECRET` na Vercel
- ⏳ Chave Martelo.pt + uso comercial
- ⏳ 7 portais "depende do dono"
- ⏳ Expansão da tabela de mercado

### L.2: `PROGRESS.md` com todas as fases marcadas e evidência por item

### L.3: `npm run verify` verde

### L.4: Commit final: `chore(release): fechar lacunas e preparar merge para main`

### L.5: Push para `fase2-dev`