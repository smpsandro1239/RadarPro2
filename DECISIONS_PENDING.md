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

## Ordem das migrações (executar sequencialmente)
1. `turso db fork radarpro2 radarpro2-backup-<data>`
2. `turso db shell radarpro2 < scripts/sql/0002_add_property_valuation_inputs.sql`
3. `turso db shell radarpro2 < scripts/sql/0003_add_data_origin.sql`
4. `turso db shell radarpro2 < scripts/sql/0004_add_opening_bid.sql`
5. `turso db shell radarpro2 < scripts/sql/0005_fix_auction_end_date.sql`
6. Verificar: `turso db shell radarpro2 "PRAGMA table_info(properties);"` (não usar `.schema`)
7. Redeploy na Vercel.

## Verificação do schema (correta)
Usar `PRAGMA table_info(properties)` — `.schema` mostra o SQL original de criação, não as colunas adicionadas por ALTER TABLE.

## 8. Token Turso
- **O que fazer:** rodar token vazado (fingerprint `1bb0c1abb032`).
- **Decisão recomendada:** rodar antes de qualquer deploy público.
- **Risco:** acesso não autorizado à BD.