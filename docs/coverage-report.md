# Cobertura real — imóveis scrape ativos (72)

## Métricas atuais (2026-11-06, após restauro)

- Imóveis scrape ativos: **72**.
- Residential com score: **34** (apartment 20 + house 14).
- Imóveis com imagem: **15** Casa Sapo (100%) + 0 Martelo → display ~20.8% (15/72). Parser Martelo corrigido para extrair `fotos` (ver `src/lib/martelo-parser.ts`), writer persistir `images`.

## Distribuição por distrito (72 ativos)

| Distrito | Total | Com Score |
|---|---|---|
| Viseu | 15 | 3 |
| Leiria | 13 | 3 |
| Braga | 6 | 6 |
| Lisboa | 5 | 5 |
| Guarda | 5 | 1 |
| Porto | 4 | 4 |
| Coimbra | 4 | 4 |
| Beja | 4 | 0 |
| Castelo Branco | 3 | 1 |
| Setúbal | 2 | 0 |
| Porto | 2 | 1 |
| Bragança | 2 | 1 |
| Braga | 2 | 2 |
| Évora | 1 | 0 |
| Viana do Castelo | 1 | 1 |
| Santarém | 1 | 1 |
| Faro | 1 | 0 |
| Aveiro | 1 | 1 |

## Distritos com utilidade (≥3 imóveis com score)

- Viseu, Leiria, Braga, Lisboa, Porto, Coimbra, Beja, Guarda, Castelo Branco.

## Distritos com pouca cobertura (1-2)

- Setúbal, Porto, Bragança, Braga, Évora, Viana do Castelo, Santarém, Faro, Aveiro.

## Distritos vazios

- 10 de 20 distritos com imóveis ativos.

## Conclusão parcial

- 34 residential com score → suficiente para validação qualitativa; não para "melhores dos melhores" em todas as zonas.
