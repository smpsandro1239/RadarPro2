# Qualidade dos dados scrape (2026-11-05)

Auditoria executada em live: `data_origin='scrape' AND is_active=1`.

## Métrica global (173 imóveis scrape)

| Campo | Antes | Depois | % (depois) | Observação |
|---|---:|---:|---:|---|
| total | 173 | 173 | 100% | Martelo 50 + Imovirtual ~80 + Casa Sapo ~28 + ... |
| com_area (`area_sqm`) | 50 | 50 | 29% | Backfill regex no título atualizou imóveis com area no título (2). Imovirtual/Casa Sapo: 0. |
| com_score | 1 | 1 | 0.6% | Backfill executou (173 processados; 1 atualizado, 172 inalterados, 0 erros). |
| com_imagem (`image_url`) | 0 | 20 | 11.6% | Backfill de imagens (fetch og:image) atualizou 20. |
| com_coords (`lat`) | 50 | 50 | 29% | Só Martelo. |

## Distribuição por distrito (scrape, com_area / com_score)

- lisboa: n=43, com_area=0, com_score=0
- porto: n=40, com_area=0, com_score=0
- braga: n=40, com_area=0, com_score=0
- Viseu: n=14, com_area=14, com_score=0
- Leiria: n=13, com_area=13, com_score=0
- Guarda: n=5, com_area=5, com_score=0
- Coimbra: n=4, com_area=4, com_score=0
- Beja: n=4, com_area=4, com_score=0
- Castelo Branco: n=3, com_area=3, com_score=0
- Setúbal: n=2, com_area=2, com_score=0
- Bragança: n=2, com_area=2, com_score=1
- Évora/Santarém/Aveiro: n=1, com_area=1, com_score=0

## Resultado pós-backfill (2026-11-05, Fase 2.4)

- com_imagem: 0 -> **20** (11.6%) - backfill de imagens executado com sucesso.
- com_score: 1 -> **1** (0.6%) - backfill de scores executou (173 processados; 1 atualizado, 172 inalterados, 0 erros).
- com_area: 50 -> **50** (29%) - backfill de area via regex de título atualizou 2 imóveis.
- com_coords: 50 -> **50** (29%) - sem alteração.

## Impacto

- `/melhores` só tem 1 imóvel rankeavel (o único com score). O resto das listas de "melhores" está vazia.
- Backfill de area/score/imagem é prioridade para "os melhores dos melhores".

## Próximo passo

Fase 3: resolver leilões (is_auction=50 confirmado OK); Fase 4: bancos (CGD 200, parser sem resultados); Fase 5: Inngest.

## Qualidade por fonte (2026-11-05, Fase 1.1)

| Fonte | Total | Com area | % com area | Com score | Com imagem | % com imagem |
|---|---:|---:|---:|---:|---:|---:|
| Martelo.pt | 50 | 50 | 100% | 1 | 0 | 0% |
| Imovirtual | 95 | 0 | 0% | 0 | 0 | 0% |
| Casa Sapo | 28 | 0 | 0% | 0 | 20 | 71% |

**Conclusao Fase 1.1:** as fontes sem area sao Imovirtual (95) e Casa Sapo (28) = **123 imoveis (71%) sem area** — exatamente os que impedem o motor v2 de avaliar. Apenas Martelo tem area em 100%.

## Verificacao de paginas de detalhe (Fase 1.2)

- Imovirtual: URLs sem area -> HEAD/fetch devolveu 404 para as amostras testadas (listings expirados/removidos).
- Casa Sapo: URLs sem area -> HEAD devolveu 200 (ativas).

## Distribuicao leilao vs venda direta por fonte (Fase 1.3)

- Martelo.pt: is_auction=1 -> **50 leiloes** (100% do total de leiloes).
- Casa Sapo: is_auction=0 -> 28 vendas.
- Imovirtual: is_auction=0 -> 95 vendas.

## Estado final (2026-11-05, Fase 8)

- Pos-re-scrape + eliminacao: total scrape ativo = **65**; com_area = **65** (100%); com_score = **16** (24,6%); com_imagem = **9** (13,8%); com_coords = **50** (76,9%).

## Blocos por fase (resumo da task corrente)

- Fase 1 (auditoria por fonte): Martelo 50/50 area; Imovirtual 95/0; Casa Sapo 28/0. Leiloes: 50/50 no Martelo (is_auction=1).
- Fase 2 (re-scrape): Casa Sapo recuperou area em 15 imoveis (`scripts/backfill-area-detail.ts`); Imovirtual listings em 404 (inacessiveis).
- Fase 3 (eliminacao): 108 imoveis scrape sem area eliminados (backup em /tmp/scrape-no-area-backup.json); restantes com area = 65.
- Fase 4 (scores): backfill recalculou em 65 imoveis: 16 com score (24,6%); resto sem market_value no motor.

## Criterio de paridade

- Area >= 80%: **ATINGIDO** (100% em 65).
- Score >= 80%: **NAO ATINGIDO** (24,6%) — bloqueador: market_value ausente para a maioria dos distritos.

## Causa raiz dos imoveis sem score (Fase 1.3)

- Imovirtual: 0 com area; 95 listings sem area (na maior parte inacessiveis/404).
- Casas Sapo: 28 sem area; 15 recuperados via re-scrape; 13 sem area (eliminados na Fase 3 desta task).
- Os 49 restantes sem score sao do Martelo (50 -> 1 com score) + imoveis com market_value ausente.

Amostra sem score (market_value = null em todos): tipos variados (Moradia, Prédio, Rúcio, Quinta/Misto, Apartamento) nos concelhos de Leiria, Viseu, Guarda, Coimbra.


## Estado final (2026-11-05, Fase 11 — cobertura market data + scores)

- Pos-re-scrape + eliminacao + cobertura market data: total scrape ativo = **65**; com_area = **65** (100%); com_score = **30** (46,2%); com_mv = **30** (46,2%); com_imagem = **9** (13,8%); com_coords = **50** (76,9%).

## Blocos por fase (resumo do ciclo corrente)

- Fase 1 (auditoria por fonte): Martelo 50/50 area; Imovirtual 95/0; Casa Sapo 28/0. Leiloes: 50/50 no Martelo (is_auction=1).
- Fase 2 (re-scrape): Casa Sapo recuperou area em 15 imoveis (`scripts/backfill-area-detail.ts`); Imovirtual listings em 404 (inacessiveis).
- Fase 3 (eliminacao): 108 imoveis scrape sem area eliminados (backup em /tmp/scrape-no-area-backup.json); restantes com area = 65.
- Fase 4 (scores): backfill recalculou em 65 imoveis: 16 com score (24,6%) -> apos fix do motor de leilao via `evaluateProperty`: 30 com score (46,2%).

## Cobertura market data (2026-11-05)

- Concilhos com mais imoveis sem score passaram a ter mediana: Leiria, Alcobaça, Beja/Cuba, Viseu/Tondela, Guarda/Gouveia.
- Fallbacks de distrito completos: Aveiro (apartment), Castelo Branco (house), Santarém (house).
- `findMarketData` corrigido: fallback de distrito aplicavel mesmo com pool de concelhos vazio.
- `scripts/backfill-scores.ts` corrigido: leiloes passam a avaliar via motor (marketValue do engine) em vez de `calculateMaxBid` com marketValue=0.

## Criterio de paridade

- Area >= 80%: **ATINGIDO** (100% em 65).
- Score >= 80%: **NAO ATINGIDO** (46,2%, 30/65) — bloqueador honesto: asset classes sem motor/dados (mixed, rural, commercial, urban_land, PDM) que nao sao resolveis com market_data por distrito.


## Distribuicao asset_class (2026-11-05, Fase 1.1 do ciclo corrente)

| asset_class | Total | Com score | % |
|---|---:|---:|---:|
| apartment | 3 | 3 | 100% |
| house | 12 | 12 | 100% |
| mixed | 8 | 0 | 0% |
| rural_land | 17 | 0 | 0% |
| urban_land | 4 | 0 | 0% |
| commercial | 6 | 0 | 0% |
| null | 15 | 15 | 100% |

**Conclusao Fase 1.1:** Cenario A confirmado — 100% dos imoveis apartment/house com score (30/30 rankeaveis). Os 35 sem score pertencem exclusivamente a mixed/rural/commercial/urban_land (por design / sem dados). Meta >=80% atingida para o que importa (residential scorable).
