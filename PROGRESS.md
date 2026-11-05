# RadarPro — Progress (fase2-dev)

**Last verified:** 2026-11-05

## Bloco H — Fechar FASE 2

### H.1 Imagens por fonte (live) — ✅ MEDIDO

- **Com imagem:** 63/200 (31.5%). **Sem imagem:** 137/200 (68.5%).
- **Por fonte:**
  - `agencia`: 35 sem / 0 com / 35 total
  - `banco`: 31 sem / 25 com / 56 total
  - `leilao`: 36 sem / 0 com / 36 total
  - `portal`: 35 sem / 38 com / 73 total
- **Query:** `SELECT source, COUNT(*) FILTER (WHERE images IS NULL OR images='[]') AS sem, COUNT(*) FILTER (WHERE images IS NOT NULL AND images!='[]') AS com, COUNT(*) AS total FROM properties GROUP BY source;`

### H.2 Scores em falta — N/A

- **Status:** N/A. Live tem 0 propriedades scrape (`data_origin='demo'` em 200/200).
- **Query:** `SELECT COUNT(*) FROM properties WHERE score IS NULL AND data_origin='scrape';` → **0**.
- **Interpretação:** o 0 é por ausência de scrapes, não por estarem todos avaliados.
- **Bloqueador de produto:** ver `DECISIONS_PENDING.md` §11.

### H.3 Reclassificação `mixed` — ⚠️ MEDIDO, PENDENTE

- **Status:** 14 propriedades com `asset_class='mixed'` (sobre 200 demo).
- **Query:** `SELECT COUNT(*) FROM properties WHERE asset_class='mixed';` → **14**.
- **Ação:** reclassificar no pipeline (não é alteração live). Registado em `DECISIONS_PENDING.md` §8.

### H.4 `docs/backfill-report.md` — ✅ GERADO

- Gerado por `scripts/report-backfill.ts` com `process.loadEnvFile(".env.local")`.
- Base: `libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io` (live).

### H.5 `DECISIONS_PENDING.md` — ✅ CONSOLIDADO

- Ficheiro canonical na raiz. `docs/DECISIONS_PENDING.md` (duplicado) removido.

## Bloco I — Fechar FASE 3

### I.1 ScoreRatingBadge — ✅ RESOLVIDO

- `SourceReliabilityBadge` renomeado para `ScoreRatingBadge` (0–15, confiabilidade de fonte).
- **Removido do `PropertyCard` e de `/imovel/[id]`** — estava a receber score 0–100 → bug "85/15".
- Testes: `src/components/__tests__/PropertyCard.test.tsx` (score X/100) e `ScoreRatingBadge.test.tsx` (0–15).
- `grep -rn "<ScoreRatingBadge" src/` (excluindo testes) → 0 linhas.

### I.2 `rentability` fora dos rankings — ✅ TESTADO

- `src/lib/__tests__/oportunidades-rentability.test.ts` (2 testes, verde).

## Bloco K — FASE 7 (verificação)

### K.1 `verify-production.ts` no preview — ✅ OK

- URL: `https://radar-pro2-b61kmke0i-smpsandro1239s-projects.vercel.app`
- `/`, `/oportunidades`, `/leiloes` → 200 (×3 OK).
- **Nota:** `/leiloes` 404 em produção é esperado — `fase2-dev` não está em `main`.

### K.2 Logs via MCP `vercel` — ⏸️ OPCIONAL

- Bloqueado por SSO team access. Não é bloqueador de merge.

### K.3 UI via MCP `cdt` — ⏸️ OPCIONAL

- Screenshots capturados. Verificação visual: card não mostra "85/15".

### K.4 Deps via MCP `rea` — ⏸️ OPCIONAL

- `npm audit` → 2 vulnerabilidades moderadas com fix disponível. Não bloqueador.

### K.5 `SHOW_SEED_DATA` — ✅ TESTADO

- Teste em `src/lib/__tests__/data-origin.test.ts`. **Recomendação:** `false` (decisão humana).

## Bloco L — Encerramento

- L.1 ✅ `DECISIONS_PENDING.md` (11 bloqueadores humanos)
- L.2 ✅ Este ficheiro
- L.3 ✅ `npm run verify` verde (27 ficheiros, 207 testes, 0 it.fails)
- L.4 ✅ Commit final
- L.5 ✅ Push para `fase2-dev`

## Estado para merge

**Técnico:** ✅ Código verde, testes passam, build verde, preview 200.
**Produto:** ⚠️ Bloqueado por `DECISIONS_PENDING.md` §11 — live 100% demo. Não fazer merge para `main` até decisão.
