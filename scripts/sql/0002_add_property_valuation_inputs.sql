-- RadarPro Portugal - PROPOSTA de migracao (NAO APLICADA)
-- Fase 1 do motor de avaliacao v2: colunas de entrada que o motor consome e
-- que a tabela `properties` ainda nao tem. Ver src/lib/valuation/__tests__/schema-contract.test.ts
-- (teste de contrato) para a lista canonica e a justificacao de cada campo.
--
-- Todas as colunas sao ADITIVAS e NULLABLE: nao há backfill nem reescrita de dados.
-- Nao destroi dados existentes. A aplicacao (drizzle-kit push) so acontece depois de aprovacao.
--
-- Como aplicar (depois de aprovacao, e em conjunto com a atualizacao de src/db/schema.ts):
--   1. atualizar src/db/schema.ts com as mesmas colunas (o runtime faz select de todas
--      as colunas declaradas -> schema e base de dados tem de mudar no mesmo passo);
--   2. npx drizzle-kit push   (dialect: turso, ver drizzle.config.ts)
--
-- Risco de ordem errada: se o schema for atualizado e o push nao for feito, todo o
-- `db.select().from(properties)` passa a pedir colunas inexistentes -> site com erro.
-- Por isso schema.ts fica intacto ate haver aprovacao.

ALTER TABLE `properties` ADD COLUMN `parish` text;
ALTER TABLE `properties` ADD COLUMN `area_sqm` real;
ALTER TABLE `properties` ADD COLUMN `floor` integer;
ALTER TABLE `properties` ADD COLUMN `total_floors` integer;
ALTER TABLE `properties` ADD COLUMN `orientation` text;
ALTER TABLE `properties` ADD COLUMN `condition` text;
ALTER TABLE `properties` ADD COLUMN `energy_cert` text;
-- Booleanos ficam NULL (= desconhecido) e nao DEFAULT 0: um 0 por omissao seria
-- afirmar "sem garagem / sem elevador / sem vista" sobre imoveis que nao foram
-- raspados, e o motor aplicaria um ajuste hedonico falso.
ALTER TABLE `properties` ADD COLUMN `has_garage` integer;
ALTER TABLE `properties` ADD COLUMN `has_elevator` integer;
ALTER TABLE `properties` ADD COLUMN `has_view` integer;
ALTER TABLE `properties` ADD COLUMN `topography` text;
ALTER TABLE `properties` ADD COLUMN `road_frontage_meters` real;
ALTER TABLE `properties` ADD COLUMN `land_use` text;
ALTER TABLE `properties` ADD COLUMN `cap_rate` real;
ALTER TABLE `properties` ADD COLUMN `annual_rent` real;
ALTER TABLE `properties` ADD COLUMN `yield_pct` real;
ALTER TABLE `properties` ADD COLUMN `market_cap_rate` real;
