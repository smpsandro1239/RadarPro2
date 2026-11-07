# Motor de avaliação P0
Dispatcher aceita assetClass/asset_class. unknown/mixed não são convertidos em apartamentos. Leilões sem marketValue fundamentado não recebem maxBid artificial. Backfill usa evaluateProperty e mantém score (0–100) separado de maxBid (€). Confiança muito baixa ou avaliação nula são ignoradas. AVM carece de calibração com comparáveis reais por classe e zona.
