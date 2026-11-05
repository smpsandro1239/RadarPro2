# Qualidade dos dados scrape (2026-11-05)

Auditoria executada em live: `data_origin='scrape' AND is_active=1`.

## Metrica global (173 imoveis scrape)

| Campo | Count | % | Observação |
|---|---|---|---|
| total | 173 | 100% | Martelo 50 + Imovirtual ~80 + Casa Sapo ~28 + ... |
| com_area (`area_sqm`) | 50 | 29% | Só os 50 do Martelo (via area_efetiva/privativa). Imovirtual/Casa Sapo: 0. |
| com_score | 1 | 0.6% | Critico: so 1 imóvel tem score calculado. |
| com_imagem (`image_url`) | 0 | 0% | Nenhum scrape tem image_url (Imovirtual usa images JSON; Casa Sapo images JSON). |
| com_coords (`lat`) | 50 | 29% | Só Martelo. |

## Distribuicao por distrito (scrape, com_area / com_score)

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

## Amostra (20 sem score/area)

Amostra com `area_sqm IS NULL OR score IS NULL` devolveu a maior parte dos Martelo (com area, sem score). Os imoveis sem area concentram-se nas fontes Imovirtual/Casa Sapo (Lisboa/Porto/Braga com 0).

## Impacto

- `/melhores` so tem 1 imóvel rankeavel (o unico com score). O resto das listas de "melhores" está vazia.
- Backfill de area/score/imagem é prioridade para "os melhores dos melhores".

## Próximo passo

Fase 2: backfill de area (titulo), recalcular scores, backfill de imagens; depois re-verificar.
