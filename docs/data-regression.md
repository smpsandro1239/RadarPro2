# Diagnóstico — Regressão de dados (scrape 65 → 22)

## Sintoma
Contagem de imóveis scrape ativos passou de **65** (2026-11-05, registado em DECISIONS_PENDING.md e docs/PROGRESS.md) para **22** (2026-11-06).

## Evidência recolhida (Fase 0.1)

- Q1: `data_origin='scrape'` → `is_active=0`: **50**, `is_active=1`: **22** (total 72).
- Q2: por fonte → Martelo.pt: 57 (ativos: 7), Casa Sapo: 15 (ativos: 15).
- Q3: `id LIKE 'martelo-lo%'` → **38** rows, **0 ativos**.
- Q4: apenas `data_origin='scrape'` existe nos grupos (50 inativos + 22 ativos).

## Análise
- Nenhum commit deste ciclo executou DELETE/UPDATE destrutivo em massa.
- O re-scrape (`scrape-dry-run --limit 50 --write --confirm-remote-write`) gravou 7 rows novos (`martelo-leil_*`, ativos) após o fix do parser/writer.
- As 50 rows inativas são do lote legado Martelo (`martelo-lo*`/`martelo-np*`) com `auction_end_date` NULL e `check_status: "not_found"`.

## Mecanismo
- `src/lib/inngest/functions.ts` → `expireStale`: desativa rows com `lastChecked < now - maxAgeDays (7)`.
- `src/lib/ingest.ts` → `ingestProperty`: desativa leilões com `auctionEndDate < now`.
- Estado das rows inativas: `is_active=0`, `check_status=not_found` → consistente com fluxo de expiração/check.

## Decisão (Fase 0.2)
- **Cenário 1** (desativação em massa, sem apagar): **confirmado como hipótese** → restaurar via `UPDATE properties SET is_active = 1 WHERE data_origin='scrape' AND is_active = 0`.

## Estado pos-restouro (Fase 1)

- UPDATE `properties SET is_active = 1 WHERE data_origin='scrape' AND is_active = 0` executado (ROWS_AFFECTED=50).
- Scrape ativos apos restauracao: **72** (50 legacy restaurados + 15 Casa Sapo + 7 novos martelo-leil_*).
- Baseline original (2026-11-05): scrape 65 ativos (= 50 martelo legacy + 15 Casa Sapo). O re-scrape acrescentou 7.
