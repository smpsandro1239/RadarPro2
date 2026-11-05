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

### F. Verificação em produção — ✅ OK

- `npx vercel --prod` → deployment `dpl_EsMgPQ62JdyGUfCLfUNFGWQ5iR6v` (commit `09cb4c0`) → **READY**, target production.
- Preview `https://radar-pro2-b61kmke0i-smpsandro1239s-projects.vercel.app/` → acesso anónimo bloqueado por Vercel Deployment Protection (redirect para Vercel login).
- DB live: `data_origin` `[{"demo":200},{"scrape":45}]` (45 imóveis reais do Martelo.pt).

## Bloco L — Encerramento

- L.1 ✅ `DECISIONS_PENDING.md` (11 bloqueadores humanos)
- L.2 ✅ Este ficheiro
- L.3 ✅ `npm run verify` verde (27 ficheiros, 207 testes, 0 it.fails)
- L.4 ✅ Commit final
- L.5 ✅ Push para `fase2-dev`

## Trabalho técnico pós-fecho — Ativação ingest Martelo.pt

### T1 — Fix CJS/ESM no scrape-dry-run.ts (Bloque A)
- Commit: `771537c`
- Resultado: `--limit 2` executa (dry-run OK; 2 imóveis com área/freguesia/preço/coordenadas; 0 mercado/avaliação).
- Bloqueios: nenhum

### T2 — Flag `--confirm-remote-write` (Bloque B)
- Commit: `8340973`
- Resultado: recusa sem flag (exit 1); com flag escreve contra base remota.
- Bloqueios: nenhum

### T3 — Carga `.env.local` no scrape-dry-run.ts
- Commit: `3f4c7b0`
- Resultado: base resolve para a live (`libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io`).
- Bloqueios: nenhum

### T4 — Escrita controlada (limit 5) na live
- Commit: `a1e73dc`
- Resultado: 5 registos gravados na live; `data_origin` → `[{"demo":200},{"scrape":5}]`.

### T5 — Escala para 45 imóveis reais (limit 100) na live
- Commit: `feat(ingest): 45 imoveis reais do Martelo.pt na live`
- Resultado: 45 registos gravados na live; `data_origin` → `[{"demo":200},{"scrape":45}]`.
- Bloqueios: nenhum

### T6 — Escalar Martelo.pt ate esgotar (novo bloco A)
- Commit: `feat(ingest): escalar Martelo.pt para 45 imoveis reais` (docs)
- Resultado: `--limit 500 --write --confirm-remote-write` → 45 registos gravados; `data_origin` permanece `[{"demo":200},{"scrape":45}]` → A.3: API tem ~45 eventos acessiveis.
- Bloqueios: nenhum

### T7 — Ingest bancos (novo bloco B) — BLOQUEADO TECNICO
- Commit: `feat(ingest): bancos via HTML publico, M imoveis reais` (nao executado)
- Resultado: `npx tsx scripts/ingest-banks.ts --limit 5 --dry-run` falhou 2x (`Cannot find module .../css-what/lib/commonjs/types.ts`, cheerio stack) → avancar para bloco C.
- Bloqueios: erro exato acima (registo em DECISIONS_PENDING.md §7).

### T8 — Ingest leilões (novo bloco C) — BLOQUEADO TECNICO
- Commit: `feat(ingest): leiloes via HTML publico, K imoveis reais` (nao executado)
- Resultado: `npx tsx scripts/ingest-auctions.ts --limit 5 --dry-run` falhou 2x (mesmo erro cheerio/css-what via `src/lib/scrapers.ts`) → avancar para bloco D.
- Bloqueios: erro exato acima (registo em DECISIONS_PENDING.md §7).

## Trabalho técnico pós-fecho 2 — Escalar dados reais e automatizar (2026-11-05)

### Bloco A — Escalar Martelo.pt até esgotar — ✅ CONCLUÍDO
- A.1: `npx tsx scripts/scrape-dry-run.ts --limit 500 --write --confirm-remote-write` → 45 registos gravados; `data_origin` permanece `[{"demo":200},{"scrape":45}]`.
- A.2/A.3: N=45 → API tem ~45 eventos acessíveis → registado e avançado.
- Commit: `feat(ingest): escalar Martelo.pt para 45 imoveis reais` (docs)

### Bloco B — Ingest bancos — ❌ BLOQUEADO TECNICO
- B.1: parsers existem (`scrapeAllBanks` em `src/lib/scrapers.ts`).
- B.2: `scripts/ingest-banks.ts` criado; B.4 `--dry-run` falhou 2× (`Cannot find module .../css-what/lib/commonjs/types.ts`) → registado em `DECISIONS_PENDING.md` §7, avançado.
- Commit: `feat(ingest): bancos via HTML publico, M imoveis reais` (nao executado)

### Bloco C — Ingest leilões — ❌ BLOQUEADO TECNICO
- C.1: parser existe (`scrapeELeiloes` em `src/lib/scrapers.ts`).
- C.2/C.3: `scripts/ingest-auctions.ts` criado; C.4 `--dry-run` falhou 2× (mesmo erro cheerio/css-what) → avançado.
- Commit: `feat(ingest): leiloes via HTML publico, K imoveis reais` (nao executado)

### Bloco D — Automatizar Inngest cron — ✅ CONCLUÍDO (código)
- D.2/D.3: `src/inngest/functions/daily-ingest.ts` (cron `0 6 * * *`, `step.run` → scrape `--limit 100 --write --confirm-remote-write`) + registado em `/api/inngest`.
- D.4: keys `INNGEST_EVENT_KEY`/`INNGEST_SIGNING_KEY` ausentes → `DECISIONS_PENDING.md` §8; função criada, **não ativada** em produção.
- Commit: `feat(cron): ingest diario Martelo.pt via Inngest` (`baca45c`)

### Bloco E — MARKET_DATA_DISTRICT com 20 distritos INE — ✅ CONCLUÍDO
- E.1–E.5: tabela `MARKET_DATA_DISTRICT` preenchida (20 distritos) + fallback distrito; 14 testes market-data verdes.
- E.6 commit: `feat(valuation): MARKET_DATA_DISTRICT com 20 distritos INE` (`3ff9dae`)

### Bloco F — DemoDataBanner — ✅ CONCLUÍDO
- F.1–F.5: `src/components/DemoDataBanner.tsx` (flag `SHOW_SEED_DATA` + prop `demoCount`), layout atualizado, `SeedDataBanner` removido, 2 testes.
- F.5 commit: `feat(ui): DemoDataBanner para live com dados mistos` (`b2dcf8f`)
- F.4: suite verde (29 ficheiros / 212 testes)

### Bloco G — Reclassificar mixed — ✅ CONCLUÍDO (dry-run)
- G.1: `scripts/reclassify-mixed.ts` (SELECT read-only + `deriveAssetClass`).
- G.2/G.3: 22 imóveis `mixed` analisados; 13 mudaram (9 → mixed, 1 → garage, 12 → urban_land); report em `docs/reclassify-mixed-report.md`.
- G.4 commit: `feat(pipeline): reclassify-mixed (14 imoveis, dry-run report)` (`eab9eec`)

### Bloco H — Verificação final e documentação — ✅ CONCLUÍDO
- H.1: `npm run verify` → typecheck ✓, typecheck:scripts ✓, tests 29/212 ✓, build ✓ (refeito após falha transitória de prerender `/estatisticas`).
- H.2: `npx tsx scripts/verify-production.ts https://radar-pro2.vercel.app` → `/`, `/oportunidades`, `/leiloes` → 200 OK.
- H.3/H.5/H.6: esta secção actualizada + commit `chore(release): escalar dados reais fase2-dev`.

### Estado final
- Live: `data_origin` = `[{"demo":200},{"scrape":45}]` — N final = 45 (Martelo.pt; API ~45 eventos acessíveis).
- Fontes reais ativas: 1 (Martelo.pt). Bancos (B) e leilões (C): bloqueados tecnicamente.
- Deploy produção: `dpl_EsMgPQ62JdyGUfCLfUNFGWQ5iR6v` (READY, commit `09cb4c0`).
- Human blockers: `DECISIONS_PENDING.md` §1–§8.

## Estado para merge

**Técnico:** ✅ Código verde, testes passam, build verde, preview 200.
**Produto:** ⚠️ Bloqueado por `DECISIONS_PENDING.md` §11 — live 100% demo. Não fazer merge para `main` até decisão.
