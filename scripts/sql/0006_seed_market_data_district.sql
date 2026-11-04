-- 0006: seed de mediana de mercado por distrito (EUR/m2)
-- AUDITORIA (correr antes):
-- SELECT district, COUNT(*) FROM market_data_district GROUP BY district;
-- SELECT COUNT(*) FROM market_data_district;

-- Exemplo (substituir por valores reais de fonte oficial: INE / Confidencial Imobiliario):
-- INSERT INTO market_data_district (district, price_per_sqm, source, as_of, property_type)
-- VALUES ('Lisboa', 5200, 'INE', '2026-05', 'apartment')
-- ON CONFLICT(district, property_type) DO UPDATE SET
--   price_per_sqm = excluded.price_per_sqm,
--   source = excluded.source,
--   as_of = excluded.as_of;

-- NOTA: a tabela market_data_district pode nao existir na live. Criar se necessario:
-- CREATE TABLE IF NOT EXISTS market_data_district (
--   district TEXT NOT NULL,
--   property_type TEXT NOT NULL,
--   price_per_sqm REAL NOT NULL,
--   source TEXT NOT NULL,
--   as_of TEXT NOT NULL,
--   PRIMARY KEY (district, property_type)
-- );

-- Os valores reais (308 municipios) devem ser confirmados pelo dono antes de executar.
-- Este ficheiro e um template; nao executar sem revisao.