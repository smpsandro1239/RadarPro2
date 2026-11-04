# Backfill Report — RadarPro (local.db)

Data: 2026-11-04

## Base de dados local
- 48 imóveis (demo, origem `demo`).
- `area_sqm` preenchido em 48/48 (100%) via backfill por tipologia.
- `market_value` / `score` preenchidos em 48/48 (100%).
- `rentability` > 0 em 43/48 (89.6%).
- Distribuição de scores: 60-79 → 20, 80-100 → 28.
- Por fonte: Casa Sapo 22, Millennium BCP 7, Santander 6, Montepio 5, Caixa Imobiliário 4, Crédito Agrícola 3, Imovirtual 1.
- Por distrito: Porto 19, Braga 15, Lisboa 14.
- Anomalias: 0 em todas as categorias. 0 URLs duplicadas.

## Produção (live Turso)
- 88 imóveis (48 demo + 40 scrape).
- area_sqm: 40/88 (45.5%) — apenas scrape tem área.
- market_value/score: 50/88 (56.8%).
- Imagens: demo tem URLs, scrape não tem (Martelo.pt não fornece fotos no dry-run).

## Ações pendentes para produção
1. Aplicar migrações 0002/0003/0004 na live (parish, area_sqm, data_origin, opening_bid).
2. Correr backfill-images contra a live (com --write) para os 40 scrape.
3. Correr backfill-area contra a live para os 48 demo.
4. Correr backfill-scores contra a live.
5. Rever os 15 imóveis `mixed` (classify.ts melhorado).
