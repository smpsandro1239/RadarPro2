# Price Tracking — Estado e Limitações

## O que funciona

- Deteção automática no ingest (`price_down`, `price_up`, `bid_up`, `bid_down`).
- Histórico em `price_history` (85 entradas / 68 imóveis no âmbito atual).
- Cron Inngest `check-price-changes` (`src/inngest/functions/check-price-changes.ts`, agendado `0 9-22 * * *`).
- Script standalone `scripts/check-price-changes-standalone.ts` com `--write --confirm-remote-write`.
- UI: badge de alteração no card, `/leiloes` com lances recentes, `/imovel/[id]` com histórico, `/baixaram` com quedas.

## O que não funciona (e porquê)

- Antes do fix (2026-11-06): nenhum leilão tinha `auction_end_date` → o check nunca tinha alvo (<24h) → 0 deteções.
- Causa raiz: `isPropertyEvent` do parser do Martelo esperava `tipo === "imovel"`, API devolve `Imoveis`/`Imóveis` → eventos descartados; e `writeRows` do scrape descartava a coluna `auction_end_date`.
- Após o fix: parser + writer corrigidos; re-scrape (`--limit 50 --write --confirm-remote-write`) gravou 7 leilões com `auction_end_date`.

## Teste end-to-end (2026-11-06, Fase 4)

- Leilão escolhido no intervalo <24h: `martelo-leil_leilosil_353` (fim previsto ~2026-11-06).
- `current_bid` forçado para sentinel (12345) → `check-price-changes-standalone --write --confirm-remote-write` → alteração detetada → insert em `price_history`.
- Cleanup: rows de teste removidos e `current_bid` restaurado. Estado final: `price_history` = 85 entradas.

## Limitações conhecidas

- `price_history` não tem coluna `change_type` (schema autoritativo: id, property_id, price, market_value, recorded_at).
- Extração de lance via regex HTML (`extractPrice`) — pode falhar ou devolver valores arbitrários.
- Para leilões, `currentBid` está null na maioria (scrape usa `price`; `max_bid` é o canónico para leilões).

## Como desbloquear o price tracking

1. Fonte com lances/preços variáveis em leilão (Martelo premium ou Apify, ~5 USD de crédito).
2. Mapear URLs originais (Imovirtual/Casa Sapo) — bloqueadas.
3. Backfill dos leilões legados (`martelo-lo*`) quando a API Martelo disponibilizar mais eventos.
