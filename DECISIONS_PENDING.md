# Decisões pendentes (bloqueadores humanos)

## 1. Migrações na live (0002/0003/0004)
- **O que fazer:** aplicar `scripts/sql/0002_*.sql`, `0003_*.sql`, `0004_*.sql` na base Turso.
- **Comando:** `turso db shell radarpro2 < scripts/sql/0002_*.sql` (com fork prévio).
- **Decisão recomendada:** aplicar todas de uma vez, com fork de backup.
- **Risco se não fizer:** app quebra em produção (colunas parish, area_sqm, data_origin, opening_bid não existem na live).

## 2. auction_end_date na live
- **O que fazer:** `UPDATE properties SET auction_end_date = auction_end_date * 1000 WHERE auction_end_date IS NOT NULL AND auction_end_date < 1000000000000;`
- **Decisão recomendada:** aplicar após fork.
- **Risco:** contagem regressiva de leilões errada.

## 3. SHOW_SEED_DATA
- **O que fazer:** definir na Vercel (Production + Preview).
- **Decisão recomendada:** `false` (demo não visível em produção).
- **Risco:** demo data visível publicamente se `true`.

## 4. CRON_SECRET
- **O que fazer:** definir na Vercel (Production + Preview).
- **Decisão recomendada:** definir e testar com `curl`.
- **Risco:** crons recusam acesso (401).

## 5. Chave Martelo.pt + uso comercial
- **O que fazer:** obter chave API e confirmar uso comercial permitido.
- **Decisão recomendada:** contactar Martelo.pt.
- **Risco:** scraping deixa de funcionar.

## 6. Portais "depende do dono"
- **O que fazer:** decidir Imovirtual, e-Leilões, Leilosoc, Bidizi, Santander, Caixa Imobiliário, Novo Banco.
- **Decisão recomendada:** confirmar ToS antes de scraping.
- **Risco:** risco legal.

## 7. Ampliação da tabela de mercado
- **O que fazer:** popular `MARKET_DATA_DISTRICT` com ~308 municípios (INE / Confidencial Imobiliário).
- **Decisão recomendada:** incremental, começar pelos 25 existentes + distritos principais.
- **Risco:** 90% do feed sem avaliação.

## 8. Token Turso
- **O que fazer:** rodar token vazado (fingerprint `1bb0c1abb032`).
- **Decisão recomendada:** rodar antes de qualquer deploy público.
- **Risco:** acesso não autorizado à BD.