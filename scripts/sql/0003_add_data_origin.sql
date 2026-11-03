-- RadarPro Portugal - Migracao 0003: marca de origem dos dados
-- Distingue imoveis de dados de demonstracao (seed) de imoveis colhidos por
-- scraping. Sem esta coluna a aplicacao tem de adivinhar a origem pelo
-- formato do id (ver src/lib/data-origin.ts), o que e apenas uma heuristica.
--
-- A coluna e ADITIVA e NULLABLE: `NULL` significa "origem desconhecida".
-- Nao se reescreve nem se apaga nenhum dado.
--
-- Onde aplicar: apenas na base local (scripts/db-local.ts). A base live exige
-- aprovacao do dono (ver "Fila para o dono" em docs/PROGRESS.md).
--
-- O backfill NAO esta neste ficheiro de proposito: e feito por
-- scripts/backfill-data-origin.ts, que usa a mesma funcao de inferencia do
-- runtime (fonte unica de verdade) e corre em dry-run por omissao.

ALTER TABLE `properties` ADD COLUMN `data_origin` text;
