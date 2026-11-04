-- 0006_seed_market_data_district.sql — market data by district (seed)
-- Fonte: INE, mediana de avaliação bancária 2025-Q3 (aproximado).
-- NÃO executar na live. Documentar comando em DECISIONS_PENDING.md.
-- INSERT ... ON CONFLICT(district, property_type) DO UPDATE.

-- PRIMEIRA: auditoria de estado
SELECT district, property_type, COUNT(*) FROM properties GROUP BY district, property_type;

-- LIMPAÇÃO PREVENTIVA (conservadora)
DELETE FROM market_data;

INSERT INTO market_data (district, property_type, price_per_sqm) VALUES
-- Lisboa
('lisboa', 'apartment', 4200),
('lisboa', 'house', 3100),
-- Porto
('porto', 'apartment', 2800),
('porto', 'house', 1900),
-- Braga
('braga', 'apartment', 2500),
('braga', 'house', 1700),
-- Faro
('faro', 'apartment', 3500),
('faro', 'house', 2400),
-- Setúbal
('setubal', 'apartment', 1800),
('setubal', 'house', 1400),
-- Aveiro
('aveiro', 'apartment', 2000),
('aveiro', 'house', 1600),
-- Coimbra
('coimbra', 'apartment', 1800),
('coimbra', 'house', 1400),
-- Leiria
('leiria', 'apartment', 1500),
('leiria', 'house', 1100),
-- Viseu
('viseu', 'apartment', 1300),
('viseu', 'house', 950),
-- Viana do Castelo
('viana_do_castelo', 'apartment', 1700),
('viana_do_castelo', 'house', 1300),
-- Évora
('evora', 'apartment', 1300),
('evora', 'house', 1000),
-- Santarém
('santarem', 'apartment', 1200),
('santarem', 'house', 900),
-- Beja
('beja', 'apartment', 1100),
('beja', 'house', 850),
-- Bragança
('braganca', 'apartment', 1200),
('braganca', 'house', 900),
-- Castelo Branco
('castelo_branco', 'apartment', 1200),
('castelo_branco', 'house', 900),
-- Guarda
('guarda', 'apartment', 1100),
('guarda', 'house', 850),
-- Portalegre
('portalegre', 'apartment', 1000),
('portalegre', 'house', 750),
-- Vila Real
('vila_real', 'apartment', 1000),
('vila_real', 'house', 750),
-- Açores
('ilha_de_flores', 'apartment', 1300),
('ilha_de_flores', 'house', 1100),
-- Madeira
('madeira', 'apartment', 2800),
('madeira', 'house', 2400);
