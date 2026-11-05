# Cobertura por distrito — dados reais (2026-11-05)

Consulta em live: `SELECT district, COUNT(*) as n FROM properties WHERE data_origin='scrape' AND is_active=1 GROUP BY district ORDER BY n DESC`.

## Distribuição

| Faixa | Distritos | Imóveis |
|---|---|---|
| **10+** (densidade boa) | Porto (28), Lisboa (26), Braga (26), Viseu (14), Leiria (13) | 107 |
| **5-9** (densidade OK) | Guarda (5) | 5 |
| **1-4** (densidade fraca) | Coimbra (4), Beja (4), Castelo Branco (3), Setúbal (2), Bragança (2), Évora (1), Santarém (1), Aveiro (1) | 23 |
| **0** (vazios) | Açores, Madeira, Faro, Lisboa Oeiras, ... | ? |

## Classificação por distrito

- **Porto** (28), **Lisboa** (26), **Braga** (26): super-densos — o `/melhores` tem material para top 5.
- **Viseu** (14), **Leiria** (13): bons — top 5 plausível.
- **Guarda** (5): limite mínimo para top 5.

## Observação

Com 130 imóveis reais (`data_origin='scrape'`), a cobertura actual favorece o Norte, Lisboa/Porto/Braga. Distritos do Sul (Faro, Setúbal) e Açores/Madeira têm 0 imóveis registados.

## Próximo passo

Escalar Imovirtual (`--limit 100`) + Martelo (paginação) + Casa Sapo (rate limit) para aumentar a densidade.
