# Backfill Report — RadarPro (local.db)

Data: 2026-11-04

## Base de dados local
- 48 imóveis (demo, origem `demo`).
- `area_sqm` preenchido em 48/48 (100%) via backfill por tipologia.
- `image_url` preenchido em 22/48 (45.8%) via backfill-images. 25 imóveis de bancos não processados (fonte fora da lista de prioridade). 1 sem imagem encontrada.
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
- Imagens: demo tem URLs (22/48 após backfill-images), scrape não tem (Martelo.pt não fornece fotos no endpoint usado).

## Análise de scores em falta (17/40 scrape)
Causa principal: market_data ausente para o município (tabela cobre ~25 de 308 municípios).
- ~15 imóveis `mixed` (prédio) → sem avaliação por design (requer avaliação manual).
- ~2 sem área (edge cases do parser).
- ~12 sem market_data para o município.
Mitigação: normalização de acentos (já feita), expansão da tabela de mercado (WP pendente).

## Reclassificação `mixed`
classify.ts melhorado: "prédio rústico" → rural_land, "prédio urbano" → mixed, "prédio" sozinho → apartment se tiver tipologia. Medição real pendente de execução contra produção.

## Ações pendentes para produção
1. Aplicar migrações 0002/0003/0004 na live (parish, area_sqm, data_origin, opening_bid).
2. Correr backfill-images contra a live (com --write) para os 40 scrape.
3. Correr backfill-area contra a live para os 48 demo.
4. Correr backfill-scores contra a live.
5. Rever os 15 imóveis `mixed` (classify.ts melhorado).
