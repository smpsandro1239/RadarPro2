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
