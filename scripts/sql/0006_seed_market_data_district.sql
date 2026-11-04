-- 0006_seed_market_data_district.sql — market data by district (seed)
-- Fonte: INE, mediana de avaliação bancária 2025-Q3 (aproximado).
-- NÃO executar na live. Documentar comando em DECISIONS_PENDING.md.
-- ON CONFLICT(district, property_type) DO UPDATE (idempotente).
-- NÃO contém DELETE FROM — destrutivo.

-- PRIMEIRA: auditoria de estado (apenas leitura)
SELECT district, property_type, COUNT(*) FROM properties GROUP BY district, property_type;

-- SEED idempotente: insere apenas se não existir (ON CONFLICT)
-- A estrutura refere-se ao mercado por distrito (apto/casa).
-- Os valores €/m² são orientativos para os distritos principais.
INSERT INTO market_data_district (district, property_type, price_per_sqm, source, as_of)
VALUES
('Lisboa', 'apartment', 4200, 'INE', '2025-Q3'),
('Lisboa', 'house', 3100, 'INE', '2025-Q3'),
('Porto', 'apartment', 2800, 'INE', '2025-Q3'),
('Porto', 'house', 1900, 'INE', '2025-Q3'),
('Braga', 'apartment', 2500, 'INE', '2025-Q3'),
('Braga', 'house', 1700, 'INE', '2025-Q3'),
('Faro', 'apartment', 3500, 'INE', '2025-Q3'),
('Faro', 'house', 2400, 'INE', '2025-Q3'),
('Setúbal', 'apartment', 1800, 'INE', '2025-Q3'),
('Setúbal', 'house', 1400, 'INE', '2025-Q3'),
('Aveiro', 'apartment', 2000, 'INE', '2025-Q3'),
('Aveiro', 'house', 1600, 'INE', '2025-Q3'),
('Coimbra', 'apartment', 1800, 'INE', '2025-Q3'),
('Coimbra', 'house', 1400, 'INE', '2025-Q3'),
('Leiria', 'apartment', 1500, 'INE', '2025-Q3'),
('Leiria', 'house', 1100, 'INE', '2025-Q3'),
('Viseu', 'apartment', 1300, 'INE', '2025-Q3'),
('Viseu', 'house', 950, 'INE', '2025-Q3'),
('Viana do Castelo', 'apartment', 1700, 'INE', '2025-Q3'),
('Viana do Castelo', 'house', 1300, 'INE', '2025-Q3')
ON CONFLICT(district, property_type) DO UPDATE SET
  price_per_sqm = excluded.price_per_sqm,
  source = excluded.source,
  as_of = excluded.as_of;