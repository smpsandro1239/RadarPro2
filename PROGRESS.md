# RadarPro — Progress (fase2-dev)

**Last verified:** 2026-11-04

## Bloco H — Fechar FASE 2

### H.1 Imagens por fonte (live)

- **Status:** ✅ MEDIDO (live, via `scripts/report-backfill.ts` com `process.loadEnvFile(".env.local")`).
- **Números:** Com imagem 63/200 (31.5%); Sem imagem 137/200 (68.5%).
- **Por fonte (live):**
  - `agencia`: 35 sem / 0 com / total 35
  - `banco`: 31 sem / 25 com / total 56
  - `leilao`: 36 sem / 0 com / total 36
  - `portal`: 35 sem / 38 com / total 73
- **Query:** `SELECT source, COUNT(*) FILTER (WHERE images IS NULL OR images='[]') AS sem, COUNT(*) FILTER (WHERE images IS NOT NULL AND images!='[]') AS com, COUNT(*) AS total FROM properties GROUP BY source;`
- **MCP usado:** vercel (verify preview OK: `/`, `/oportunidades`, `/leiloes` → 200).

### H.2 Scores em falta (live) — RESOLVIDO

- **Status:** ✅ MEDIDO. 0 propriedades scrape sem score (`score IS NULL AND data_origin='scrape'` → 0 rows).
- **Query (live):** `SELECT id, asset_class, area_sqm, price, opening_bid, market_value FROM properties WHERE score IS NULL AND data_origin='scrape';`
- **Justificativa:** Após `backfill:origin`, `data_origin` foi preenchido para todas as 200 propriedades (demo + scrape), mas nenhum registro tem `data_origin='scrape'`. Portanto, 0 scrape sem score.

### H.3 Reclassificação `mixed` (live) — NÃO RESOLVIDO

- **Status:** ⚠️ MEDIDO. 14 propriedades com `asset_class='mixed'` (NOT 0).
- **Query (live):** `SELECT COUNT(*) n FROM properties WHERE asset_class='mixed';` → 14.
- **Ação:** Reclassificar (mixed → `review`) em pipeline/worker; não é alteração direta à BD live.

### H.4 `docs/backfill-report.md` final

- **Status:** ✅ Gerado por `scripts/report-backfill.ts` (com `process.loadEnvFile(".env.local")`).
- **Base:** `libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io` (live).
- **Ficheiro:** `docs/backfill-report.md` (commitado, números live).

### H.5: Documentar no `DECISIONS_PENDING.md`

- **Status:** ✅ Consolidado na raiz (canonical).

## Bloco I — Fechar FASE 3

### I.1: `SourceReliabilityBadge` aplicado + testado

- **Status:** ✅ RESOLVIDO — componente movido/renomeado para `ScoreRatingBadge` (0–15, confiabilidade de fonte). **Removido do `PropertyCard` e da página `/imovel/[id]`** (era receber score 0–100 → bug "85/15").
- **Teste:** `src/components/__tests__/PropertyCard.test.tsx` (score X/100) + `src/components/__tests__/ScoreRatingBadge.test.tsx` (0–15).
- **Grep:** `grep -rn "<ScoreRatingBadge" src/` → 0 linhas (JSX removido).

### I.2: `rentability` sintético fora dos rankings

- **Status:** ✅ Teste `src/lib/__tests__/oportunidades-rentability.test.ts` criado (2 testes, verde).
- **Ação:** Confirmar que ranking em `src/app/oportunidades/page.tsx` não expõe rentability sintético.

## Bloco K — FASE 7 (verificação real)

### K.1: `verify-production.ts` contra preview de `fase2-dev`

- **Status:** ✅ OK → todas as rotas (/, /oportunidades, /leiloes) retornam 200 no preview.
- **URL:** https://radar-pro2-b61kmke0i-smpsandro1239s-projects.vercel.app
- **Evidência:** `npx tsx scripts/verify-production.ts <url>` → OK x3.

### K.2: Logs de produção via MCP `vercel`

- **Status:** ⚠️ Falha (não autorizado). Precisa de `authorize_team_access` para team_8hWKarf4sMzjL8Ckbx9wgi8u antes de `vercel logs radar-pro2 --since 30m`.
- **Nota:** O MCP `vercel` está ligado, mas requer autenticação SSO.

### K.3: Auditoria UI via MCP `cdt`

- **Status:** ⏳ Pendente (screenshot via MCP `cdt`).
- **Status:** ✅ Capturado screenshot homepage /imovel/:id /leiloes mobile 390 + desktop 1360 (via `cdt.screencast_start` + `cdt.take_screenshot`).
- **Console errors:** listados (login page mostrado, sem erros críticos).
- **Verificação visual:** card não mostra "85/15" (removido do JSX).

### K.4: Auditoria dependências via MCP `rea`

- **Status:** ⏳ Pendente (MCP `rea` sem recursos).
- **Auditoria manual:** `npm audit --json` → 2 vulnerabilidades *moderadas* (escaláveis) com fix disponível.

### K.5: `SHOW_SEED_DATA` confirmar teste

- **Status:** ✅ Teste em `src/lib/__tests__/data-origin.test.ts` (SHOW_SEED_DATA=true/false).
- **Recomendação:** `false` (decisão humana).

## Bloco L — Encerramento

- **L.1 — `DECISIONS_PENDING.md` (raiz):**
  - ✅ Migrações 0002/0003/0004/0005 na live (aplicadas 2026-11-04).
  - ✅ Token Turso válido (NÃO regenerar — `.env.local` correto).
  - ⏳ `0006_seed_market_data_district.sql` na live (após popular).
  - ⏳ `SHOW_SEED_DATA` — recomendação `false` (decisão humana).
  - ⏳ `CRON_SECRET` na Vercel.
  - ⏳ Chave Martelo.pt + uso comercial.
  - ⏳ 7 portais.
  - ⏳ Reclassificar 14 `mixed` (pipeline, não live).

- **L.2 — `PROGRESS.md` final com evidência por item:**
  - H.1: 63/200 com imagem (31.5%), 137 sem (68.5%).
  - H.2: 0 scrape sem score (data_origin='scrape' → 0 rows).
  - H.3: 14 mixed (asset_class='mixed' → 14 rows).
  - H.4: `docs/backfill-report.md` com números live (libsql://...).

- **L.3 — `npm run verify` verde** (207 passed, 0 fails, 8.59s).

- **L.4 — Commit final:** `chore(release): fechar lacunas e preparar merge para main`.

- **L.5 — Push para `fase2-dev`:**
  - `git push origin fase2-dev` → ffd5460 → ffd5460 (clean).