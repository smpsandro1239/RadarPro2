-- 0005: corrigir unidades de auction_end_date (segundos -> milissegundos)
-- AUDITORIA (correr antes):
-- SELECT id, auction_end_date FROM properties WHERE auction_end_date IS NOT NULL AND auction_end_date < 1000000000000;
-- SELECT COUNT(*) FROM properties WHERE auction_end_date IS NOT NULL AND auction_end_date < 1000000000000;

UPDATE properties
SET auction_end_date = auction_end_date * 1000
WHERE auction_end_date IS NOT NULL AND auction_end_date < 1000000000000;

-- VERIFICACAO (correr depois):
-- SELECT COUNT(*) FROM properties WHERE auction_end_date IS NOT NULL AND auction_end_date < 1000000000000; -- deve ser 0